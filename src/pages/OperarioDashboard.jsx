import { Link } from "react-router-dom";

import { useState, useEffect } from "react";
import axios from "axios";
import "../styles/operarioDashboard.css";
import LogiTrackLogo from "../assets/LogiTrack_Logo_colored.png";

export default function OperarioDashboard({ user }) {
  // user viene de App.jsx con el nombre ingresado en login

  const [stats, setStats] = useState({
    total: 0,
    pendientes: 0,
    enTransito: 0,
    entregados: 0,
    cancelados: 0,
    altaPrioridad: 0,
    mediaPrioridad: 0,
    bajaPrioridad: 0,
  });

  const [metricas, setMetricas] = useState(null);
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTrackingId, setSearchTrackingId] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("todas");

  // Filtrar envíos según búsqueda y estado
  const filteredShipments = shipments.filter((s) => {
    const matchesSearch = s.id.toLowerCase().includes(searchTrackingId.toLowerCase());
    const matchesStatus = selectedStatus === "todas" || s.status.toLowerCase().replace(/[^a-z]/g, "") === selectedStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    const fetchEnvios = async () => {
      try {
        setLoading(true);
        setError(null);

        // Axios GET request
        const response = await axios.get("http://localhost:8080/api/envios");

        const data = response.data;   // This is the array []

        console.log("Datos recibidos:", data); // ← Helpful for debugging

        if (!Array.isArray(data)) {
          throw new Error("La respuesta no es un array");
        }

        // Transform data for the UI
        const transformedShipments = data.map((envio) => ({
          id: envio.trackingId || `LT-${envio.id}`,
          name: envio.destinatarioNombre || "Sin nombre",
          route: `${envio.origen} → ${envio.destino}`,
          status: (envio.estadoEnvio || "PENDIENTE").replace(/_/g, " "),
        }));

        setShipments(transformedShipments);

        // Calculate stats
        const total = data.length;
        const pendientes = data.filter((e) =>
          ["PENDIENTE", "Pendiente"].includes(e.estadoEnvio)
        ).length;

        const enTransito = data.filter((e) =>
          ["EN VIAJE", "EN_VIAJE"].includes(e.estadoEnvio)
        ).length;

        const entregados = data.filter((e) =>
          ["ENTREGADO", "Entregado"].includes(e.estadoEnvio)
        ).length;

        const cancelados = data.filter((e) =>
          ["CANCELADO", "Cancelado"].includes(e.estadoEnvio)
        ).length;

        const altaPrioridad = data.filter((e) => e.prioridadEnvio === "ALTA").length;
        const mediaPrioridad = data.filter((e) => e.prioridadEnvio === "MEDIA").length;
        const bajaPrioridad = data.filter((e) => e.prioridadEnvio === "BAJA").length;

        setStats({ total, pendientes, enTransito, entregados, cancelados, altaPrioridad, mediaPrioridad, bajaPrioridad });

        // Si es supervisor, obtener métricas
        if (user?.role === "supervisor") {
          try {
            const metricsResponse = await axios.get("http://localhost:8080/api/envios/metricas");
            setMetricas(metricsResponse.data);
          } catch (err) {
            console.warn("Advertencia: No se pudieron cargar las métricas", err);
          }
        }

      } catch (err) {
        console.error("Error completo:", err);
        setError(err.message || "Error al cargar los envíos");
      } finally {
        setLoading(false);
      }
    };

    fetchEnvios();
  }, [user?.role]);

  // Loading Screen
  if (loading) {
    return (
      <div className="dashboard">
        <div className="topbar">
          <div className="brand"><img src={LogiTrackLogo} alt="LogiTrack" className="topbar-logo" /> <span>LogiTrack</span></div>
          <div className="user-box">{user?.username}<span>Operario</span></div>
        </div>
        <div style={{ textAlign: "center", padding: "80px" }}>
          <p>Cargando envíos...</p>
        </div>
      </div>
    );
  }

  // Error Screen
  if (error) {
    return (
      <div className="dashboard">
        <div className="topbar">
          <div className="brand"><img src={LogiTrackLogo} alt="LogiTrack" className="topbar-logo" /> <span>LogiTrack</span></div>
          <div className="user-box">{user?.username}<span>Operario</span></div>
        </div>
        <div style={{ textAlign: "center", padding: "80px", color: "red" }}>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Reintentar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-container">

        {/* HERO */}
        <div className="hero">
          <div>
            <h2>Bienvenido, {user?.username}</h2>
            <p>Panel de Operaciones - {user?.role === "supervisor" ? "Gestión y Análisis de envíos" : "Gestión de Envios"}</p>
          </div>
          <div className="date-box">
            <span>Fecha: </span>
            <strong>{new Date().toLocaleDateString("es-AR")}</strong>
          </div>
        </div>

        {/* MÉTRICAS PARA SUPERVISORES */}
        {user?.role === "supervisor" && metricas && (
          <div className="metrics-section">
            <h3>📊 Métricas de Envíos ({stats.total} {stats.total === 1 ? "envío" : "envíos totales"})</h3>
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-label">Envíos Pendientes</div>
                <div className="metric-value">{stats.pendientes}</div>
              </div>
              <div className="metric-card">
                <div className="metric-label">En Tránsito</div>
                <div className="metric-value">{stats.enTransito}</div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Entregados</div>
                <div className="metric-value">{stats.entregados}</div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Cancelados</div>
                <div className="metric-value">{stats.cancelados}</div>
              </div>
            </div>
            <div className="metrics-grid metrics-priority">
              <div className="metric-card alta-card">
                <div className="metric-label">Alta Prioridad</div>
                <div className="metric-value">{stats.altaPrioridad}</div>
              </div>
              <div className="metric-card media-card">
                <div className="metric-label">Media Prioridad</div>
                <div className="metric-value">{stats.mediaPrioridad}</div>
              </div>
              <div className="metric-card baja-card">
                <div className="metric-label">Baja Prioridad</div>
                <div className="metric-value">{stats.bajaPrioridad}</div>
              </div>
            </div>
          </div>
        )}

        {/* BUSQUEDA - PARA TODOS */}
        <div className="search-filter">
          <div className="search-box">
            <input
              type="text"
              placeholder="🔍 Buscar por Tracking ID..."
              value={searchTrackingId}
              onChange={(e) => setSearchTrackingId(e.target.value)}
              className="search-input"
            />
          </div>
          {/* FILTRO POR ESTADO - SOLO SUPERVISORES */}
          {user?.role === "supervisor" && (
            <div className="filter-box">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="filter-select"
              >
                <option value="todas">Todos ({stats.total})</option>
                <option value="pendiente">Pendiente ({stats.pendientes})</option>
                <option value="enviaje">En Viaje ({stats.enTransito})</option>
                <option value="entregado">Entregados ({stats.entregados})</option>
                <option value="cancelado">Cancelados ({stats.cancelados})</option>
              </select>
            </div>
          )}
        </div>

        <div className="table">
          <div className="table-header">
            <h3>
              📦 Listado de Envíos
              <span style={{ fontSize: '0.9rem', color: '#888', fontWeight: 'normal' }}>
                ({filteredShipments.length} encontrados)
              </span>
            </h3>
            <button>Ver todos →</button>
          </div>

          {filteredShipments.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>N° Seguimiento</th>
                  <th>Destinatario</th>
                  <th>Origen → Destino</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredShipments.map((s) => (
                  <tr key={s.id}>
                    <td>{s.id}</td>
                    <td>{s.name}</td>
                    <td>{s.route}</td>
                    <td>
                      <span className={`status ${s.status.toLowerCase().replace(/[^a-z]/g, "")}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="action">
                      <Link to={`/shipment/${s.id}`} className="ver-detalle">
                        Ver detalle →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <h3>📦 No hay envíos disponibles</h3>
              <p>{searchTrackingId ? "No se encontraron envíos que coincidan con tu búsqueda" : "Comienza registrando un nuevo envío"}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}