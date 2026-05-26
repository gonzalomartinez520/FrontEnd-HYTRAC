import { data, Link, useNavigate } from "react-router-dom";
import { useState, useEffect, Fragment } from "react";
import "../styles/confirmarEntregas.css";
import "../styles/statusBadge.css";
import StatusBadge from "@/components/StatusBadge";
import { envios } from '@/api';

export default function ConfirmarEntregas( { user } ) {
  const navigate = useNavigate();
  
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

    // Agregar funciones para confirmar y rechazar ediciones con motivo (aún no implementadas)

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
            shipment.plantaDespacho,
            shipment.estacionDestino,
            shipment.transportistaNombre,
            shipment.combustibleTipo,
        ];

        const matchesSearch =
            String(shipment.id).includes(searchText) ||
            fields.some(field =>
                (field || "").toLowerCase().includes(searchText)
            );

        const isPendienteConfirmacion =
            (shipment.estado || "")
                .trim()
                .toLowerCase() === "pendiente de confirmacion de entrega";

        return matchesSearch && isPendienteConfirmacion;
    });

    if (loading) {
        return (
            <div className="confirmar-edicion-loading-screen">
                <div className="confirmar-edicion-loader"></div>
                <h2>Cargando entregas a confirmar...</h2>
            </div>
        );
    }

    return (
        <div className="confirmar-edicion-container">
            <main className="edicion-dashboard-content">
                <section className="edicion-header">
                    <div>
                        <h1>Confirmar Entregas</h1>
                        <p>
                            Aquí podrá visualizar las órdenes que necesitan verificación para su entrega.
                            </p>
                    </div>
                </section>

                <section className="edicion-table-section">
                    <div className="edicion-table-header">
                        <div>
                            <h2>Entregas a confirmar: {filteredShipments.length}</h2>
                        </div>

                        <div className="confirmar-edicion-buscador">
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
                                <th>Fecha de Solicitud de Entrega</th>
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
                                        <td>
                                            {shipment.transportista}
                                        </td>
                                        <td>{formatearFecha(shipment.fechaCreacion)}</td>
                                        <td><StatusBadge estado={shipment.estado}/></td>
                                        <td>
                                            <div className="edicion-actions-table">
                                            <button
                                                className="edicion-detalles"
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

                                            <button className="confirmar-edicion"> 
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
                                            
                                            <button className="rechazar-edicion" onClick={() => {
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
                                                <div className="datos-editados">
                                                    <p><strong>Patente del Camion:</strong> {shipment.camionPatente}</p>
                                                    <p><strong>Patente del Acoplado:</strong> {shipment.acopladoPatente}</p>
                                                    <p><strong>Combustible:</strong> {shipment.combustible}</p>
                                                    <p><strong>Fecha de creación:</strong> {formatearFecha(shipment.fechaCreacion)}</p>
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