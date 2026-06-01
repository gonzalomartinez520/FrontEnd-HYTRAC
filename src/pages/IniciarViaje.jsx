import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  apiClient as api,
  canNotificarEntrega,
  envios,
  getOrdenEstado,
  getPrimaryActionLabel,
  transportista as transportistaApi,
} from "@/api";
import "../styles/iniciarViaje.css";

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
  const { ordenId } = useParams();
  const [loading, setLoading] = useState(true);
  const [shipment, setShipment] = useState(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");
  const transportistaId = user?.transportistaId ?? user?.id ?? user?.usuarioId ?? null;

  const shouldNotificarEntrega = useMemo(() => canNotificarEntrega(shipment), [shipment]);
  const primaryActionLabel = useMemo(() => getPrimaryActionLabel(shipment), [shipment]);

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
        setError("No se recibió el ID de la orden.");
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
            "No se pudo cargar la orden."
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

  const handlePrimaryAction = async () => {
    if (!ordenId || isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);
      setFeedback("");

      if (shouldNotificarEntrega) {
        const response = await transportistaApi.notificarEntrega(ordenId, {
          legajoTransportista: localStorage.getItem("legajo"),
        });

        const refreshed = await reloadShipment();

        setShipment((prev) => resolveUpdatedOrden(response, refreshed || prev));
        setFeedback("Entrega notificada correctamente.");
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
      setFeedback("Envío confirmado. El estado pasó a en curso.");
    } catch (requestError) {
      setFeedback(
        requestError?.response?.data?.message ||
        requestError?.message ||
        "No se pudo completar la acción."
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
          ← Volver al panel
        </button>

        <header className="iniciar-viaje-hero">
          <div>
            <p className="eyebrow">Transportista</p>
            <h1>Orden {ordenId}</h1>
            <p>
              Si la orden está pendiente, confirmá el envío. Cuando el estado sea en curso, podés notificar la entrega.
            </p>
          </div>

          <div className="status-card">
            <span className="status-label">Estado actual</span>
            <strong>{formatEstado(estadoActual)}</strong>
            <small>
              {shouldNotificarEntrega
                ? "Siguiente paso: notificar entrega"
                : "Siguiente paso: confirmar envío"}
            </small>
          </div>
        </header>

        {loading ? (
          <section className="iniciar-viaje-card">
            <span className="section-label">Cargando</span>
            <h2>Buscando la orden asignada</h2>
            <p>Estamos consultando los datos de la orden para iniciar el flujo.</p>
          </section>
        ) : error ? (
          <section className="iniciar-viaje-card">
            <span className="section-label">Error</span>
            <h2>No pudimos cargar la orden</h2>
            <p>{error}</p>
          </section>
        ) : (
          <section className="iniciar-viaje-card">
            <div className="route-grid">
              <div>
                <span>Origen</span>
                <strong>{origen}</strong>
              </div>
              <div>
                <span>Destino</span>
                <strong>{destino}</strong>
              </div>
              <div>
                <span>Combustible</span>
                <strong>{combustible}</strong>
              </div>
              <div>
                <span>Fecha de salida</span>
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
                onClick={handlePrimaryAction}
                disabled={isSubmitting}
              >
                {primaryActionLabel}
              </button>

              <p>
                {feedback ||
                  (shouldNotificarEntrega
                    ? "La orden está en curso. Presioná el botón para notificar la entrega."
                    : "La orden está pendiente u otro estado. Presioná el botón para confirmar el envío.")}
              </p>
            </div>
          </section>
        )}
      </section>
    </main>
  );
}
