import { useNavigate } from "react-router-dom"; 
import { useState, useEffect, Fragment } from "react";
import { administrador } from '@/api';
import "../styles/gestionSupervisores.css";
import "../styles/statusBadge.css";
import StatusBadge from "@/components/StatusBadge";

export default function GestionSupervisor( { user } ) {
    const navigate = useNavigate();

    const [supervisores, setSupervisores] = useState([]);

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
                    setSupervisores(response.filter(usuario => usuario.rol === "SUPERVISOR"));
                    setLoading(false);
                } catch (error) {
                    console.log("Error al obtener usuarios:", error);
                }
            };
            fetchData();
        }, 1000);
    }, []);


    const filteredUsers = supervisores.filter((user) => {
        const searchText = (search || "").toLowerCase().trim();

        const fields = [
            user.nombre,
            user.apellido,
            user.legajo,
            user.dni ? String(user.dni) : "",
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
                <h2>Cargando supervisores...</h2>
            </div>
        );
    }

    return (
        <div className="gestion-supervisores-layout">
            <main className="gestion-supervisores-content">
                <section className="gestion-supervisores-header">
                    <div>
                        <h1>Gestión de Supervisores</h1>
                        <p>
                            Administra los supervisores registrados en el sistema
                        </p>
                    </div>
                </section>

                <section className="gestion-supervisores-table">
                    <div className="table-header">
                        <div>
                            <h2>Supervisores Registrados: {supervisores.length}</h2>
                        </div>
                        
                        <div className="search-container">
                            <input
                            type="text"
                            placeholder="🔎 Buscador"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>Legajo</th>
                                <th>Supervisor</th>
                                <th>Email</th>
                                <th>DNI</th>
                                <th>Estado</th>
                                <th>Acciones</th>
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
                                        {usuario.activo ? (
                                            <td><StatusBadge estado="ACTIVO"></StatusBadge></td>
                                        ) : (
                                            <td><StatusBadge estado="NO ACTIVO"></StatusBadge></td>
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
                                                    <strong className="">Sin acciones</strong>
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