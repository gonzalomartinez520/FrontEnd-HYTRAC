import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiClient as api, envios, transportista as transportistaApi } from "@/api";
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

export default function IniciarViaje({ user }) {
  const navigate = useNavigate();
  const { ordenId } = useParams();
  const [loading, setLoading] = useState(true);
  const [shipment, setShipment] = useState(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTripConfirmed, setIsTripConfirmed] = useState(false);
  const [feedback, setFeedback] = useState("");
  const transportistaId = user?.transportistaId ?? user?.id ?? user?.usuarioId ?? null;

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

        let data = null;

        if (transportistaId) {
          const asignados = await transportistaApi.getEnviosAsignados(transportistaId, user?.legajo);
          data = Array.isArray(asignados)
            ? asignados.find((item) => String(item?.id) === String(ordenId)) ?? null
            : null;
        }

        if (!data) {
          data = await envios.getById(ordenId);
        }

        if (isMounted) {
          setShipment(data);

          const estadoActual = String(data?.estado || "").toUpperCase();
          setIsTripConfirmed(estadoActual === "EN_VIAJE" || estadoActual === "EN_CURSO");
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

    const nextEstado = isTripConfirmed ? "EN_CURSO" : "EN_VIAJE";
    const nextMotivo = isTripConfirmed
      ? "Envio informado desde el panel de transportista"
      : "Viaje confirmado desde el panel de transportista";

    try {
      setIsSubmitting(true);
      setFeedback("");

      const payload = {
        estado: nextEstado,
        motivo: nextMotivo,
        usuario: user?.username || user?.nombre || "transportista-web",
      };

      await api.put(`/transportista/orden/${ordenId}/iniciar-viaje`, payload);

      if (!isTripConfirmed) {
        setIsTripConfirmed(true);
        setShipment((prev) => (prev ? { ...prev, estado: "EN_VIAJE" } : prev));
        setFeedback("Viaje confirmado. Ahora podés informar envio.");
        return;
      }

      setShipment((prev) => (prev ? { ...prev, estado: "EN_CURSO" } : prev));
      setFeedback("Envio informado correctamente.");
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
  const estadoActual = getField(
    shipment,
    ["estado", "status", "estadoOrden", "estadoNombre", "orderState"],
    "Sin estado"
  );
  const estadoActualUpper = String(estadoActual).toUpperCase();
  const isInTrip = estadoActualUpper === "EN_VIAJE" || estadoActualUpper === "EN_CURSO";

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
              Confirmá el viaje desde esta pantalla y, una vez iniciado, el mismo botón cambia a informar descarga.
            </p>
          </div>

          <div className="status-card">
            <span className="status-label">Estado actual</span>
            <strong>{formatEstado(estadoActual)}</strong>
            <small>{isInTrip ? "Siguiente paso: informar envio" : "Siguiente paso: confirmar viaje"}</small>
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
                className={`primary-action ${isTripConfirmed ? "primary-action--alt" : ""}`}
                onClick={handlePrimaryAction}
                disabled={isSubmitting}
              >
                {isInTrip ? "Informar envio" : "Confirmar viaje"}
              </button>

              <p>{feedback || (isInTrip ? "El viaje ya está en curso. Podés informar envio cuando lo necesites." : "Presioná el botón para iniciar el viaje.")}</p>
            </div>
          </section>
        )}
      </section>
    </main>
  );
}