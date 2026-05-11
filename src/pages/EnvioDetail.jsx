import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/envioDetail.css";
import { envios } from '@/api';

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

  /* QUEDARA COMENTADO HASTA NUEVO AVISO
  const calculateEstimatedDelivery = (creationDate, windowHours) => {
    const date = new Date(creationDate);
    date.setHours(date.getHours() + windowHours);
    return date.toLocaleString();
  };
  */

  const formatearEstado = (estado) => {
    if (!estado) return "";
    return estado.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  };

  useEffect(() => {
    const fetchShipmentAndHistory = async () => {
      try {
        setLoading(true);
        setError(null);

        const [shipment, history] = await Promise.all([
          envios.getById(id),

          user?.role === "supervisor"
            ? envios.getHistorial(id).catch(() => [])
            : Promise.resolve([]),
        ]);

        setShipment(shipment);
        setSelectedEstado(shipment.estadoEnvio || "PENDIENTE");
        setHistory(Array.isArray(history) ? history : []);
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
      <div className="details-left">
        <div className="back-link" onClick={() => navigate("/dashboard")}>
          ← Volver al Panel
        </div>

        <div className="card">
          <div className="card-header">
            📍 <span>Resumen del Trayecto</span>
          </div>

          <div className="card-body">
            <div className="row">
              <div>
                <smal>Distancia Estimada</smal>
                <h2>{shipment.distanciaEstimada}</h2>
              </div>
              <div>
                <small>Fecha Estimada</small>
                <h2>⏱ 15:30</h2>
              </div>
            </div>

            <div className="dates">
              <div>
                <small>Fecha Salida</small>
                <h2>⏱ 09:30</h2>
              </div>
              <div>
                <small>Fecha Llegada</small>
                <h2>⏱ 16:00</h2>
              </div>
            </div>

            <div className="info">
              <p><strong>Origen:</strong>{shipment.origen}</p>
              <p><strong>Destino:</strong>{shipment.destino}</p>
            </div>
          </div>
        </div>
      </div>


      <div className="details-right">
        <div className="details-header-right">
          <h1>Órden {shipment.id}</h1>
          <small>Creado: {shipment.fechaCreacion}</small>
          <span className={`badge status-${shipment.estadoEnvio.toLowerCase()}`}>
            {formatearEstado(shipment.estadoEnvio)}
          </span>
        </div>

        <div className="details-info-right">
          <h3 className="section-title">👤 INFORMACIÓN DEL CONDUCTOR</h3>

          <div className="driver-card">
            <div>
              <h4>Ricardo Gómez</h4>
              <p>DNI: 28.455.901 / ID: HY-DRV-102</p>
            </div>
          </div>

          <div className="grid-info">
            <div>
              <h4 className="sub-title">🚛 UNIDAD DE TRANSPORTE</h4>
              <div className="info-row">
                <span>Patente Camion</span>
                <strong>AF 455 YH</strong>
              </div>

              <div className="info-row">
                <span>Patente Acoplado</span>
                <strong>RY 902 KK</strong>
              </div>

              <div className="info-row">
                <span>Capacidad Total</span>
                <strong>35.000 Lts</strong>
              </div>

              <div className="info-row">
                <span>Peso Máximo</span>
                <strong>45.000 Kgs</strong>
              </div>
            </div>

            <div>
              <h4 className="sub-title">💧 ESPECIFICACIONES DE CARGA</h4>

              <div className="info-row">
                <span>Combustible</span>
                <strong>Diesel Premium</strong>
              </div>

              <div className="info-row">
                <span>Código ONU</span>
                <strong>1202</strong>
              </div>

              <div className="info-row">
                <span>Clase Peligro</span>
                <strong>3 (Inflamable)</strong>
              </div>

              <div className="info-row">
                <span>Temperatura</span>
                <strong>18 °C</strong>
              </div>

              {/*Base para el detalle del envio, luego se cambio con los datos reales*/}
            </div>
          </div>

          <section className="card info-section">
            <h4 className="sub-title">🔄 Actualización de Estado</h4>
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