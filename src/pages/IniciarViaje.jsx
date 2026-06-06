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

const formatDate = (value) => {
  if (!value) return "Pendiente";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getField = (envio, keys, fallback = "Pendiente") => {
  for (const key of keys) {
    const value = envio?.[key];

    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }

  return fallback;
};

const formatEstado = (value) => {
  if (!value) return "Sin estado";

  return String(value)
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const resolveUpdatedOrden = (response, ordenActual) => {
  if (!response || typeof response !== "object" || Array.isArray(response)) {
    return ordenActual;
  }

  return { ...ordenActual, ...response };
};

export default function IniciarViaje({ user }) {
  const navigate = useNavigate();
  const { t: tTransportista } = useTranslation("transportista");
  const { ordenId } = useParams();
  const [loading, setLoading] = useState(true);
  const [shipment, setShipment] = useState(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");
  const transportistaId = user?.transportistaId ?? user?.id ?? user?.usuarioId ?? null;

  const shouldNotificarEntrega = useMemo(() => canNotificarEntrega(shipment), [shipment]);
  const primaryActionKey = useMemo(() => getPrimaryActionKey(shipment), [shipment]);

  const [showTokenModal, setShowTokenModal] = useState(false);
  const [token, setToken] = useState("");

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
    } finally {
      setIsSubmitting(false);
    }
  };

  const origen = getField(shipment, ["plantaDespachoNombre", "plantaDespacho", "origen", "puntoOrigen"]);
  const destino = getField(shipment, [
    "destino",
    "puntoDestino",
    "estacionDestino",
    "estacionDestinoNombre",
    "plantaDestino",
  ]);
  const combustible = getField(shipment, ["combustibleTipo", "tipoCombustible", "combustible"]);
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
            <strong>{formatEstado(estadoActual)}</strong>
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
                  {formatDate(
                    getField(shipment, [
                      "fechaSalida",
                      "fecha_salida",
                      "fechaSalidaPlanta",
                      "salida",
                    ])
                  )}
                </strong>
              </div>
            </div>

            <div className="action-panel">
              <button
                type="button"
                className={`primary-action ${shouldNotificarEntrega ? "primary-action--alt" : ""}`}
                onClick={() => setShowTokenModal(true)}
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
                  <div className="modal">
                    <h2>Confirmación</h2>

                    <div className="input-container">
                      <input
                        type="text"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        placeholder="Ingrese el token"
                      />
                    </div>

                    <div className="modal-buttons">
                      <button
                        className="cancelar"
                        type="button"
                        onClick={() => {
                          setShowTokenModal(false);
                          setToken("");
                        }}
                      >
                        Cancelar
                      </button>

                      <button
                        className="confirmar"
                        type="button"
                        onClick={async () => {
                          await handlePrimaryAction(token);
                          setShowTokenModal(false);
                          setToken("");
                        }}
                        disabled={!token}
                      >
                        Confirmar
                      </button>
                    </div>
                  </div>
                </div>
              )}
    </main>
  );
}
