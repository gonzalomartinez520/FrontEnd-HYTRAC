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

  const [showModal, setShowModal] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [selectedShipment, setSelectedShipment] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const fetchData = async () => {
        try {
          const response = await datos.getIncidencias();

          const incidenciasNoResueltas = response.filter(i => !i.resuelto);
          console.log(incidenciasNoResueltas);
          setIncidencias(incidenciasNoResueltas);

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
      String(shipment.trackingId).includes(searchText) ||
      fields.some(field =>
        (field || "").toLowerCase().includes(searchText)
      )
    );
  });

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const confirmarIncidencia = (remito, payload) => {
    const confirmacion = window.confirm("¿Confirmar incidencia?");

    if (confirmacion) {
      const fetchConfirmar = async () => {
        try {
          await envios.gestionarIncidencia(remito, payload);
          window.location.reload();
        } catch (error) {
          console.log(`Error al confirmar incidencia`);
        }
      };

      fetchConfirmar();
    }
  };

  const rechazarIncidencia = (remito, payload, motivo) => {
    const confirmacion = window.confirm("¿Rechazar incidencia?");

    if (confirmacion) {
      const fetchRechazar = async () => {
        try {
          await envios.gestionarIncidencia(remito, payload);
          //Notificacion al Transportista con el motivo de rechazo 
          //de Incidencia.
          window.location.reload();
        } catch (error) {
          console.log(`Error al rechazar incidencia`);
        }
      };

      fetchRechazar();
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
                    <td className="tracking">{shipment.trackingId}</td>

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
                          {expandedId === incidencia.id ? (// OJO TACHADO
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              height="24"
                              viewBox="0 0 24 24"
                              width="24"
                              fill="currentColor"
                          >
                            {/* línea del ojo */}
                            <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z" opacity="0.3"/>
                                                      
                            {/* línea tachada */}
                            <line x1="3" y1="3" x2="21" y2="21" stroke="currentColor" strokeWidth="2"/>

                            {/* pupila */}
                            <circle cx="12" cy="12" r="3"/>
                            </svg>
                            ) : (
                            // OJO ABIERTO
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
                            )}
                        </button>

                        <button
                          className="confirmar-incidencias"
                          onClick={async () => {
                            try {
                              const payload = {
                                legajo: localStorage.getItem("legajo"),
                                motivo: null,
                              };
                              console.log(payload);
                              const incidencia = confirmarIncidencia(shipment.numeroRemito, payload);

                            } catch (error) {
                              console.error("Error al confirmar incidencia:", error);
                              console.log("DATA:", error.response?.data);
                              console.log("STATUS:", error.response?.status);
                            }
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            height="22"
                            viewBox="0 0 24 24"
                            width="22"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                          <path d="M20 6L9 17l-5-5" />
                          </svg>
                        </button>

                        <button 
                          className="rechazar-incidencias"
                          onClick={() => {
                            setSelectedShipment(shipment);
                            setShowModal(true);
                          }}> 
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            height="22"
                            viewBox="0 0 24 24"
                            width="22"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                          <line x1="6" y1="6" x2="18" y2="18" />
                          <line x1="18" y1="6" x2="6" y2="18" />
                          </svg>
                        </button>

                      </div>
                    </td>
                  </tr>

                  {/* 🔥 FILA EXPANDIDA */}
                  {expandedId === incidencia.id && (
                    <tr className="fila-expandida">
                      <td colSpan="6">

                        <div className="datos-incidencias">
                          <p><strong>Patente del Camion:</strong> {shipment.camionPatente}</p>
                          <p><strong>Patente del Acoplado:</strong> {shipment.acopladoPatente}</p>
                          <p><strong>Combustible:</strong> {shipment.combustible}</p>
                          <p><strong>Fecha Incidente:</strong> {formatearFecha(incidencia.fechaIncidente)}</p>
                          <p><strong>Tipo de Incidencia:</strong> {incidencia.tipoIncidencia}</p>
                          <p><strong>Descripción:</strong> {incidencia.descripcion}</p>
                          <p><strong>Número de Remito:</strong> {shipment.numeroRemito}</p>
                          <p><strong>COT:</strong> {shipment.cot}</p>
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
      {showModal && (
                <div className="modal-overlay">
                    <div className="modal">
                    <h2>Motivo de rechazo</h2>

                    <textarea
                        placeholder="Ingrese el motivo..."
                        value={motivo}
                        onChange={(e) => setMotivo(e.target.value)}
                    />

                    <div className="modal-buttons">
                        <button
                        className="confirmar"
                        onClick={async () => {
                            try {
                              const payload = {
                                legajo: localStorage.getItem("legajo"),
                                motivo: "RECHAZADO",
                              };
                              console.log(payload);
                              const incidencia = rechazarIncidencia(selectedShipment.numeroRemito, payload, motivo);
                              
                            } catch (error) {
                              console.error("Error al confirmar incidencia:", error);
                              console.log("DATA:", error.response?.data);
                              console.log("STATUS:", error.response?.status);
                            }
                            setMotivo("");
                        }}
                        >
                        Confirmar
                        </button>

                        <button
                        className="cancelar"
                        onClick={() => {
                            setShowModal(false);
                            setMotivo("");
                        }}
                        >
                        Cancelar
                        </button>
                    </div>
                    </div>
                </div>
            )}
    </div>
  );
}