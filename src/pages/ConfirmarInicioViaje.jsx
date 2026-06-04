import { data, Link, useNavigate } from "react-router-dom";
import { useState, useEffect, Fragment } from "react";
import { useTranslation } from "react-i18next";
import "../styles/confirmarInicioViaje.css";
import "../styles/statusBadge.css";
import StatusBadge from "@/components/StatusBadge";
import { envios } from '@/api';

export default function ConfirmarInicioViaje( { user } ) {
  const navigate = useNavigate();
  const { t } = useTranslation("supervisor");

  const [legajoSupervisor, setLegajoSupervisor] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [shipments, setShipments] = useState([]);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [selectedShipmentId, setSelectedShipmentId] = useState(null);
  
  useEffect(() => {
    const timer = setTimeout(() => {
        const fetchData = async () => {
            try {
                const response = await envios.getAllSupervisor();
                console.log("Datos obtenidos de la API:", response);
                setShipments(response);
                setLegajoSupervisor(localStorage.getItem("legajo"));
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

    // Función para alternar la fila expandida
    const toggleExpand = (id) => {
        setExpandedId((prev) => (prev === id ? null : id));
    };

    const confirmarInicioViaje = (id, payload) => {
        const confirmacion = window.confirm(t("confirmarInicioViaje.confirmPrompt"));

        if (confirmacion) {
            const fetchConfirmar = async () => {
                try {
                    await envios.confirmarInicioViaje(id, payload);
                    console.log(`Inicio de viaje confirmado con ID: ${id}`);

                    window.location.reload();
                } catch (error) {
                    console.log(`Error de inicio de viaje con ID: ${id}`)
                }
            };

            fetchConfirmar();
        }
    };
    
    const rechazarInicioViaje = (id, payload) => {
        const confirmacion = window.confirm(t("confirmarInicioViaje.rejectPrompt"));

        if(confirmacion) {
            const fetchRechazar = async () => {
                try {
                    await envios.rechazarInicioViaje(id, payload);
                    console.log(`Inicio de viaje rechazado con ID: ${id}`);

                    window.location.reload();
                } catch {
                    console.log(`Error de rechazo de inicio de viaje con ID: ${id}`)
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

    const filteredShipments = shipments.filter((shipment) => {
        const searchText = (search || "").toLowerCase();

        const fields = [
            shipment.plantaDespachoNombre,
            shipment.estacionDestinoNombre,
            shipment.transportistaNombre,
            shipment.combustibleTipo,
        ];

        const matchesSearch =
            String(shipment.trackingId).includes(searchText) ||
            fields.some(field =>
                (field || "").toLowerCase().includes(searchText)
            );

        const isPendienteInicio = 
            (shipment.estado || "").toLowerCase() === "pendiente de inicio de viaje";

        return matchesSearch && isPendienteInicio;
    });

    if (loading) {
        return (
            <div className="confirmar-cambio-estado-loading-screen">
                <div className="confirmar-cambio-estado-loader"></div>
                <h2>{t("confirmarInicioViaje.loading")}</h2>
            </div>
        );
    }

    return (
        <div className="confirmar-cambio-estado-container">
            <main className="cambio-estado-dashboard-content">
                <section className="cambio-estado-header">
                    <div>
                        <h1>{t("confirmarInicioViaje.title")}</h1>
                        <p>
                            {t("confirmarInicioViaje.subtitle")}
                        </p>
                    </div>
                </section>

                <section className="cambio-estado-table-section">
                    <div className="cambio-estado-table-header">
                        <div>
                            <h2>{t("confirmarInicioViaje.count", { count: filteredShipments.length })}</h2>
                        </div>

                        <div className="confirmar-cambio-estado-buscador">
                            <input
                                type="text"
                                placeholder={t("confirmarInicioViaje.searchPlaceholder")}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>{t("confirmarInicioViaje.table.id")}</th>
                                <th>{t("confirmarInicioViaje.table.route")}</th>
                                <th>{t("confirmarInicioViaje.table.responsible")}</th>
                                <th>{t("confirmarInicioViaje.table.requestDate")}</th>
                                <th>{t("confirmarInicioViaje.table.status")}</th>
                                <th>{t("confirmarInicioViaje.table.actions")}</th>
                            </tr>
                        </thead>
                        
                        <tbody>
                            {filteredShipments.map((shipment) => (
                                <Fragment key={shipment.id}>
                                    
                                    {/* FILA PRINCIPAL */}
                                    <tr>
                                        <td className="tracking">{shipment.trackingId}</td>
                                        <td>
                                            <strong>{shipment.plantaDespacho} - {shipment.estacionDestino}</strong>
                                        </td>
                                        <td>
                                            {/* Segun el responsable, aparece el nombre */}
                                            {shipment.transportista}
                                        </td>
                                        <td>{formatearFecha(shipment.fechaCreacion)}</td>  {/* Cambiar por fecha de cambio de estado */}
                                        <td><StatusBadge estado={shipment.estado}/></td>
                                        <td>
                                            <div className="cambio-estado-actions-table">
                                            <button
                                                className="cambio-estado-detalles"
                                                onClick={() => toggleExpand(shipment.id)}
                                            >
                                                {expandedId === shipment.id ? (
                                                    // OJO TACHADO
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

                                            <button className="confirmar-cambio-estado"
                                                onClick={async () => {
                                                    try {
                                                    const payload = {
                                                        legajoSupervisor: legajoSupervisor,
                                                    };
                                                    console.log(payload);
                                                    const inicioViaje = confirmarInicioViaje(shipment.id, payload);

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
                                            
                                            <button className="rechazar-cambio-estado" onClick={() => {
                                                    setSelectedShipmentId(shipment.id);
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

                                    {/* FILA EXPANDIDA: Se mostraran los cambios en los datos para que el supervisor los revise */}
                                    {expandedId === shipment.id && (
                                        <tr className="fila-expandida">
                                            <td colSpan="7">
                                                <div className="datos-cambio-estado">
                                                    <p><strong>{t("confirmarInicioViaje.expanded.truckPlate")}:</strong> {shipment.camionPatente}</p>
                                                    <p><strong>{t("confirmarInicioViaje.expanded.trailerPlate")}:</strong> {shipment.acopladoPatente}</p>
                                                    <p><strong>{t("confirmarInicioViaje.expanded.fuel")}:</strong> {shipment.combustible}</p>
                                                    <p><strong>{t("confirmarInicioViaje.expanded.createdAt")}:</strong> {formatearFecha(shipment.fechaCreacion)}</p>
                                                    <p><strong>{t("confirmarInicioViaje.expanded.remito")}:</strong> {shipment.numeroRemito}</p>
                                                    <p><strong>{t("confirmarInicioViaje.expanded.cot")}:</strong> {shipment.cot}</p>
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
                    <h2>{t("confirmarInicioViaje.modal.title")}</h2>

                    <textarea
                        placeholder={t("confirmarInicioViaje.modal.placeholder")}
                        value={motivo}
                        onChange={(e) => setMotivo(e.target.value)}
                    />

                    <div className="modal-buttons">
                        <button
                        className="confirmar"
                        onClick={async () => {
                            try {
                                const payload = {
                                legajoSupervisor: legajoSupervisor,
                                motivoRechazo: motivo,
                                };

                                console.log(payload);
                                const inicioViaje = rechazarInicioViaje(selectedShipmentId, payload);

                            } catch (error) {
                                console.error("Error al confirmar incidencia:", error);
                                console.log("DATA:", error.response?.data);
                                console.log("STATUS:", error.response?.status);
                        
                            }
                            setShowModal(false);
                            setMotivo("");
                        }}
                        >
                        {t("confirmarInicioViaje.modal.confirm")}
                        </button>

                        <button
                        className="cancelar"
                        onClick={() => {
                            setShowModal(false);
                            setMotivo("");
                        }}
                        >
                        {t("confirmarInicioViaje.modal.cancel")}
                        </button>
                    </div>
                    </div>
                </div>
            )}
        </div>
    );
}
