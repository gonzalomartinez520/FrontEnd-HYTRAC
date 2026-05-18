import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { transportista as transportistaApi } from "../api";
import "../styles/transportistaDashboard.css";

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

const normalizeEnvios = (payload) => {
  if (!payload) return [];

  if (Array.isArray(payload)) return payload;

  if (Array.isArray(payload?.envios)) return payload.envios;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.result)) return payload.result;
  if (Array.isArray(payload?.items)) return payload.items;

  if (payload?.envio || payload?.shipment) {
    return [payload.envio || payload.shipment];
  }

  return [payload];
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

export default function TransportistaDashboard({ user }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [envios, setEnvios] = useState([]);
  const legajo = localStorage.getItem("legajo")
  const transportistaId = useMemo(
    () => user?.transportistaId ?? user?.id ?? user?.usuarioId ?? null,
    [user]
  );

  useEffect(() => {
    let isMounted = true;

    const loadEnvios = async () => {
      if (!transportistaId) {
        if (isMounted) {
          setEnvios([]);
          setLoading(false);
        }
        return;
      }

      setLoading(true);

      try {
        const response = await transportistaApi.getEnviosAsignados(transportistaId);
        const normalized = normalizeEnvios(response);

        if (isMounted) {
          setEnvios(normalized.filter(Boolean));
        }
      } catch (requestError) {
        console.error(requestError);

        if (isMounted) {
          setEnvios([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadEnvios();

    return () => {
      isMounted = false;
    };
  }, [transportistaId]);

  const handleInformarAvance = () => {
    const now = new Date().toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    window.alert(`Avance informado correctamente a las ${now}.`);
  };

  const handleReportarIncidencia = () => {
    if (!activeEnvio) {
      return;
    }

    navigate("/transportista/incidencia");
  };

  const activeEnvio = envios[0];

  const renderEnvioDetail = (envio) => {
    const origen = getField(envio, ["plantaDespacho", "puntoOrigen", "plantaOrigen", "salida"]);
    const destino = getField(envio, ["destino", "estacionDestino", "plantaDestino", "llegada"]);

    return (
      <article className="envio-detail-card" key={envio?.id ?? `${getField(envio, ["cot", "numeroCot"])}`}>
        <div className="envio-detail-top">
          <div>
            <span className="section-label">Detalle de envío</span>
            <h2>{getField(envio, ["cot", "numeroCot", "numero_cot", "cotizacion"], "Sin dato")}</h2>
          </div>
          <span className="detail-pill">Remito {getField(envio, ["nro_remito", "numeroRemito", "remito"], "Sin dato")}</span>
        </div>

        <div className="envio-detail-grid">
          <div className="detail-item detail-item--wide">
            <span>Origen / destino</span>
            <strong>{origen} → {destino}</strong>
          </div>
          <div className="detail-item">
            <span>Patente de camión</span>
            <strong>{getField(envio, ["patenteCamion", "patente_camion", "patenteVehiculo", "camionPatente"], "Camión")}</strong>
          </div>
          <div className="detail-item">
            <span>Patente de acoplado</span>
            <strong>{getField(envio, ["patenteAcoplado", "patente_acoplado", "acopladoPatente"], "Acoplado")}</strong>
          </div>
          <div className="detail-item">
            <span>Combustible</span>
            <strong>{getField(envio, ["tipoCombustible", "combustible", "combustibleNombre"], "Sin dato")}</strong>
          </div>
          <div className="detail-item">
            <span>Litros cargados</span>
            <strong>{getField(envio, ["litrosCargados", "litros_cargados", "volumen"], "Pendiente")}</strong>
          </div>
          <div className="detail-item">
            <span>Fecha de salida</span>
            <strong>{formatDate(getField(envio, ["fechaSalida", "fecha_salida", "fechaSalidaPlanta", "salida"]))}</strong>
          </div>
          <div className="detail-item">
            <span>Fecha estimada de llegada</span>
            <strong>{formatDate(getField(envio, ["fechaEntregaEstimada", "fecha_llegada", "fechaEntrega", "llegada"]))}</strong>
          </div>
        </div>
      </article>
    );
  };

  return (
    <main className="transportista-screen">
      <section className="transportista-shell">
        <header className="transportista-hero">
          <div>
            <p className="eyebrow">Panel del transportista</p>
            <h1>Seguimiento de ruta en tiempo real</h1>
            <p className="hero-copy">
              Visualizá el destino asignado, informá avances operativos y reportá incidencias sin salir de la pantalla.
            </p>
          </div>

          <div className="route-status">
            <span className="status-chip">En tránsito</span>
            <strong>{user?.nombre ? `${user.nombre} ${user.apellido || ""}` : "Transportista"}</strong>
            <span>Transportista ID: {transportistaId ?? "No disponible"}</span>
          </div>
        </header>

        {loading ? (
          <section className="map-card empty-state-card">
            <span className="section-label">Cargando</span>
            <h2>Buscando envíos asignados</h2>
            <p>Estamos consultando el sistema con tu ID de transportista.</p>
          </section>
        ) : envios.length === 0 ? (
          <section className="map-card empty-state-card">
            <span className="section-label">Sin asignación</span>
            <h2>Sin envíos asignados</h2>
            <p>No hay envíos en curso para usted en este momento.</p>
          </section>
        ) : (
          <section className="map-card">
            <div className="map-header">
              <div>
                <span className="section-label">Destino</span>
                <h2>Ruta asignada</h2>
              </div>
              <span className="destination-pill">{getField(activeEnvio, ["destino", "puntoDestino", "estacionDestino"], "Destino pendiente")}</span>
            </div>

            {renderEnvioDetail(activeEnvio)}

            <div className="map-placeholder" aria-label="Mapa de ruta pendiente de carga">
              <div className="map-grid" />
              <div className="map-route map-route--one" />
              <div className="map-route map-route--two" />
              <div className="map-pin">
                <span className="pin-dot" />
                <strong>Destino</strong>
                <small>{getField(activeEnvio, ["destino", "puntoDestino", "plantaDestino"], "Se cargará el mapa luego")}</small>
              </div>
              <div className="map-overlay">
                <span>Mapa en preparación</span>
                <p>
                  Aquí se integrará el mapa con la ubicación y el destino de la carga.
                </p>
              </div>
            </div>

            <div className="action-row">
              <button
                type="button"
                className="action-btn action-btn--primary"
                onClick={handleInformarAvance}
              >
                Informar Avance
              </button>
              <button
                type="button"
                className="action-btn action-btn--secondary"
                onClick={handleReportarIncidencia}
                disabled={!activeEnvio}
              >
                Reportar incidencia
              </button>
            </div>
          </section>
        )}
      </section>
    </main>
  );
}
