import { useNavigate } from "react-router-dom"; 
import { useState, useEffect, Fragment } from "react";
import { administrador } from '@/api';
import "../styles/gestionTransportista.css";
import "../styles/statusBadge.css";
import StatusBadge from "@/components/StatusBadge";
import { useTranslation } from "react-i18next";


export default function GestionTransportista( { user } ) {
    const { t } = useTranslation("transportista");
    const navigate = useNavigate();

    const [transportistas, setTransportistas] = useState([]);

    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState(""); 
    const [expandedId, setExpandedId] = useState(null); 


    const [showModal, setShowModal] = useState(false);
    const [selectedUsuarioId, setSelectedUsuarioId] = useState(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            const fetchData = async () => {
                try {
                    const response = await administrador.obtenerUsuarios();
                    console.log("Datos obtenidos de la API:", response);
                    setTransportistas(response.filter(usuario => usuario.rol === "TRANSPORTISTA"));
                    setLoading(false);
                } catch (error) {
                    console.error("Error al obtener usuarios:", error);
                }
            };
            fetchData();
        }, 1000);
    }, []);

    const toggleExpand = (id) => {
        setExpandedId((prev) => (prev === id ? null : id));
    };

    const filteredUsers = transportistas.filter((user) => {
        const searchText = (search || "").toLowerCase().trim();

        // Convertimos todos los campos a string y minúsculas
        const fields = [
            user.nombre,
            user.apellido,
            user.legajo,
            user.dni ? String(user.dni) : "",
            user.cuit,
            user.empresa,
            user.tipoVinculo,
        ];

        const matchesSearch =
            fields.some(field =>
                (field || "").toLowerCase().includes(searchText)
            );

        return matchesSearch;
    });

    if (loading) {
        return (
            <div className="confirmar-loading-screen">
                <div className="confirmar-loader"></div>
                <h2>{t("management.loading")}</h2>
            </div>
        );
    }

    return (
        <div className="gestion-transportista-layout">
            <main className="gestion-transportista-content">
                <section className="gestion-transportista-header">
                    <div>
                        <h1>{t("management.title")}</h1>
                            <p>
                                {t("management.description")}
                            </p>
                    </div>
                </section>

                <section className="gestion-transportista-table">
                    <div className="table-header">
                        <div>
                            <h2>{t("management.registeredUsers")} {transportistas.length}</h2>
                        </div>

                        <div className="search-container">
                            <input
                            type="text"
                            placeholder={`🔎 ${t("management.search")}`}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <table>
                        <thead>
                            <th>{t("table.legajo")}</th>
                            <th>{t("table.carrier")}</th>
                            <th>{t("table.dni")}</th>
                            <th>{t("table.cuit")}</th>
                            <th>{t("table.relationshipType")}</th>
                            <th>{t("table.company")}</th>
                            <th>{t("table.status")}</th>
                            <th>{t("table.actions")}</th>
                        </thead>

                        <tbody>
                            {filteredUsers.map((usuario) => (
                                <Fragment key={usuario.id}>

                                    <tr>
                                        <td className="legajo">{usuario.legajo}</td>
                                        <td>{usuario.nombre} {usuario.apellido}</td>
                                        <td>{usuario.dni}</td>
                                        <td>{usuario.cuit}</td>
                                        <td>{usuario.tipoVinculo}</td>
                                        <td>{usuario.empresa}</td>
                                        {usuario.activo ? (
                                            <td><StatusBadge estado="ACTIVO"></StatusBadge></td>
                                        ) : (
                                            <td><StatusBadge estado="NO ACTIVO"></StatusBadge></td>
                                        )}
                                        <td>
                                            <div className="actions-table">
                                                {usuario.activo ? (

                                                    <button 
                                                        className="confirmar-detalles"
                                                        onClick={() => toggleExpand(usuario.id)}
                                                    >
                                                        {expandedId === usuario.id ? (
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
                                                ) : (
                                                    null
                                                )}

                                                {usuario.activo ? (
                                                    <button className="editar-envio">
                                                        <svg 
                                                            xmlns="http://www.w3.org/2000/svg" 
                                                            width="18" 
                                                            height="18" 
                                                            viewBox="0 0 24 24" 
                                                            fill="none" 
                                                            stroke="#f97316"
                                                            strokeWidth="2"
                                                            >
                                                            <path d="M12 20h9"/>
                                                            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
                                                        </svg>
                                                    </button>
                                                ) : (
                                                    null
                                                )}

                                                {usuario.activo ? (
                                                    <button
                                                className="rechazar-envio" 
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
                                                ) : (
                                                    <strong>{t("table.noActions")}</strong>
                                                )}
                                            </div>
                                        </td>
                                    </tr>

                                    {/* ACA SE MOSTRARAN TODOS LOS DOCUMENTOS DEL TRANSPORTISTA */}
                                    {expandedId === usuario.id && (
                                        <tr className="fila-expandida">
                                            <td colSpan="8">
                                                <div className="detalle-envio">
                                                    <p><strong>{t("details.document")}:</strong> {t("details.test")}</p>
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