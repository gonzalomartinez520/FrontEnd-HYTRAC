import { useNavigate } from "react-router-dom"; 
import { useState, useEffect, Fragment } from "react";
import { administrador } from '@/api';
import { useTranslation } from 'react-i18next';
import "../styles/gestionOperarios.css";
import "../styles/statusBadge.css";
import StatusBadge from "@/components/StatusBadge";

import { datos } from '@/api';

export default function GestionOperador( { user } ) {
    const navigate = useNavigate();
    const { t: tForm } = useTranslation("form");
    const { t: tCommon } = useTranslation("common");

    const [operarios, setOperarios] = useState([]);

    const [errorDni, setErrorDni] = useState("");
    const [errorPassword, setErrorPassword] = useState("");

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState(""); 

    const [showModal, setShowModal] = useState(false);
    const [selectedUsuario, setSelectedUsuario] = useState(null);

    const [formData, setFormData] = useState({
        nombre: "",
        apellido: "",
        dni: "",
        email: "",
        passwordTemporal: "",
        confirmarPassword: ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    useEffect(() => {
      if (showModal) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "auto";
      }

      return () => {
        document.body.style.overflow = "auto";
      };
    }, [showModal]);

    useEffect(() => {
        const timer = setTimeout(() => {
            const fetchData = async () => {
                try {
                    const response = await administrador.obtenerUsuarios();
                    console.log("Datos obtenidos de la API:", response);
                    setOperarios(response.filter(usuario => usuario.rol === "OPERADOR"));
                    setLoading(false);
                } catch (error) {
                    console.error("Error al obtener usuarios:", error);
                }
            };
            fetchData();
        }, 1000);
    }, []);

    const filteredUsers = operarios.filter((user) => {
        const searchText = (search || "").toLowerCase().trim();

        // Convertimos todos los campos a string y minúsculas
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

    const darBajaUsuario = (usuario) => {
        const confirmacion = window.confirm(`¿Seguro que desea dar de baja al usuario: ${usuario.nombre} ${usuario.apellido} ?`)

        if (confirmacion) {
            const fetchConfirmar = async () => {
                try {
                    await administrador.darBajaUsuario(usuario.id);
                    console.log("Usuario dado de baja con éxito");

                    window.location.reload();
                } catch (error) {
                    console.log("Error al dar de baja el usuario", error);
                }
            };
            fetchConfirmar();
        }
    };


    if (loading) {
        return (
            <div className="confirmar-loading-screen">
                <div className="confirmar-loader"></div>
                <h2>Cargando operarios...</h2>
            </div>
        );
    }

    return (
        <div className="gestion-operarios-layout">
            <main className="gestion-operarios-content">
                <section className="gestion-operarios-header">
                    <div>
                        <h1>Gestión de Operarios</h1>
                        <p>
                            Administra los operarios registrados en el sistema
                        </p>
                    </div>
                </section>

                <section className="gestion-operarios-table">
                    <div className="table-header">
                        <div>
                            <h2>Operarios Registrados: {operarios.length}</h2>
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
                                <th>Operador</th>
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
                                                    <button className="editar-envio"
                                                    onClick={() => {
                                                        setSelectedUsuario(usuario);

                                                        setFormData(prev => ({
                                                            ...prev,
                                                            nombre: usuario.nombre,
                                                            apellido: usuario.apellido,
                                                            dni: usuario.dni,
                                                            email: usuario.email,
                                                        }))

                                                        setShowModal(true);
                                                    }}
                                                    >
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
                                                onClick={() => darBajaUsuario(usuario)}
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

            {showModal && selectedUsuario && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        
                    {/* 🔹 DATOS PERSONALES */}
                    <div className="form-section">
                        <div className="form-section-title">
                            <h3>
                                <svg className="admin-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 6.75A2.25 2.25 0 015.25 4.5h13.5A2.25 2.25 0 0121 6.75v10.5A2.25 2.25 0 0118.75 19.5H5.25A2.25 2.25 0 013 17.25V6.75z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 9h3m-3 3h6m-6 3h4" />
                                </svg>
                                Datos Personales
                            </h3>
                        </div>

                        <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="nombre">{tForm("newOrder.fields.nombre")}</label>
                            <input
                            type="text"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="apellido">{tForm("newOrder.fields.apellido")}</label>
                            <input
                            type="text"
                            name="apellido"
                            value={formData.apellido}
                            onChange={handleChange}
                            required
                            />
                        </div>
                        </div>

                        <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="dni">{tForm("newOrder.fields.dni")}</label>
                            <input
                            type="text"
                            name="dni"
                            value={formData.dni}
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, "");
                                setFormData((prev) => ({ ...prev, dni: value }));
                            }}
                            inputMode="numeric"
                            required
                            />
                            {errorDni && <span className="error">{errorDni}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">{tForm("newOrder.fields.email")}</label>
                            <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            />
                        </div>
                        </div>
                    </div>

                    {/* 🔹 ACCESO */}
                    <div className="form-section">
                        <div className="form-section-title">
                            <h3> 
                                <svg className="admin-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V7.875a4.125 4.125 0 10-8.25 0V10.5M6.75 10.5h10.5A1.5 1.5 0 0118.75 12v6A1.5 1.5 0 0117.25 19.5H6.75A1.5 1.5 0 015.25 18v-6A1.5 1.5 0 016.75 10.5z" />
                                </svg>
                                Datos de Acceso
                            </h3>
                        </div>

                        <div className="form-group">
                        <label>Contraseña</label>
                        <input
                            type="password"
                            name="passwordTemporal"
                            value={formData.passwordTemporal}
                            onChange={handleChange}
                            required
                        />
                        </div>

                        <div className="form-group">
                            <label>Confirmar Contraseña</label>
                            <input
                                type="password"
                                name="confirmarPassword"
                                value={formData.confirmarPassword}
                                onChange={handleChange}
                                required
                            />
                            {errorPassword && <span className="error">{errorPassword}</span>}
                        </div>
                    </div>
                        {error && <div className="error-alert">❌ {error}</div>}
                        {success && <div className="success-alert">✅ {success}</div>}

                        <div className="modal-actions">
                            <button className="cancelar-edicion" onClick={() => setShowModal(false)}>
                                {tForm("newOrder.buttons.cancel")}
                            </button>
                            
                            <button
                            className="guardar-edicion"
                            onClick={ async () => {
                                try {
                                    console.log(selectedUsuario);
                                    const confirmacion = window.confirm(`¿Seguro que desea editar los datos del usuario: ${selectedUsuario.nombre} ${selectedUsuario.apellido} ?`);


                                    const payload = {
                                        nombre: formData.nombre,
                                        apellido: formData.apellido,
                                        dni: Number(formData.dni),
                                        email: formData.email,
                                        passwordTemporal: formData.passwordTemporal,
                                        rolNombre: selectedUsuario.rol
                                    };
                                    console.log(payload);

                                    const usuarioEditado = await administrador.editarUsuario(selectedUsuario.id, payload);

                                    console.log(usuarioEditado);
                                    window.location.reload();

                                    setShowModal(false);
                                } catch (error) {
                                    console.error("Error al editar envío:", error);
                                    console.log("DATA:", error.response?.data);
                                    console.log("STATUS:", error.response?.status);
                                }
                            }}
                            >
                                {tForm("newOrder.buttons.save")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}