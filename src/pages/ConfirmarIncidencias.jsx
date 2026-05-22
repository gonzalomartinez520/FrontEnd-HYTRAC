import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, Fragment } from "react";
import "../styles/confirmarIncidencias.css";
import "../styles/statusBadge.css";
import { envios, datos } from '@/api';

export default function ConfirmarIncidencias({ user }) {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [shipments, setShipments] = useState([]);
  const [incidencias, setIncidencias] = useState([]);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const fetchData = async () => {
        try {
          const response = await datos.getIncidencias();
          setIncidencias(response);

          // 🔥 obtener remitos únicos
          const remitosUnicos = [...new Set(
            response.map(i => i.ordenNumeroRemito)
          )];

          // 🔥 traer envíos asociados
          const ordenesPromises = remitosUnicos.map(async (remito) => {
            try {
              return await envios.getOrdenByRemito(remito);
            } catch (error) {
              console.error("Error al obtener orden:", error);
              return null;
            }
          });

          const ordenes = await Promise.all(ordenesPromises);
          const ordenesFiltradas = ordenes.filter(o => o !== null);

          setShipments(ordenesFiltradas);

        } catch (error) {
          console.error("Error al obtener incidencias:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // 🔥 combinar incidencia + shipment
  const dataCombinada = incidencias.map((inc) => {
    const shipment = shipments.find(
      (s) => s.numeroRemito === inc.ordenNumeroRemito
    );

    return {
      incidencia: inc,
      shipment: shipment
    };
  }).filter(item => item.shipment !== undefined);

  // 🔥 filtro de búsqueda
  const filteredData = dataCombinada.filter(({ shipment }) => {
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

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const confirmarEstadoNuevo = (id) => {
    const confirmacion = window.confirm("¿Confirmar cambio de estado?");

    if (confirmacion) {
      const fetchConfirmar = async () => {
        try {
          await envios.confirmarEstadoNuevo(id);
          window.location.reload();
        } catch (error) {
          console.log(`Error al confirmar estado ID: ${id}`);
        }
      };

      fetchConfirmar();
    }
  };

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

  if (loading) {
    return (
      <div className="confirmar-incidencias-loading-screen">
        <div className="confirmar-incidencias-loader"></div>
        <h2>Cargando incidencias registradas...</h2>
      </div>
    );
  }

  return (
    <div className="confirmar-incidencias-container">
      <main className="incidencias-dashboard-content">

        <section className="incidencias-header">
          <div>
            <h1>Confirmar incidencias registradas</h1>
            <p>
              En este panel podrás revisar las incidencias entrantes
              al sistema para verificarlas con los datos correspondiente.
            </p>
          </div>
        </section>

        <section className="incidencias-table-section">
          <div className="incidencias-table-header">
            <h2>Incidencias a confirmar: {filteredData.length}</h2>

            <div className="confirmar-incidencias-buscador">
              <input
                type="text"
                placeholder="🔎 Busqueda por ID, ruta o transportista..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Ruta Designada</th>
                <th>Responsable</th>
                <th>Fecha de Incidencia</th>
                <th>Tipo de Incidencia</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {filteredData.map(({ shipment, incidencia }) => (
                <Fragment key={incidencia.id}>

                  <tr>
                    <td className="tracking">{shipment.id}</td>

                    <td>
                      <strong>
                        {shipment.plantaDespacho} - {shipment.estacionDestino}
                      </strong>
                    </td>

                    <td>{shipment.transportistaNombre} {shipment.transportistaApellido}</td>

                    <td>{formatearFecha(incidencia.fechaIncidente)}</td>

                    <td>
                      <span className="badge-incidencia">
                        {incidencia.tipoIncidencia}
                      </span>
                    </td>

                    <td>
                      <div className="incidencias-actions-table">

                        <button
                          className="incidencias-detalles"
                          onClick={() => toggleExpand(incidencia.id)}
                        >
                          {expandedId === incidencia.id ? "👁‍🗨" : "👁"}
                        </button>

                        <button
                          className="confirmar-incidencias"
                          onClick={() => confirmarEstadoNuevo(shipment.id)}
                        >
                          ✔
                        </button>

                        <button className="rechazar-incidencias">
                          ✖
                        </button>

                      </div>
                    </td>
                  </tr>

                  {/* 🔥 FILA EXPANDIDA */}
                  {expandedId === incidencia.id && (
                    <tr className="fila-expandida">
                      <td colSpan="6">

                        <div className="datos-incidencias">
                          <p><strong>Remito:</strong> {shipment.numeroRemito}</p>
                          <p><strong>Tipo:</strong> {incidencia.tipo}</p>
                          <p><strong>Descripción:</strong> {incidencia.descripcion}</p>
                          <p><strong>Fecha:</strong> {formatearFecha(incidencia.fechaCreacion)}</p>
                        </div>

                      </td>
                    </tr>
                  )}

                </Fragment>
              ))}
            </tbody>
          </table>
        </section>

      </main>
    </div>
  );
}