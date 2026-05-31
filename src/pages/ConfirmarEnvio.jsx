import { data, Link, useNavigate } from "react-router-dom";
import { useState, useEffect, Fragment } from "react";
import "../styles/confirmarEnvio.css";
import "../styles/statusBadge.css";
import StatusBadge from "@/components/StatusBadge";
import { envios } from '@/api';

export default function ConfirmarEnvio({ user }) {
    const navigate = useNavigate();

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

    const confirmarEnvio = (id) => {
        const confirmacion = window.confirm(`¿Estás seguro de que deseas confirmar el envío con ID ${id}?`);

        if (confirmacion) {
            const fetchConfirmar = async () => {
                try {
                    await envios.confirmarEnvio(id);
                    console.log(`Envío confirmado con ID: ${id}`);

                    // 🔄 REFRESCAR DATOS (sin recargar página)
                    window.location.reload();

                } catch (error) {
                    console.error(`Error al confirmar envío con ID: ${id}`, error);
                }
            };

            fetchConfirmar();
        }
    };

    const rechazarEnvio = (id, motivo) => {
        const confirmacion = window.confirm(`¿Estás seguro de que deseas rechazar el envío con ID ${id}?`);
        if (confirmacion) {
            const fetchRechazar = async () => {
                try {
                    await envios.rechazarEnvio(id, motivo);
                    console.log(`Envío rechazado con ID: ${id}`);
                } catch (error) {
                    console.error(`Error al rechazar envío con ID: ${id}`, error);
                }
            };

            fetchRechazar();
        }
    }

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

        return !shipment.confirmado && matchesSearch;
    });

    if (loading) {
        return (
            <div className="confirmar-loading-screen">
                <div className="confirmar-loader"></div>
                <h2>Cargando nuevas órdenes a confirmar...</h2>
            </div>
        );
    }

    return (
        <div className="confirmar-envio-container">
            <main className="confirmar-dashboard-content">
                <section className="confirmar-header">
                    <div>
                        <h1>Confirmar nuevas órdenes</h1>
                        <p>
                            Aquí podrás confirmar las órdenes entrantes al sistema. Revisa los detalles de cada orden y confirma su estado para mantener el sistema actualizado.
                        </p>
                    </div>
                </section>

                <section className="shipments-table">
                    <div className="table-header">
                        <div>
                            <h2>Órdenes pendientes: {filteredShipments.length}</h2>
                        </div>

                        <div className="confirmar-actions">
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
                                <th>Tipo Combustible</th>
                                <th>Transportista</th>
                                <th>Fecha de Creación</th>
                                <th>Estado</th>
                                <th>Acciones</th>
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
                                        <td>{shipment.combustible}</td>
                                        <td>
                                            {shipment.transportista}
                                        </td>
                                        <td>{formatearFecha(shipment.fechaCreacion)}</td>
                                        <td><StatusBadge estado="PENDIENTE A CONFIRMAR"></StatusBadge></td>
                                        <td>
                                            <div className="actions-table">
                                            <button
                                                className="confirmar-detalles"
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

                                            <button className="confirmar-envio" onClick={() => confirmarEnvio(shipment.id)}>
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
                                            
                                            <button className="rechazar-envio" onClick={() => {
                                                    setSelectedShipmentId(shipment.id);
                                                    setShowModal(true);
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
                                                <line x1="6" y1="6" x2="18" y2="18" />
                                                <line x1="18" y1="6" x2="6" y2="18" />
                                                </svg>
                                            </button>
                                            </div>
                                        </td>
                                    </tr>

                                    {/* FILA EXPANDIDA: Se mostraran los datos que necesita el supervisor para confirmar el envio*/}
                                    {expandedId === shipment.id && (
                                        <tr className="fila-expandida">
                                            <td colSpan="7">
                                                <div className="detalle-envio">
                                                    <p><strong>Patente del Camion:</strong> {shipment.camionPatente}</p>
                                                    <p><strong>Patente del Acoplado:</strong> {shipment.acopladoPatente}</p>
                                                    <p><strong>Litros Cargados:</strong> {shipment.litrosCargados} Lts.</p>
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
                        onClick={() => {
                            rechazarEnvio(selectedShipmentId, motivo);
                            setShowModal(false);
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