
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import "../styles/operarioDashboard.css";
import LogiTrackLogo from "../assets/LogiTrack_Logo_colored.png";

const mockShipments = [
  {
    id: "#HYT-8291",
    origen: "Refinería Campana",
    destino: "Estación Norte Rosario",
    chofer: "Carlos Gomez",
    status: "EN TRANSITO",
    prioridad: "ALTA",
    ultima: "Hace 15 min",
  },
  {
    id: "#HYT-7742",
    origen: "Planta Dock Sud",
    destino: "Logística Córdoba Center",
    chofer: "Roberto Paez",
    status: "ENTREGADO",
    prioridad: "MEDIA",
    ultima: "Hace 2 horas",
  },
  {
    id: "#HYT-9104",
    origen: "Terminal San Lorenzo",
    destino: "Estación Mendoza Este",
    chofer: "Mario Luz",
    status: "EN TRANSITO",
    prioridad: "ALTA",
    ultima: "Hace 5 min",
  },
  {
    id: "#HYT-6623",
    origen: "Refinería Campana",
    destino: "Depósito Neuquén",
    chofer: "Esteban Quito",
    status: "CANCELADO",
    prioridad: "ALTA",
    ultima: "Ayer 18:30",
  },
  {
    id: "#HYT-5512",
    origen: "Planta Bahía Blanca",
    destino: "Estación Santa Fe",
    chofer: "Lucas Rin",
    status: "EN TRANSITO",
    prioridad: "MEDIA",
    ultima: "Justo ahora",
  },
];

export default function OperarioDashboard({ user }) {
  const [loading, setLoading] = useState(true);
  const [shipments, setShipments] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setShipments(mockShipments);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const filteredShipments = shipments.filter((shipment) =>
    shipment.id.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
        <h2>Cargando panel HYTRAC...</h2>
      </div>
    );
  }

  return (
    <div className="hytrac-layout">
      {/* TOPBAR */}

      <main className="dashboard-content">
        {/* HEADER */}
        <section className="dashboard-header">
          <div>
            <h1>Panel de Control de Logística</h1>
            <p>
              Monitoreo en tiempo real de la flota y despachos de
              hidrocarburos.
            </p>
          </div>

          <div className="header-actions">
            <button className="secondary-btn">Exportar Reporte</button>
            <button className="primary-btn">Crear Envío</button>
          </div>
        </section>

        {/* METRICS */}
        <section className="metrics-grid">
          <div className="metric-card">
            <div>
              <span>ENVÍOS ACTIVOS</span>
              <h2>24</h2>
              <p>+3 desde la última hora</p>
            </div>

            <div className="metric-icon blue">🚛</div>
          </div>

          <div className="metric-card">
            <div>
              <span>ENTREGADOS HOY</span>
              <h2>156</h2>
              <p>Cumplimiento del 98.2%</p>
            </div>

            <div className="metric-icon">✔</div>
          </div>

          <div className="metric-card">
            <div>
              <span>ALERTAS CRÍTICAS</span>
              <h2>03</h2>
              <p>Requiere atención inmediata</p>
            </div>

            <div className="metric-icon red">⚠</div>
          </div>
        </section>

        {/* TABLE */}
        <section className="table-card">
          <div className="table-top">
            <div>
              <h2>Historial de Envíos Recientes</h2>
              <span>Total: 428</span>
            </div>

            <div className="table-actions">
              <input
                type="text"
                placeholder="Buscar ID, Origen..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <button>⏷</button>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Tracking ID</th>
                <th>Origen / Refinería</th>
                <th>Destino / Estación</th>
                <th>Estado</th>
                <th>Chofer</th>
                <th>Última Act.</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {filteredShipments.map((shipment) => (
                <tr key={shipment.id}>
                  <td className="tracking">{shipment.id}</td>
                  <td>
                    <strong>{shipment.origen}</strong>
                    <p>Terminal Regional</p>
                  </td>
                  <td>
                    <strong>{shipment.destino}</strong>
                    <p>Punto de Entrega B2B</p>
                  </td>
                  <td>
                    <span
                      className={`status ${shipment.status
                        .toLowerCase()
                        .replace(/\s/g, "")}`}
                    >
                      {shipment.status}
                    </span>
                  </td>
                  <td>{shipment.chofer}</td>
                  <td>{shipment.ultima}</td>
                  <td>
                    <Link to={`/shipment/${shipment.id}`}>
                      Detalle
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pagination">
            <button>Anterior</button>
            <button className="active-page">1</button>
            <button>2</button>
            <button>3</button>
            <button>Siguiente</button>
          </div>
        </section>

        {/* ALERTS */}
        <section className="bottom-alerts">
          <div className="alert-card">
            <h3>Sugerencia del Sistema</h3>
            <p>
              Hay congestión reportada en la Refinería Campana.
              Se recomienda priorizar rutas alternativas.
            </p>
          </div>

          <div className="alert-card">
            <h3>Estado de Servidores</h3>
            <p>
              Todos los sistemas GPS y telemetría están operando con
              normalidad.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}