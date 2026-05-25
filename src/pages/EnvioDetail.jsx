import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/envioDetail.css";
import "../styles/statusBadge.css";
import StatusBadge from "@/components/StatusBadge";
import { envios, datos, apiClient as api } from '@/api';
import RouteMap from "../components/RouteMap";

const ESTADOS_DISPONIBLES = ["PENDIENTE", "EN_CURSO", "ENTREGADA", "CANCELADA"];

export default function EnvioDetail({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [shipment, setShipment] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEstado, setSelectedEstado] = useState("PENDIENTE");
  const [motivo, setMotivo] = useState("");
  const [updatingEstado, setUpdatingEstado] = useState(false);
  const [estadoMsg, setEstadoMsg] = useState("");
  const [summaryOpen, setSummaryOpen] = useState(false);

  // --- SINGLE SOURCE OF TRUTH FOR THE WHOLE ROUTE OBJECT ---
  const [fullRoute, setFullRoute] = useState(null);
  const [isMapLoading, setIsMapLoading] = useState(false);
  const [mapError, setMapError] = useState(false);

  const formatearEstado = (estado) => {
    if (!estado) return "";
    return estado.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  };

  useEffect(() => {
    const fetchShipmentAndHistory = async () => {
      try {
        setLoading(true);
        setError(null);

        // ⏱️ Timer mínimo de 1 segundo
        const delay = new Promise((resolve) => setTimeout(resolve, 1000));

        const fetchData = Promise.all([
          envios.getById(id),
          user?.role === "supervisor"
            ? envios.getHistorial(id).catch(() => [])
            : Promise.resolve([]),
        ]);

        // ⛓️ Espera ambas cosas: datos + 1 segundo
        const [[shipmentData, historyData]] = await Promise.all([
          fetchData,
          delay,
        ]);

        setShipment(shipmentData);
        setSelectedEstado(shipmentData.estado || "PENDIENTE");
        setHistory(Array.isArray(historyData) ? historyData : []);
      } catch (err) {
        setError(
          err?.response?.data?.message ||
          err.message ||
          "Error al cargar el envío"
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchShipmentAndHistory();
  }, [id, user]);

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

  const handleUpdateEstado = async (e) => {
    e.preventDefault();
    setUpdatingEstado(true);
    setEstadoMsg("");

    try {
      await api.patch(`/envios/${id}/estado`, {
        estado: selectedEstado,
        motivo: motivo.trim() || "Actualizacion manual desde web",
        usuario: user?.username || "operario-web",
      });

      const [shipmentResponse, historyResponse] = await Promise.all([
        api.get(`/envios/${id}`),
        api.get(`/envios/${id}/historial`).catch(() => ({ data: [] })),
      ]);

      setShipment(shipmentResponse.data);
      setHistory(Array.isArray(historyResponse.data) ? historyResponse.data : []);
      setMotivo("");
      setEstadoMsg("Estado actualizado correctamente.");
    } catch (err) {
      setEstadoMsg(err?.response?.data?.message || "No se pudo actualizar el estado.");
    } finally {
      setUpdatingEstado(false);
    }
  };

  if (loading) return (
    <div className="loading-screen-detail">
      <h1 className="loader-detail"></h1>
      Cargando Orden...
    </div>
  );

  if (error) return <div className="error-msg">Error: {error} <button onClick={() => navigate("/dashboard")}>Volver</button></div>;
  if (!shipment) return null;

  return (
    <div className="details-page">
      {/* LEFT COLUMN: NOW ABSOLUTELY POSITIONED FOR ELEMENTS OVERLAPPING */}
      <div className="details-left" style={{
        display: "flex",
        flexDirection: "column",
        position: "relative", // Crucial anchor for overlapping elements
        height: "calc(100vh - 120px)", // Forces left panel to match dashboard view height dynamically
        minHeight: "600px"
      }}>

        <div className="back-link" onClick={() => navigate("/dashboard")} style={{ marginBottom: "12px", zIndex: 10 }}>
          ← Volver al Panel
        </div>

        {/* FLOATING CONTROL BUTTON */}
        <button
          type="button"
          className="summary-toggle-btn"
          onClick={() => setSummaryOpen((prev) => !prev)}
          style={{ zIndex: 10 }}
        >
          Resumen del Trayecto
        </button>

        {/* OVERLAPPING "RESUMEN" PANEL */}
        <div className={`card route-summary ${summaryOpen ? "open" : ""}`} style={{
          position: "absolute",
          top: "80px",
          left: "10px",
          zIndex: 1000, // Forces card to stay beautifully layered over the map
          width: "320px", // Standard rigid widget sizing
          background: "rgba(30, 41, 59, 0.95)", // Slightly translucent slate for premium glassmorphism feel
          backdropFilter: "blur(4px)",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)"
        }}>
          <div className="card-header">
            📍 <span>Resumen del Trayecto</span>
          </div>

          <div className="card-body">
            <div className="row">
              <div>
                <small>Distancia Estimada</small>
                <h2>
                  {fullRoute?.distanciaKm
                    ? `${Number(fullRoute.distanciaKm).toFixed(1)} km`
                    : shipment.distanciaKm ? `${Number(shipment.distanciaKm).toFixed(1)} km` : "-- km"}
                </h2>
              </div>
              <div>
                <small>Tiempo Estimado de Viaje</small>
                <h2>⏱ {fullRoute?.tiempoEstimadoHoras ? formatRouteTime(fullRoute.tiempoEstimadoHoras) : "15:30"}</h2>
              </div>
            </div>

            <div className="dates">
              <div>
                <small>Fecha Salida</small>
                <h2>⏱ {shipment.fechaSalidaPlanta ? formatearFecha(shipment.fechaSalidaPlanta) : "09:30"}</h2>
              </div>
              <div>
                <small>Fecha Llegada</small>
                <h2>⏱ {shipment.fechaEntrega ? formatearFecha(shipment.fechaEntrega) : "16:00"}</h2>
              </div>
            </div>

            <div className="info">
              <p><strong>Origen:</strong> {shipment.plantaDespacho}</p>
              <p><strong>Destino:</strong> {shipment.estacionDestino}</p>
            </div>
          </div>
        </div>

        {/* MAP BACKGROUND WRAPPER - CLAIMS 100% OF COLUMN DENSITY */}
        <div className="details-left-placeholder" style={{
          position: "absolute",
          top: "50px",
          left: 0,
          right: 0,
          bottom: 0,
          width: "100%",
          height: "100%"
        }}>
          {isMapLoading ? (
            <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#1e293b", borderRadius: "8px", color: "#94a3b8", border: "1px solid #334155" }}>
              <span>Recuperando traza del mapa...</span>
            </div>
          ) : mapError ? (
            <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#1a2332", borderRadius: "8px", color: "#94a3b8", border: "1px solid #334155", padding: "20px" }}>
              <strong>Traza No Disponible</strong>
            </div>
          ) : (
            <RouteMap geometry={fullRoute?.geometria} />
          )}
        </div>
      </div>

      <div className="details-right">
        <div className="details-header-right">
          <div className="details-header-right__info">
            <h1>Orden {shipment.id}</h1>
            <small>Creado: {formatearFecha(shipment.fechaCreacion)}</small>
          </div>
          <span>
            <StatusBadge estado={shipment.estado} />
          </span>
        </div>

        <div className="details-info-right">
          <h3 className="section-title">👤 INFORMACIÓN DEL CONDUCTOR</h3>

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
                <strong>{shipment.temperaturaReferencia} °C</strong>
              </div>

              <div className="info-row">
                <span>Litros Cargados</span>
                <strong>{shipment.litrosCargados} Lts.</strong>
              </div>
            </div>
          </div>

          <section className="card info-section">
            <h4 className="sub-title">🔄 ACTUALIZACION DE ESTADO</h4>
            <form className="status-form" onSubmit={handleUpdateEstado}>
              <label>Nuevo estado</label>
              <select
                value={selectedEstado}
                onChange={(e) => setSelectedEstado(e.target.value)}
                disabled={updatingEstado}
              >
                {ESTADOS_DISPONIBLES.map((estado) => (
                  <option key={estado} value={estado}>
                    {formatearEstado(estado)}
                  </option>
                ))}
              </select>

              <label>Motivo del cambio</label>
              <textarea
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Ej: Entregado al destinatario"
                disabled={updatingEstado}
              />

              <button type="submit" disabled={updatingEstado}>
                {updatingEstado ? "Actualizando..." : "Guardar estado"}
              </button>
            </form>
            {estadoMsg && (
              <p className={`status-msg ${estadoMsg.includes("correctamente") ? "success" : "error"}`}>
                {estadoMsg}
              </p>
            )}
          </section>

          {user?.role === "supervisor" && (
            <section className="card info-section">
              <h3>🕘 Historial</h3>
              {history.length === 0 ? (
                <p className="history-empty">Sin cambios registrados.</p>
              ) : (
                <ul className="history-list">
                  {history.map((item, index) => (
                    <li key={index}>
                      <strong>
                        {formatearEstado(item.estadoAnterior)} → {formatearEstado(item.estadoNuevo)}
                      </strong>
                      <span>{item.motivoCambio || "Sin motivo"}</span>
                      <small>
                        {item.cambiadoPor || "sistema"} - {new Date(item.fechaCambio).toLocaleString()}
                      </small>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}