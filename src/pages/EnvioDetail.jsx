import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "../styles/envioDetail.css";
import "../styles/statusBadge.css";
import StatusBadge from "@/components/StatusBadge";
import { envios, datos, apiClient as api } from '@/api';
import RouteMap from "../components/RouteMap";


export default function EnvioDetail({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation("common");

  const [shipment, setShipment] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summaryOpen, setSummaryOpen] = useState(false);

  // --- SINGLE SOURCE OF TRUTH FOR THE WHOLE ROUTE OBJECT ---
  const [fullRoute, setFullRoute] = useState(null);
  const [isMapLoading, setIsMapLoading] = useState(false);
  const [mapError, setMapError] = useState(false);

  const [combustibles, setCombustibles] = useState([]);
  const [combustibleSeleccionado, setCombustibleSeleccionado] = useState(null);

  const formatearEstado = (estado) => {
    if (!estado) return "";
    return estado.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  };

  useEffect(() => {
    const fetchShipmentAndHistory = async () => {
      try {
        setLoading(true);
        setError(null);

        const delay = new Promise((resolve) => setTimeout(resolve, 1000));

        const shipmentData = await envios.getById(id);

        let historyData = [];

        if (shipmentData?.numeroRemito) {
          try {
            historyData = await envios.getHistorialEstado(
              shipmentData.numeroRemito
            );
          } catch (err) {
            console.warn("No se pudo obtener historial:", err);
          }
        }

        await delay;

        setShipment(shipmentData);
        setHistory(Array.isArray(historyData) ? historyData : []);

      } catch (err) {
        setError(
          err?.response?.data?.message ||
          err.message ||
          t("envioDetail.loadError")
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchShipmentAndHistory();
  }, [id, user?.role]); // ✅ SIEMPRE misma cantidad y orden

  useEffect(() => {
    const fetchCombustibles = async () => {
      try {
        const combustiblesData = await datos.getCombustibles();
        setCombustibles(combustiblesData);
      } catch (err) {
        console.error("Error fetching combustibles:", err);
      }
    };

    fetchCombustibles();
  }, []);

  useEffect(() => {
    if (!combustibles.length || !shipment) return;

    const nombreBuscado =
      shipment?.combustibleNombre || shipment?.combustible;

    if (!nombreBuscado) return;

    const combustible = combustibles.find(
      (c) =>
        c.nombre.trim().toLowerCase() ===
        nombreBuscado.trim().toLowerCase()
    );

    setCombustibleSeleccionado(combustible);
    console.log("Combustible seleccionado:", combustible);
  }, [combustibles, shipment]);

  // --- DIAGNOSTIC EFFECT: Fetches the entire route dataset ---
  useEffect(() => {
    const resolveSavedRouteData = async () => {
      if (!shipment) return;

      // 🔍 DEBUG LOG: Check your developer console to see the exact payload layout!
      console.log("Shipment payload data received:", shipment);

      // Checking potential database field permutations
      const targetRutaId = shipment.rutaId || shipment.ruta_id || shipment.ruta?.id || shipment.ruta;

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
  }, [shipment]);

  // Helper utility to format decimal hours into standard (5h 09m) formatting
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

  if (loading) return (
    <div className="loading-screen-detail">
      <h1 className="loader-detail"></h1>
      {t("envioDetail.loading")}
    </div>
  );

  if (error) return <div className="error-msg">{t("alerts.error")}: {error} <button onClick={() => navigate("/dashboard")}>{t("envioDetail.back")}</button></div>;
  if (!shipment) return null;

  return (
    <div className="details-page">
      {/* LEFT COLUMN: NOW ABSOLUTELY POSITIONED FOR ELEMENTS OVERLAPPING */}
      <div className="details-left">
        {/* MAP BACKGROUND WRAPPER - CLAIMS 100% OF COLUMN DENSITY */}
        <div className="details-left-placeholder">
          {isMapLoading ? (
            <div className="map-loading">
              <span>{t("envioDetail.mapLoading")}</span>
            </div>
          ) : mapError ? (
            <div className="map-error">
              <strong>{t("envioDetail.mapUnavailable")}</strong>
            </div>
          ) : (
            <RouteMap geometry={fullRoute?.geometria} />
          )}
        </div>

        <div
          className="back-link"
          onClick={() =>
            navigate(
              user?.role === "JEFE_ESTACION"
                ? "/jefe-estacion"
                : "/dashboard"
            )
          }
        >
          {t("envioDetail.backToPanel")}
        </div>

        {/* FLOATING CONTROL BUTTON */}
        <button
          type="button"
          className="summary-toggle-btn"
          onClick={() => setSummaryOpen((prev) => !prev)}
        >
          {t("envioDetail.routeSummary")}
        </button>

        {/* OVERLAPPING "RESUMEN" PANEL */}
        <div className={`card route-summary ${summaryOpen ? "open" : ""}`}>
          <div className="card-header">
            📍 <span>{t("envioDetail.routeSummary")}</span>
          </div>

          <div className="card-body">
            <div className="row">
              <div>
                <small>{t("envioDetail.estimatedDistance")}</small>
                <h2>
                  {fullRoute?.distanciaKm
                    ? `${Number(fullRoute.distanciaKm).toFixed(1)} km`
                    : shipment.distanciaKm ? `${Number(shipment.distanciaKm).toFixed(1)} km` : "-- km"}
                </h2>
              </div>
              <div>
                <small>{t("envioDetail.estimatedTime")}</small>
                <h2>⏱ {fullRoute?.tiempoEstimadoHoras ? formatRouteTime(fullRoute.tiempoEstimadoHoras) : "15:30"}</h2>
              </div>
            </div>

            <div className="dates">
              <div>
                <small>{t("envioDetail.departureDate")}</small>
                <h2>⏱ {shipment.fechaSalidaPlanta ? formatearFecha(shipment.fechaSalidaPlanta) : "-"}</h2>
              </div>
              <div>
                <small>{t("envioDetail.arrivalDate")}</small>
                <h2>⏱ {shipment.fechaEntrega ? formatearFecha(shipment.fechaEntrega) : "-"}</h2>
              </div>
            </div>

            <div className="info">
              <p><strong>{t("envioDetail.origin")}</strong> {shipment.plantaDespacho}</p>
              <p><strong>{t("envioDetail.destination")}</strong> {shipment.estacionDestino}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="details-right">
        <div className="details-header-right">
          <div className="details-header-right__info">
            <h1>{t("envioDetail.orderTitle", { id: shipment.trackingId })}</h1>
            <small>{t("envioDetail.created", { date: formatearFecha(shipment.fechaCreacion) })}</small>
          </div>
          <span>
            <StatusBadge estado={shipment.estado} />
          </span>
        </div>

        <div className="details-info-right">
          <h3 className="section-title">👤 {t("envioDetail.driverInfo")}</h3>

          <div className="driver-card">
            <div>
              <h4>{shipment.transportista}</h4>
              <p>DNI: 28.455.901 / ID: HY-DRV-102</p>
            </div>
          </div>

          <div className="grid-info">
            <div>
              <h4 className="sub-title">🚛 UNIDAD DE TRANSPORTE</h4>
              <div className="info-row">
                <span>Patente Camion</span>
                <strong>{shipment.camionPatente}</strong>
              </div>

              <div className="info-row">
                <span>Patente Acoplado</span>
                <strong>{shipment.acopladoPatente}</strong>
              </div>

              <div className="info-row">
                <span>Capacidad Total</span>
                <strong>{shipment.capacidadTotalAcoplado} Lts.</strong>
              </div>

              <div className="info-row">
                <span>Peso Máximo</span>
                <strong>{shipment.pesoMaximoCamion} Kgs.</strong>
              </div>
            </div>

            <div>
              <h4 className="sub-title">💧 ESPECIFICACIONES DE CARGA</h4>

              <div className="info-row">
                <span>Combustible</span>
                <strong>{shipment.combustible}</strong>
              </div>

              <div className="info-row">
                <span>Clase Peligro</span>
                <strong>{shipment.claseRiesgo}</strong>
              </div>

              <div className="info-row">
                <span>Temperatura</span>
                <strong>{combustibleSeleccionado?.temperaturaReferencia} °C</strong>
              </div>

              <div className="info-row">
                <span>Litros Cargados</span>
                <strong>{shipment.litrosCargados} Lts.</strong>
              </div>
            </div>
          </div>

          <h3 className="section-title">
            🚚 SEGUIMIENTO DE LA ORDEN
          </h3>

          <div className="timeline">
            {[...history]
              .sort((a, b) => new Date(a.fechaCambio) - new Date(b.fechaCambio))
              .map((item, index) => {
                const isConfirm = !!item.confirmadorLegajo;

                const isReject =
                  (item.estadoAnteriorNombre?.toLowerCase() === "pendiente de inicio de viaje" &&
                    item.estadoNuevoNombre?.toLowerCase() === "pendiente") ||

                  (item.estadoAnteriorNombre?.toLowerCase() === "pendiente de confirmacion de entrega" &&
                    item.estadoNuevoNombre?.toLowerCase() === "en curso");

                  const dotClass = isReject
                    ? "reject"
                    : isConfirm
                    ? "confirm"
                    : "request";

                const isLast = index === history.length - 1;

                const actor = isReject
                  ? {
                      label: t("envioDetail.rejectedBy"),
                      value:
                        item.confirmadorLegajo ||
                        item.solicitanteLegajo ||
                        "-"
                    }
                  : item.confirmadorLegajo
                  ? {
                      label: t("envioDetail.confirmedBy"),
                      value: item.confirmadorLegajo
                    }
                  : item.solicitanteLegajo
                  ? {
                      label: t("envioDetail.requestedBy"),
                      value: item.solicitanteLegajo
                    }
                  : {
                      label: t("envioDetail.system"),
                      value: "-"
                    };

                return (
                  <div key={index} className="timeline-item">
                    {/* Línea + punto */}
                    <div className="timeline-left">
                      <div className={`timeline-dot ${dotClass}`} />
                      {index !== history.length - 1 && <div className="timeline-line" />}
                    </div>

                    {/* Contenido */}
                    <div className={`timeline-content ${isLast ? "active" : ""}`}>
                      <div className="timeline-header">
                        <StatusBadge estado={item.estadoAnteriorNombre} />
                        <span className="arrow">→</span>
                        <StatusBadge estado={item.estadoNuevoNombre} />
                      </div>

                      <div className="timeline-body">
                        <p className="actor">
                          👤 {actor.label}: <strong>{actor.value}</strong>
                        </p>

                        <p className="motivo">📝 {item.motivo}</p>

                        <p className="fecha">
                          🕒 {formatearFecha(item.fechaCambio)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>

        </div>
      </div>
    </div>
  );
}