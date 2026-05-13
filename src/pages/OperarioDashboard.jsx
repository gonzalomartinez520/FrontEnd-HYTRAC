import { data, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "../styles/operarioDashboard.css";
import "../styles/statusBadge.css";
import StatusBadge from "@/components/StatusBadge";
import { envios } from '@/api';

/* const mockShipments = [
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
]; */

export default function OperarioDashboard({ user }) {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [shipments, setShipments] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      const fetchData = async () => {
        try {
          const response = await envios.getAll();
          console.log("Datos obtenidos de la API:", response);
          setShipments(response);
        } catch (error) {
          console.error("Error al obtener envíos:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const filteredShipments = shipments.filter((shipment) => {
    const searchText = (search || "").toLowerCase();

    const fields = [
      shipment.plantaDespachoNombre,
      shipment.estacionDestinoNombre,
      shipment.transportistaNombre,
    ];

    return (
      String(shipment.id).includes(searchText) ||
      fields.some(field =>
        (field || "").toLowerCase().includes(searchText)
      )
    );
  });

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
        </section>

        {/* TABLE */}
        <section className="table-card">
          <div className="table-top">
            <div>
              <h2>Historial de Órdenes Recientes</h2>
              <span>Órdenes encontradas: {filteredShipments.length}</span>
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
                    <strong>{shipment.plantaDespachoNombre}</strong>
                  </td>
                  <td>
                    <strong>{shipment.estacionDestinoNombre}</strong>
                  </td>
                  <td>
                    <StatusBadge estado={shipment.estado} />
                  </td>
                  <td>{shipment.transportistaNombre}</td>
                  <td>{shipment.fechaCreacion}</td>
                  <td>
                    <Link to={`/ordenes/${shipment.id}`}>
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
      </main>
    </div>
  );
}