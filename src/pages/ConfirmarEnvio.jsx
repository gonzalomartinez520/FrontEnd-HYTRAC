import { data, Link, useNavigate } from "react-router-dom";
import { useState, useEffect, Fragment } from "react";
import { useTranslation } from "react-i18next";
import "../styles/confirmarEnvio.css";
import "../styles/statusBadge.css";
import StatusBadge from "@/components/StatusBadge";
import { envios, datos } from '@/api';  

export default function ConfirmarEnvio({ user }) {
    const navigate = useNavigate();
    const { t } = useTranslation("supervisor");
    const { t: tTransportista} = useTranslation("transportista");

    const [legajoSupervisor, setLegajoSupervisor] = useState("");

    const [loading, setLoading] = useState(true);
    const [shipments, setShipments] = useState([]);
    const [search, setSearch] = useState("");
    const [expandedId, setExpandedId] = useState(null); 

    const [transportistas, setTransportistas] = useState([]);
    const [documentosTransportista, setDocumentosTransportista] = useState([]);
    const [loadingDocs, setLoadingDocs] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [motivo, setMotivo] = useState("");
    const [selectedShipmentId, setSelectedShipmentId] = useState(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            const fetchData = async () => {
                try {
                    const response = await envios.getAll();
                    const transportistasData = await datos.getTransportistas();
                    console.log("Datos obtenidos de la API:", response);
                    setShipments(response);
                    setTransportistas(transportistasData);
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

    const getEstadoDocumento = (fechaVencimiento) => {
        const hoy = new Date();
        const vencimiento = new Date(fechaVencimiento);

        if (vencimiento < hoy) return "vencido";

        const diff = (vencimiento - hoy) / (1000 * 60 * 60 * 24);

        if (diff <= 30) return "proximo";

        return "vigente";
    };

    // Función para alternar la fila expandida
    const toggleExpand = async (shipment) => {
        const isOpening = expandedId !== shipment.id;

        setExpandedId((prev) => (prev === shipment.id ? null : shipment.id));

        if (isOpening) {
            try {
                setLoadingDocs(true);

                // 🔹 1. Obtener legajo del shipment
                const legajo = shipment.transportistaLegajo;

                // 🔹 2. Buscar transportista en estado
                const transportista = transportistas.find(t => t.legajo === legajo);

                if (!transportista) {
                    console.warn("Transportista no encontrado");
                    setDocumentosTransportista([]);
                    return;
                }

                // 🔹 3. Llamar API de documentos
                const docs = await datos.getDocumentos(transportista.id);

                console.log("Documentos:", docs);

                // 🔹 4. Guardar documentos
                setDocumentosTransportista(docs);

            } catch (error) {
                console.error("Error al obtener documentos:", error);
                setDocumentosTransportista([]);
            } finally {
                setLoadingDocs(false);
            }
        }
    };

    const confirmarEnvio = (id) => {
        const confirmacion = window.confirm(t("confirmarEnvio.confirmPrompt", { id }));

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

    const rechazarEnvio = (id, payload) => {
        const confirmacion = window.confirm(`¿Estás seguro de que deseas rechazar el envío con ID ${id}?`);
        if (confirmacion) {
            const fetchRechazar = async () => {
                try {
                    await envios.rechazarEnvio(id, payload);
                    console.log(`Envío rechazado con ID: ${id}`);

                    window.location.reload();
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

        return !shipment.confirmado && !shipment.motivoRechazo?.length > 0 && matchesSearch;
    });

    if (loading) {
        return (
            <div className="confirmar-loading-screen">
                <div className="confirmar-loader"></div>
                <h2>{t("confirmarEnvio.loading")}</h2>
            </div>
        );
    }

    return (
        <div className="confirmar-envio-container">
            <main className="confirmar-dashboard-content">
                <section className="confirmar-header">
                    <div>
                        <h1>{t("confirmarEnvio.title")}</h1>
                        <p>
                            {t("confirmarEnvio.subtitle")}
                        </p>
                    </div>
                </section>

                <section className="shipments-table">
                    <div className="table-header">
                        <div>
                            <h2>{t("confirmarEnvio.count", { count: filteredShipments.length })}</h2>
                        </div>

                        <div className="confirmar-actions">
                            <input
                                type="text"
                                placeholder={t("confirmarEnvio.searchPlaceholder")}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>{t("confirmarEnvio.table.id")}</th>
                                <th>{t("confirmarEnvio.table.route")}</th>
                                <th>{t("confirmarEnvio.table.fuelType")}</th>
                                <th>{t("confirmarEnvio.table.carrier")}</th>
                                <th>{t("confirmarEnvio.table.createdAt")}</th>
                                <th>{t("confirmarEnvio.table.status")}</th>
                                <th>{t("confirmarEnvio.table.actions")}</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredShipments.map((shipment) => (
                                <Fragment key={shipment.id}>
                                    
                                    {/* FILA PRINCIPAL */}
                                    <tr>
                                        <td className="tracking" data-label={t("confirmarEnvio.table.id")}>{shipment.trackingId}</td>
                                        <td data-label={t("confirmarEnvio.table.route")}>
                                            <strong>{shipment.plantaDespacho} - {shipment.estacionDestino}</strong>
                                        </td>
                                        <td data-label={t("confirmarEnvio.table.fuelType")}>{shipment.combustible}</td>
                                        <td data-label={t("confirmarEnvio.table.carrier")}>
                                            {shipment.transportistaNombre} {shipment.transportistaApellido}
                                        </td>
                                        <td data-label={t("confirmarEnvio.table.createdAt")}>{formatearFecha(shipment.fechaCreacion)}</td>
                                        <td data-label={t("confirmarEnvio.table.status")}><StatusBadge estado="PENDIENTE A CONFIRMAR"></StatusBadge></td>
                                        <td data-label={t("confirmarEnvio.table.actions")}>
                                            <div className="actions-table">
                                            <button
                                                className="confirmar-detalles"
                                                onClick={() => toggleExpand(shipment)}
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

                                                    <div className="detalle-flex">

                                                        {/* IZQUIERDA → DATOS */}
                                                        <div className="detalle-info">
                                                            <h3>{t("confirmarEnvio.expanded.details")}</h3>

                                                            <p><strong>{t("confirmarEnvio.expanded.truckPlate")}:</strong> {shipment.camionPatente}</p>
                                                            <p><strong>{t("confirmarEnvio.expanded.trailerPlate")}:</strong> {shipment.acopladoPatente}</p>
                                                            <p><strong>{t("confirmarEnvio.expanded.litersLoaded")}:</strong> {shipment.litrosCargados} Lts.</p>
                                                            <p><strong>{t("confirmarEnvio.expanded.remito")}:</strong> {shipment.numeroRemito}</p>
                                                            <p><strong>{t("confirmarEnvio.expanded.cot")}:</strong> {shipment.cot}</p>
                                                        </div>

                                                        {/* DERECHA → DOCUMENTOS */}
                                                        <div className="detalle-documentos">
                                                            <h3>{t("confirmarEnvio.expanded.documents")}</h3>

                                                            <div className="documentos-wrapper">
                                                            {documentosTransportista.length > 0 ? (
                                                                <div className="documentos-container">
                                                                    {documentosTransportista.map((doc) => {
                                                                        const estado = getEstadoDocumento(doc.fechaVencimiento);

                                                                        return (
                                                                            <div key={doc.id} className={`doc-card ${estado}`}>
                                                                                <p>
                                                                                    <strong>{tTransportista("details.document")}:</strong>{" "}
                                                                                    {doc.tipoDocumentoNombre}
                                                                                </p>

                                                                                <p>
                                                                                    <strong>N°:</strong> {doc.nroDocumento}
                                                                                </p>

                                                                                <p>
                                                                                    <strong>{tTransportista("details.expiration")}:</strong>{" "}
                                                                                    {doc.fechaVencimiento}
                                                                                </p>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            ) : (
                                                                <p style={{ marginTop: "10px" }}>
                                                                    {t("confirmarEnvio.expanded.noDocuments")}
                                                                </p>
                                                            )}
                                                        </div>
                                                        </div>

                                                    </div>
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
                    <h2>{t("confirmarEnvio.modal.title")}</h2>

                    <textarea
                        placeholder={t("confirmarEnvio.modal.placeholder")}
                        value={motivo}
                        onChange={(e) => setMotivo(e.target.value)}
                    />

                    <div className="modal-buttons">
                        <button
                        className="confirmar"
                        onClick={ async () => {
                            try {
                                const payload = {
                                    legajoSupervisor: legajoSupervisor,
                                    motivoRechazo: motivo
                                };

                                console.log(payload);
                                await rechazarEnvio(selectedShipmentId, payload);
                            } catch (error) {
                                console.error("Error al rechazar el envío:", error);
                            }
                            setShowModal(false);
                            setMotivo("");
                        }}
                        >
                        {t("confirmarEnvio.modal.confirm")}
                        </button>

                        <button
                        className="cancelar"
                        onClick={() => {
                            setShowModal(false);
                            setMotivo("");
                        }}
                        >
                        {t("confirmarEnvio.modal.cancel")}
                        </button>
                    </div>
                    </div>
                </div>
            )}
        </div>
    );
}
