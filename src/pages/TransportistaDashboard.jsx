import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { canNotificarEntrega, getPrimaryActionLabel, transportista as transportistaApi } from "../api";
import { datos } from '@/api';
import "../styles/transportistaDashboard.css";
import RouteMap from "../components/RouteMap";

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

  const [fullRoute, setFullRoute] = useState(null);
  const [isMapLoading, setIsMapLoading] = useState(false);
  const [mapError, setMapError] = useState(false);

  const [loading, setLoading] = useState(true);
  const [envios, setEnvios] = useState([]);
  const transportistaId = useMemo(
    () => user?.transportistaId ?? user?.id ?? user?.usuarioId ?? null,
    [user]
  );

  const activeEnvio = envios[0];
  const shouldNotificarEntrega = useMemo(() => canNotificarEntrega(activeEnvio), [activeEnvio]);
  const primaryActionLabel = useMemo(() => getPrimaryActionLabel(activeEnvio), [activeEnvio]);

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
        const response = await transportistaApi.getEnviosAsignados(transportistaId, user?.legajo);
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

  useEffect(() => {
      const resolveSavedRouteData = async () => {
        if (!activeEnvio) return;
  
        // 🔍 DEBUG LOG: Check your developer console to see the exact payload layout!
        console.log("Shipment payload data received:", activeEnvio);
  
        // Checking potential database field permutations
        const targetRutaId = activeEnvio.rutaId || activeEnvio.ruta_id || activeEnvio.ruta?.id || activeEnvio.ruta;
  
        console.log("Resolved targetRutaId:", targetRutaId);
  
        if (!targetRutaId) {
          console.warn("Map block skipped: No valid route identifier found in shipment object.");
          setMapError(true);
          return;
        }
  
        try {
          setIsMapLoading(true);
          setMapError(false);
  
          console.log(`Firing API call to: /rutas/get/${targetRutaId}`);
          const routeData = await datos.getRuta(targetRutaId);
          console.log("Route metadata fetched successfully:", routeData);
  
          if (routeData) {
            setFullRoute(routeData);
          } else {
            setMapError(true);
          }
        } catch (err) {
          console.error("Could not resolve complete route metadata layer:", err);
          setMapError(true);
        } finally {
          setIsMapLoading(false);
        }
      };
  
      resolveSavedRouteData();
    }, [activeEnvio]);

  const handleIniciarViaje = () => {
    if (!activeEnvio?.id) {
      return;
    }

    navigate(`/transportista/orden/${activeEnvio.id}/iniciar-viaje`);
  };

  const handleReportarIncidencia = () => {
    if (!activeEnvio) {
      return;
    }

    navigate("/transportista/incidencia");
  };

  const formatRouteTime = (decimalHours) => {
    if (!decimalHours || isNaN(decimalHours)) return "--:--";
    const hours = Math.floor(decimalHours);
    const minutes = Math.round((decimalHours - hours) * 60);
    return `${hours}h ${minutes.toString().padStart(2, "0")}m`;
  };

  const formatearFecha = (fechaString) => {
    if (!fechaString) return "--/--/---- --:--";
    const fecha = new Date(fechaString);
    return fecha.toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

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
            <span className="status-chip">{shouldNotificarEntrega ? "En curso" : "Pendiente de confirmar"}</span>
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

            <div className="container-map-summary">

              <div className="map-placeholder">
                 {isMapLoading ? (
              <div className="map-loading">
                <span>Recuperando traza del mapa...</span>
              </div>
              ) : mapError ? (
              <div className="map-error">
                <strong>Traza No Disponible</strong>
              </div>
              ) : (
                <RouteMap geometry={fullRoute?.geometria} />
              )}
              </div>

              <div className="route-summary">
                <div className="card-body">
                  <div className="row">
                    <div>
                      <small>Distancia Estimada</small>
                      <h2>
                        {fullRoute?.distanciaKm
                          ? `${Number(fullRoute.distanciaKm).toFixed(1)} km`
                          : activeEnvio.distanciaKm ? `${Number(activeEnvio.distanciaKm).toFixed(1)} km` : "-- km"}
                      </h2>
                    </div>
                    <div>
                      <small>Tiempo Estimado</small>
                      <h2>⏱ {fullRoute?.tiempoEstimadoHoras ? formatRouteTime(fullRoute.tiempoEstimadoHoras) : "15:30"}</h2>
                    </div>
                  </div>

                  <div className="dates">
                    <div>
                      <small>Fecha Salida</small>
                      <h2>⏱ {activeEnvio.fechaSalidaPlanta ? formatearFecha(activeEnvio.fechaSalidaPlanta) : "-"}</h2>
                    </div>
                    <div>
                      <small>Fecha Llegada</small>
                      <h2>⏱ {activeEnvio.fechaEntrega ? formatearFecha(activeEnvio.fechaEntrega) : "-"}</h2>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            

            <div className="action-row">
              <button
                type="button"
                className="action-btn action-btn--primary"
                onClick={handleIniciarViaje}
                disabled={!activeEnvio}
              >
                {primaryActionLabel}
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