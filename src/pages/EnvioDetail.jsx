import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/envioDetail.css";

const ESTADOS_DISPONIBLES = ["PENDIENTE", "EN_VIAJE", "ENTREGADO", "CANCELADO"];

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

  // Helper to calculate Estimated Delivery based on Creation + Window Hours
  const calculateEstimatedDelivery = (creationDate, windowHours) => {
    const date = new Date(creationDate);
    date.setHours(date.getHours() + windowHours);
    return date.toLocaleString();
  };

  const formatearEstado = (estado) => {
    if (!estado) return "";
    return estado.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  };

  useEffect(() => {
    const fetchShipmentAndHistory = async () => {
      try {
        setLoading(true);
        setError(null);

        const [shipmentResponse, historyResponse] = await Promise.all([
          api.get(`/envios/${id}`),
          // Only fetch history if user is supervisor
          user?.role === "supervisor"
            ? api.get(`/envios/${id}/historial`).catch(() => ({ data: [] }))
            : Promise.resolve({ data: [] }),
        ]);

        setShipment(shipmentResponse.data);
        setSelectedEstado(shipmentResponse.data.estadoEnvio || "PENDIENTE");
        setHistory(Array.isArray(historyResponse.data) ? historyResponse.data : []);
      } catch (err) {
        setError(err?.response?.data?.message || err.message || "Error al cargar el envío");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchShipmentAndHistory();
  }, [id]);

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

  if (loading) return <div className="loading">Cargando detalles del envío...</div>;
  if (error) return <div className="error-msg">Error: {error} <button onClick={() => navigate("/dashboard")}>Volver</button></div>;
  if (!shipment) return null;

  return (
    <div className="details-page">
      <div className="back-link" onClick={() => navigate("/dashboard")}>
        ← Volver al listado
      </div>

      <div className="details-header card">
        <div>
          <h1>{shipment.trackingId}</h1>
          <p className="subtitle">Detalles del envío</p>
        </div>
        <div className="header-badges">
          <span className={`badge status-${shipment.estadoEnvio.toLowerCase()}`}>
            {formatearEstado(shipment.estadoEnvio)}
          </span>
          <span className={`badge priority-${shipment.prioridadEnvio.toLowerCase()}`}>
            Prioridad: {shipment.prioridadEnvio}
          </span>
          <span className={`badge saturation-${shipment.saturacion.toLowerCase()}`}>
            Saturación: {shipment.saturacion}
          </span>
        </div>
      </div>

      <div className="details-grid">
        <div className="column-main">
          <section className="card info-section">
            <h3>📍 Información de Ruta</h3>
            <div className="route-container">
              <div className="route-step origen">
                <label>Origen</label>
                <p>{shipment.origen}</p>
              </div>
              <div className="route-step destino">
                <label>Destino</label>
                <p>{shipment.destino}</p>
              </div>
            </div>
            <div className="distancia-info">
              <span className="distancia-text">
                🛣️ <strong>{shipment.distanciaEstimada} km</strong> de trayecto total
              </span>
            </div>
          </section>

          <section className="card info-section">
            <h3>👤 Información del Destinatario</h3>
            <div className="info-grid">
              <div className="data-item">
                <label>Nombre completo</label>
                <p>{shipment.destinatarioNombre}</p>
              </div>
              <div className="data-item">
                <label>Teléfono</label>
                <p>📞 {shipment.destinatarioTelefono}</p>
              </div>
            </div>
          </section>

          <section className="card info-section">
            <h3>📦 Información del Paquete</h3>
            <div className="package-grid">
              <div className="stat-box">
                <span className="icon">📦</span>
                <div>
                  <label>Volumen</label>
                  <p>{shipment.volumen}</p>
                </div>
              </div>
              <div className="stat-box">
                <span className="icon">❄️</span>
                <div>
                  <label>Cadena de Frío</label>
                  <p>{shipment.frio ? "Requerido" : "No requiere"}</p>
                </div>
              </div>
              <div className="stat-box">
                <span className="icon">💎</span>
                <div>
                  <label>Frágil</label>
                  <p>{shipment.fragil ? "Sí" : "No"}</p>
                </div>
              </div>
            </div>

            {/* If you wanted to show the equivalent in cubic meters for very large shipments */}
            {shipment.volumen >= 1000 && (
              <div className="volume-conversion">
                <small>Equivalente a {(shipment.volumen / 1000).toFixed(2)} m³</small>
              </div>
            )}

            {shipment.notasAdicionales && (
              <div className="notes-box">
                <p><strong>📝 Notas:</strong> {shipment.notasAdicionales}</p>
              </div>
            )}
          </section>

          <section className="card info-section">
            <h3>🔄 Actualización de Estado</h3>
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
        </div>

        <div className="column-side">
          <section className="card info-section">
            <h3>⏰ Tiempos</h3>
            <div className="control-list">
              <div className="control-item">
                <label>Fecha de creación</label>
                <p>{new Date(shipment.fechaCreacion).toLocaleString()}</p>
              </div>
              <div className="control-item">
                <label>Entrega estimada (Límite)</label>
                <p>
                  {calculateEstimatedDelivery(shipment.fechaCreacion, shipment.ventanaHoras)}
                </p>
              </div>
            </div>
          </section>

          <section className="card info-section">
            <h3>🛠️ Información de Control</h3>
            <div className="control-list">
              <div className="control-item">
                <label>Operario</label>
                <p>{shipment.creadoPor}</p>
              </div>
              <div className="control-item">
                <label>Tipo de Envío</label>
                <p>{shipment.tipoEnvio}</p>
              </div>
            </div>
          </section>

          {/* Only show the history section if the user role is supervisor */}
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