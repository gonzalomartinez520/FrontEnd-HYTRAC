import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { canNotificarEntrega, getPrimaryActionKey, transportista as transportistaApi } from "../api";
import { datos } from '@/api';
import "../styles/transportistaDashboard.css";
import RouteMap from "../components/RouteMap";
import { useTranslation } from "react-i18next";

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
const getField = (envio, keys, fallback = null) => {
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
  
  // 🔹 3. Instanciamos i18n para saber el idioma actual
  const { t: tTransportista, i18n } = useTranslation("transportista");
  const currentLocale = i18n.language || "es-AR";

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
  const primaryActionKey = useMemo(() => getPrimaryActionKey(activeEnvio), [activeEnvio]);

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
  
        console.log("Shipment payload data received:", activeEnvio);
  
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

  const renderEnvioDetail = (envio) => {
    const noDataText = tTransportista("dashboard.detail.noData");
    const pendingText = tTransportista("dashboard.detail.pending");

    const origen = getField(envio, ["plantaDespacho", "puntoOrigen", "plantaOrigen", "salida"], noDataText);
    const destino = getField(envio, ["destino", "estacionDestino", "plantaDestino", "llegada"], noDataText);

    return (
      <article className="envio-detail-card" key={envio?.id ?? `${getField(envio, ["cot", "numeroCot"])}`}>
        <div className="envio-detail-top">
          <div>
            <span className="section-label">{tTransportista("dashboard.detail.sectionLabel")}</span>
            <h2>{getField(envio, ["cot", "numeroCot", "numero_cot", "cotizacion"], noDataText)}</h2>
          </div>
          <span className="detail-pill">
            {tTransportista("dashboard.detail.remito")} {getField(envio, ["nro_remito", "numeroRemito", "remito"], noDataText)}
          </span>
        </div>

        <div className="envio-detail-grid">
          <div className="detail-item detail-item--wide">
            <span>{tTransportista("dashboard.detail.originDestination")}</span>
            <strong>{origen} → {destino}</strong>
          </div>
          <div className="detail-item">
            <span>{tTransportista("dashboard.detail.truckPlate")}</span>
            <strong>{getField(envio, ["patenteCamion", "patente_camion", "patenteVehiculo", "camionPatente"], tTransportista("dashboard.detail.truckFallback"))}</strong>
          </div>
          <div className="detail-item">
            <span>{tTransportista("dashboard.detail.trailerPlate")}</span>
            <strong>{getField(envio, ["patenteAcoplado", "patente_acoplado", "acopladoPatente"], tTransportista("dashboard.detail.trailerFallback"))}</strong>
          </div>
          <div className="detail-item">
            <span>{tTransportista("dashboard.detail.fuel")}</span>
            <strong>{getField(envio, ["tipoCombustible", "combustible", "combustibleNombre"], noDataText)}</strong>
          </div>
          <div className="detail-item">
            <span>{tTransportista("dashboard.detail.litersLoaded")}</span>
            <strong>{getField(envio, ["litrosCargados", "litros_cargados", "volumen"], pendingText)}</strong>
          </div>
          <div className="detail-item">
            <span>{tTransportista("dashboard.detail.departureDate")}</span>
            <strong>{formatDate(getField(envio, ["fechaSalida", "fecha_salida", "fechaSalidaPlanta", "salida"]), pendingText, currentLocale)}</strong>
          </div>
          <div className="detail-item">
            <span>{tTransportista("dashboard.detail.arrivalDate")}</span>
            <strong>{formatDate(getField(envio, ["fechaEntregaEstimada", "fecha_llegada", "fechaEntrega", "llegada"]), pendingText, currentLocale)}</strong>
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
            <p className="eyebrow">{tTransportista("dashboard.eyebrow")}</p>
            <h1>{tTransportista("dashboard.title")}</h1>
            <p className="hero-copy">
              {tTransportista("dashboard.subtitle")}
            </p>
          </div>

          <div className="route-status">
            <span className="status-chip">
              {shouldNotificarEntrega
                ? tTransportista("dashboard.status.inProgress")
                : tTransportista("dashboard.status.pendingConfirmation")}
            </span>
            <strong>{user?.nombre ? `${user.nombre} ${user.apellido || ""}` : tTransportista("dashboard.driverLabel")}</strong>
            <span>
              {tTransportista("dashboard.driverIdLabel", { id: transportistaId ?? tTransportista("dashboard.driverIdFallback") })}
            </span>
          </div>
        </header>

        {loading ? (
          <section className="map-card empty-state-card">
            <span className="section-label">{tTransportista("dashboard.loading.label")}</span>
            <h2>{tTransportista("dashboard.loading.title")}</h2>
            <p>{tTransportista("dashboard.loading.subtitle")}</p>
          </section>
        ) : envios.length === 0 ? (
          <section className="map-card empty-state-card">
            <span className="section-label">{tTransportista("dashboard.empty.label")}</span>
            <h2>{tTransportista("dashboard.empty.title")}</h2>
            <p>{tTransportista("dashboard.empty.subtitle")}</p>
          </section>
        ) : (
          <section className="map-card">
            <div className="map-header">
              <div>
                <span className="section-label">{tTransportista("dashboard.map.destinationLabel")}</span>
                <h2>{tTransportista("dashboard.map.assignedRouteTitle")}</h2>
              </div>
              <span className="destination-pill">
                {getField(activeEnvio, ["destino", "puntoDestino", "estacionDestino"], tTransportista("dashboard.map.destinationPending"))}
              </span>
            </div>

            {renderEnvioDetail(activeEnvio)}

            <div className="container-map-summary">

              <div className="map-placeholder">
                 {isMapLoading ? (
              <div className="map-loading">
                <span>{tTransportista("dashboard.map.loadingTrace")}</span>
              </div>
              ) : mapError ? (
              <div className="map-error">
                <strong>{tTransportista("dashboard.map.traceUnavailable")}</strong>
              </div>
              ) : (
                <RouteMap geometry={fullRoute?.geometria} />
              )}
              </div>

              <div className="route-summary">
                <div className="card-body">
                  <div className="row">
                    <div>
                      <small>{tTransportista("dashboard.summary.distance")}</small>
                      <h2>
                        {fullRoute?.distanciaKm
                          ? `${Number(fullRoute.distanciaKm).toFixed(1)} km`
                          : activeEnvio?.distanciaKm 
                            ? `${Number(activeEnvio.distanciaKm).toFixed(1)} km` 
                            : tTransportista("dashboard.summary.defaultDistance")}
                      </h2>
                    </div>
                    <div>
                      <small>{tTransportista("dashboard.summary.time")}</small>
                      <h2>⏱ {fullRoute?.tiempoEstimadoHoras ? formatRouteTime(fullRoute.tiempoEstimadoHoras) : tTransportista("dashboard.summary.defaultTime")}</h2>
                    </div>
                  </div>

                  <div className="dates">
                    <div>
                      <small>{tTransportista("dashboard.summary.departureDate")}</small>
                      <h2>
                        ⏱ {formatDate(
                             getField(activeEnvio, ["fechaSalida", "fecha_salida", "fechaSalidaPlanta", "salida"]), 
                             tTransportista("dashboard.summary.defaultDate"), 
                             currentLocale
                           )}
                      </h2>
                    </div>
                    <div>
                      <small>{tTransportista("dashboard.summary.arrivalDate")}</small>
                      <h2>     
                        ⏱ {formatDate(
                             getField(activeEnvio, ["fechaEntregaEstimada", "fecha_llegada", "fechaEntrega", "llegada"]), 
                             tTransportista("dashboard.summary.defaultDate"), 
                             currentLocale
                           )}
                      </h2>
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
                {tTransportista(`actions.${primaryActionKey}`)}
              </button>
              <button
                type="button"
                className="action-btn action-btn--secondary"
                onClick={handleReportarIncidencia}
                disabled={!activeEnvio}
              >
                {tTransportista("dashboard.actions.reportIncident")}
              </button>
            </div>
          </section>
        )}
      </section>
    </main>
  );
}