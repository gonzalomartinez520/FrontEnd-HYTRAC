import { data, Link, useNavigate } from "react-router-dom";
import { useState, useEffect, Fragment } from "react";
import "../styles/confirmarInicioViaje.css";
import "../styles/statusBadge.css";
import StatusBadge from "@/components/StatusBadge";
import { envios } from '@/api';

export default function ConfirmarInicioViaje( { user } ) {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [shipments, setShipments] = useState([]);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  
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

    const confirmarEstadoNuevo = (id) => {
        const confirmacion = window.confirm(`¿Estás seguro de que deseas confirmar cambio de estado?`);

        if (confirmacion) {
            const fetchConfirmar = async () => {
                try {
                    await envios.confirmarEstadoNuevo(id);
                    console.log(`Cambio de estado confirmado con ID: ${id}`);

                    window.location.reload();
                } catch (error) {
                    console.log(`Error de cambio de estado con ID: ${id}`)
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

    const filteredShipments = shipments.filter((shipment) => {
        const searchText = (search || "").toLowerCase();

        const fields = [
            shipment.plantaDespachoNombre,
            shipment.estacionDestinoNombre,
            shipment.transportistaNombre,
            shipment.combustibleTipo,
        ];

        const matchesSearch =
            String(shipment.id).includes(searchText) ||
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
                <h2>Cargando inicio de viajes a confirmar...</h2>
            </div>
        );
    }

    return (
        <div className="confirmar-cambio-estado-container">
            <main className="cambio-estado-dashboard-content">
                <section className="cambio-estado-header">
                    <div>
                        <h1>Confirmar inicio de viajes</h1>
                        <p>
                            En este panel podrás revisar y confirmar los inicios de viajes de cada orden
                            y validar los datos para confirmar el inicio de la orden.
                        </p>
                    </div>
                </section>

                <section className="cambio-estado-table-section">
                    <div className="cambio-estado-table-header">
                        <div>
                            <h2>Inicio de viajes a confirmar: {filteredShipments.length}</h2>
                        </div>

                        <div className="confirmar-cambio-estado-buscador">
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
                                <th>Responsable</th>  {/* Ademas se dice si es transportista o jefe de estacion */}
                                <th>Fecha de Cambio de Estado</th>
                                <th>Estado</th> {/* Buscar un nombre mejor para el campo */}
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        
                        <tbody>
                            {filteredShipments.map((shipment) => (
                                <Fragment key={shipment.id}>
                                    
                                    {/* FILA PRINCIPAL */}
                                    <tr>
                                        <td className="tracking">{shipment.id}</td>
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

                                            <button className="confirmar-cambio-estado" onClick={() => confirmarEstadoNuevo(shipment.id)}> {/* Boton de confirmar cambio de estado, luego agregar funcion */}
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
                                            
                                            <button className="rechazar-cambio-estado"> {/* Boton de rechazar cambio de estado, luego agregar funcion */}
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
                                                    <p><strong>ID:</strong> {shipment.id}</p>
                                                    <p><strong>Estado:</strong> {shipment.estado}</p>
                                                    <p><strong>Combustible:</strong> {shipment.combustibleTipo}</p>
                                                    <p><strong>Responsable:</strong> {shipment.transportistaNombre} {shipment.transportistaApellido}</p>
                                                    <p><strong>Fecha creación:</strong> {formatearFecha(shipment.fechaCreacion)}</p>
                                                    <p><strong>Origen:</strong> {shipment.plantaDespachoNombre}</p>
                                                    <p><strong>Destino:</strong> {shipment.estacionDestinoNombre}</p>
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