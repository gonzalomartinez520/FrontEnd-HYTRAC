import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  apiClient as api,
  canNotificarEntrega,
  envios,
  getOrdenEstado,
  getPrimaryActionKey,
  transportista as transportistaApi,
} from "@/api";
import "../styles/iniciarViaje.css";
import { useTranslation } from "react-i18next";
import TokenInput from "@/components/TokenInput";

// 🔹 1. Actualizado para usar locale y fallback dinámicos
const formatDate = (value, fallbackText = "-", locale = "es-AR") => {
  if (!value) return fallbackText;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
};

// 🔹 2. Fallback dinámico pasado por parámetro (cambiado a null por defecto para evitar crasheos de fechas)
const getField = (envio, keys, fallback = null) => {
  for (const key of keys) {
    const value = envio?.[key];

    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }

  return fallback;
};

// 🔹 3. Modificado para recibir la función de traducción 't'
const formatEstado = (value, t) => {
  if (!value) return t("status.sin_estado", "Sin estado");

  // Limpiamos y normalizamos la clave que viene de la base de datos
  const key = String(value).toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // Igual que en el StatusBadge, mapeamos las variaciones
  const mapping = {
    "en viaje": "en_curso",
    "en_viaje": "en_curso",
    "en curso": "en_curso",
    "en_curso": "en_curso",
    "cancelado": "cancelado",
    "cancelada": "cancelado",
    "entregado": "entregado",
    "entregada": "entregado",
    "confirmado": "confirmado",
    "rechazado": "rechazado",
    "pendiente": "pendiente",
    "pendiente confirmar": "pendiente_confirmar",
    "pendiente_confirmar": "pendiente_confirmar",
    "pendiente de confirmar": "pendiente_confirmar",
    "pendiente a confirmar": "pendiente_confirmar",
    "pendiente de confirmacion de entrega": "pendiente_confirmacion_entrega",
    "pendiente_confirmacion_entrega": "pendiente_confirmacion_entrega",
    "pendiente de inicio de viaje": "pendiente_inicio_viaje",
    "pendiente_inicio_viaje": "pendiente_inicio_viaje",
    "activo": "activo",
    "no activo": "no_activo",
    "no_activo": "no_activo"
  };

  const estadoKey = mapping[key] || key.replace(/\s+/g, "_");

  // Devolvemos la traducción del archivo common.json
  return t(`status.${estadoKey}`, String(value).replace(/_/g, " "));
};

const resolveUpdatedOrden = (response, ordenActual) => {
  if (!response || typeof response !== "object" || Array.isArray(response)) {
    return ordenActual;
  }

  return { ...ordenActual, ...response };
};

export default function IniciarViaje({ user }) {
  const navigate = useNavigate();
  // 🔹 Cargamos ambos namespaces: el de la pantalla y el general (para los estados)
  const { t: tTransportista, i18n } = useTranslation("transportista");
  const { t: tCommon } = useTranslation("common"); 
  const currentLocale = i18n.language || "es-AR";

  const { ordenId } = useParams();
  const [loading, setLoading] = useState(true);
  const [shipment, setShipment] = useState(null);
  const [error, setError] = useState("");
  const [errorToken, setErrorToken] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");
  const transportistaId = user?.transportistaId ?? user?.id ?? user?.usuarioId ?? null;

  const shouldNotificarEntrega = useMemo(() => canNotificarEntrega(shipment), [shipment]);
  const primaryActionKey = useMemo(() => getPrimaryActionKey(shipment), [shipment]);

  const [showTokenModal, setShowTokenModal] = useState(false);
  const [token, setTokenKey] = useState(0);
  const handleTokenComplete = async (code) => {
    try {
        setErrorToken("");
        await handlePrimaryAction(code);
        setShowTokenModal(false);
    } catch (err) {
        setErrorToken("El token es incorrecto");
        setTokenKey((k) => k + 1); // remonta el componente y limpia los casilleros
    }
};

  const reloadShipment = async () => {
    if (!ordenId) {
      return null;
    }

    if (transportistaId) {
      const asignados = await transportistaApi.getEnviosAsignados(transportistaId, user?.legajo);
      const orden = Array.isArray(asignados)
        ? asignados.find((item) => String(item?.id) === String(ordenId)) ?? null
        : null;

      if (orden) {
        return orden;
      }
    }

    return envios.getById(ordenId);
  };

  useEffect(() => {
    let isMounted = true;

    const loadShipment = async () => {
      if (!ordenId) {
        setError(tTransportista("iniciarViaje.error.title"));
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data = await reloadShipment();

        if (isMounted) {
          setShipment(data);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(
            requestError?.response?.data?.message ||
            requestError?.message ||
            tTransportista("iniciarViaje.error.title")
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadShipment();

    return () => {
      isMounted = false;
    };
  }, [ordenId, transportistaId]);

  const handlePrimaryAction = async (tokenFromModal) => {
    if (!ordenId || isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);
      setFeedback("");

      if (shouldNotificarEntrega) {
        const response = await transportistaApi.notificarEntrega(ordenId, {
          legajoTransportista: localStorage.getItem("legajo"),
          codigoConfirmacion: tokenFromModal
        });

        const refreshed = await reloadShipment();

        setShipment((prev) => resolveUpdatedOrden(response, refreshed || prev));
        setFeedback(tTransportista("iniciarViaje.feedback.notifySuccess"));
        return;
      }

      const payload = {
        estado: "EN_VIAJE",
        motivo: "Envio confirmado desde el panel de transportista",
        usuario: user?.username || user?.nombre || "transportista-web",
        legajoTransportista: localStorage.getItem("legajo"),
      };

      await api.put(`/transportista/orden/${ordenId}/iniciar-viaje`, payload);

      const refreshed = await reloadShipment();

      setShipment(
        (prev) =>
          resolveUpdatedOrden(refreshed, prev ? { ...prev, estado: "EN_CURSO" } : prev)
      );
      setFeedback(tTransportista("iniciarViaje.feedback.confirmSuccess"));
    } catch (requestError) {
      setFeedback(
        requestError?.response?.data?.message ||
        requestError?.message ||
        tTransportista("iniciarViaje.feedback.actionError")
      );

      throw requestError;

    } finally {
      setIsSubmitting(false);
    }
  };

  const noDataText = tTransportista("dashboard.detail.noData", "Sin dato");
  const pendingText = tTransportista("dashboard.detail.pending", "Pendiente");

  const origen = getField(shipment, ["plantaDespachoNombre", "plantaDespacho", "origen", "puntoOrigen"], noDataText);
  const destino = getField(shipment, [
    "destino",
    "puntoDestino",
    "estacionDestino",
    "estacionDestinoNombre",
    "plantaDestino",
  ], noDataText);
  const combustible = getField(shipment, ["combustibleTipo", "tipoCombustible", "combustible"], noDataText);
  const estadoActual = getOrdenEstado(shipment) || "Sin estado";

  return (
    <main className="iniciar-viaje-screen">
      <section className="iniciar-viaje-shell">
        <button type="button" className="back-link" onClick={() => navigate("/transportista")}>
          ← {tTransportista("iniciarViaje.back")}
        </button>

        <header className="iniciar-viaje-hero">
          <div>
            <p className="eyebrow">{tTransportista("iniciarViaje.eyebrow")}</p>
            <h1>{tTransportista("iniciarViaje.title", { id: ordenId })}</h1>
            <p>
              {tTransportista("iniciarViaje.subtitle")}
            </p>
          </div>

          <div className="status-card">
            <span className="status-label">{tTransportista("iniciarViaje.status.label")}</span>
            <strong>{formatEstado(estadoActual, tCommon)}</strong>
            <small>
              {shouldNotificarEntrega
                ? tTransportista("iniciarViaje.status.nextNotify")
                : tTransportista("iniciarViaje.status.nextConfirm")}
            </small>
          </div>
        </header>

        {loading ? (
          <section className="iniciar-viaje-card">
            <span className="section-label">{tTransportista("iniciarViaje.loading.label")}</span>
            <h2>{tTransportista("iniciarViaje.loading.title")}</h2>
            <p>{tTransportista("iniciarViaje.loading.subtitle")}</p>
          </section>
        ) : error ? (
          <section className="iniciar-viaje-card">
            <span className="section-label">{tTransportista("iniciarViaje.error.label")}</span>
            <h2>{tTransportista("iniciarViaje.error.title")}</h2>
            <p>{error}</p>
          </section>
        ) : (
          <section className="iniciar-viaje-card">
            <div className="route-grid">
              <div>
                <span>{tTransportista("iniciarViaje.detail.origin")}</span>
                <strong>{origen}</strong>
              </div>
              <div>
                <span>{tTransportista("iniciarViaje.detail.destination")}</span>
                <strong>{destino}</strong>
              </div>
              <div>
                <span>{tTransportista("iniciarViaje.detail.fuel")}</span>
                <strong>{combustible}</strong>
              </div>
              <div>
                <span>{tTransportista("iniciarViaje.detail.departureDate")}</span>
                <strong>
                  {/* 🔹 Aplicada la traducción y el locale a la fecha */}
                  {formatDate(
                    getField(shipment, [
                      "fechaSalida",
                      "fecha_salida",
                      "fechaSalidaPlanta",
                      "salida",
                    ]),
                    pendingText,
                    currentLocale
                  )}
                </strong>
              </div>
            </div>

            <div className="action-panel">
              <button
                type="button"
                className={`primary-action ${shouldNotificarEntrega ? "primary-action--alt" : ""}`}
                onClick={async () => {
                // Si NO requiere token → ejecutar directo (ej: pasar a EN_CURSO)
                if (!shouldNotificarEntrega) {
                  await handlePrimaryAction();
                  return;
                }

                // Si requiere token → abrir modal
                setShowTokenModal(true);
              }}
                disabled={isSubmitting}
              >
                {tTransportista(`actions.${primaryActionKey}`)}
              </button>

              <p>
                {feedback ||
                  (shouldNotificarEntrega
                    ? tTransportista("iniciarViaje.status.nextNotify")
                    : tTransportista("iniciarViaje.status.nextConfirm"))}
              </p>
            </div>
          </section>
        )}
      </section>
        {showTokenModal && (
              <div className="modal-overlay">
                  <div className="modal token-modal">
                      <div className="token-modal-icon">
                          <i className="ti ti-shield-lock"></i>
                      </div>

                      <h2>Confirmar entrega</h2>
                      <p className="token-modal-subtitle">
                          Ingresá el código de 6 dígitos que te entrega el Jefe de Estación.
                      </p>

                      <TokenInput key={token} length={6} onComplete={handleTokenComplete} />

                      {errorToken && <span className="error">{errorToken}</span>}

                      <div className="modal-buttons">
                          <button
                              className="cancelar"
                              type="button"
                              onClick={() => {
                                  setShowTokenModal(false);
                                  setErrorToken("");
                              }}
                          >
                              Cancelar
                          </button>
                      </div>
                  </div>
              </div>
          )}
    </main>
  );
}