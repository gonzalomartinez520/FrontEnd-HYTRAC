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

    const matchesSearch =
      String(shipment.trackingId).includes(searchText) ||
        fields.some(field =>
            (field || "").toLowerCase().includes(searchText)
          );

      return shipment.confirmado && matchesSearch;
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
                <th>Ruta Designada</th>
                <th>Combustible</th>
                <th>Estado</th>
                <th>Chofer</th>
                <th>Fecha Creación</th>
                <th>Detalle</th>
              </tr>
            </thead>

            <tbody>
              {filteredShipments.map((shipment) => (
                <tr key={shipment.id}>
                      <td className="tracking" data-label="ID">{shipment.trackingId}</td>
                  <td data-label="Ruta Designada">
                    <strong>{shipment.plantaDespacho} - {shipment.estacionDestino}</strong>
                  </td>

                  <td data-label="Combustible">
                    {shipment.combustible}
                  </td>

                  <td data-label="Estado">
                    <StatusBadge estado={shipment.estado}/>
                  </td>
                  <td data-label="Chofer">{shipment.transportistaNombre} {shipment.transportistaApellido}</td>
                  <td data-label="Fecha Creación">{formatearFecha(shipment.fechaCreacion)}</td>
                  <td data-label="Detalle">
                    <div className="detalle-button-container">
                    <button className="ver-detalle" onClick={() => navigate(`/ordenes/${shipment.id}`)}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="24"
                        viewBox="0 0 24 24"
                        width="24"
                        fill="currentColor"
                        >
                            <path d="M12 6c-4.79 0-8.73 3.11-10 6 1.27 2.89 5.21 6 10 6s8.73-3.11 10-6c-1.27-2.89-5.21-6-10-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>
                            <circle cx="12" cy="12" r="2.5"/>
                        </svg>
                    </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* LUEGO SE VERA COMO HACER PARA PASAR DE PAGINA Y VER OTROS ENVIOS, POR AHORA QUEDA COMENTADO */}
          {/* <div className="pagination">
            <button>Anterior</button>
            <button className="active-page">1</button>
            <button>2</button>
            <button>3</button>
            <button>Siguiente</button>
          </div> */}
        </section>
      </main>
    </div>
  );
}