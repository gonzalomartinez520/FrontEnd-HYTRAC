import { useNavigate } from "react-router-dom"; 
import { useState, useEffect, Fragment } from "react";
import { administrador } from '@/api';
import "../styles/gestionJefeEstacion.css";
import "../styles/statusBadge.css";
import StatusBadge from "@/components/StatusBadge";
import { useTranslation } from "react-i18next";


export default function GestionJefeEstacion( { user } ) {
    const { t } = useTranslation("jefeEstacion");
    const navigate = useNavigate();

    const [jefesEstacion, setJefesEstacion] = useState([]);

    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState(""); 

    const [showModal, setShowModal] = useState(false);
    const [selectedUsuarioId, setSelectedUsuarioId] = useState(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            const fetchData = async () => {
                try {
                    const response = await administrador.obtenerUsuarios();
                    console.log("Datos obtenidos de la API:", response);
                    setJefesEstacion(response.filter(usuario => usuario.rol === "JEFE_ESTACION"));
                    setLoading(false);
                } catch (error) {
                    console.error("Error al obtener usuarios:", error);
                }
            };
            fetchData();
        }, 1000);
    }, []);

    const filteredUsers = jefesEstacion.filter((user) => {
        const searchText = (search || "").toLowerCase().trim();

        // Convertimos todos los campos a string y minúsculas
        const fields = [
            user.nombre,
            user.apellido,
            user.legajo,
            user.dni ? String(user.dni) : "",
            user.lugarOperativo,
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
        <div className="gestion-jefeEstacion-layout">
            <main className="gestion-jefeEstacion-content">
                <section className="gestion-jefeEstacion-header">
                    <div>
                        <h1>{t("management.title")}</h1>
                            <p>
                                {t("management.description")}
                            </p>
                    </div>
                </section>

                <section className="gestion-jefeEstacion-table">    
                    <div className="table-header">
                        <div>
                            <h2> {t("management.registeredUsers")} {jefesEstacion.length}</h2>
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
                            <tr>
                                <th>{t("table.legajo")}</th>
                                <th>{t("table.stationChief")}</th>
                                <th>{t("table.email")}</th>
                                <th>{t("table.dni")}</th>
                                <th>{t("table.operationalLocation")}</th>
                                <th>{t("table.status")}</th>
                                <th>{t("table.actions")}</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredUsers.map((usuario) => (
                                <Fragment key={usuario.id}>

                                    <tr>
                                        <td className="legajo">{usuario.legajo}</td>
                                        <td>{usuario.nombre} {usuario.apellido}</td>
                                        <td>{usuario.email}</td>
                                        <td>{usuario.dni}</td>
                                        <td>{usuario.lugarOperativo}</td>
                                        {usuario.activo ? (
                                            <td><StatusBadge estado={t("status.active")} /></td>
                                        ) : (
                                            <td><StatusBadge estado={t("status.inactive")}></StatusBadge></td>
                                        )}
                                        <td>
                                            <div className="actions-table">
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
                                </Fragment>
                            ))}
                        </tbody>
                    </table>
                </section>
            </main>
        </div>
    );
}