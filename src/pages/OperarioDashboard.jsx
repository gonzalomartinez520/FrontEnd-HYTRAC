import { data, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "../styles/operarioDashboard.css";
import "../styles/statusBadge.css";
import StatusBadge from "@/components/StatusBadge";
import { envios } from '@/api';


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

  const formatearFecha = (fechaString) => {
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
                <th>ID</th>
                <th>Origen / Refinería</th>
                <th>Destino / Estación</th>
                <th>Estado</th>
                <th>Chofer</th>
                <th>Fecha Creación</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {filteredShipments.map((shipment) => (
                <tr key={shipment.id}>
                      <td className="tracking" data-label="ID">{shipment.id}</td>
                  <td data-label="Origen">
                    <strong>{shipment.plantaDespachoNombre}</strong>
                  </td>
                  <td data-label="Destino">
                    <strong>{shipment.estacionDestinoNombre}</strong>
                  </td>
                  <td data-label="Estado">
                    <StatusBadge estado={shipment.estado} />
                  </td>
                  <td data-label="Chofer">{shipment.transportistaNombre} {shipment.transportistaApellido}</td>
                  <td data-label="Fecha Creación">{formatearFecha(shipment.fechaCreacion)}</td>
                  <td data-label="Acciones">
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