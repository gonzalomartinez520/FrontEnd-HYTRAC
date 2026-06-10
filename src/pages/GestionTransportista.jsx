import { useNavigate } from "react-router-dom"; 
import { useState, useEffect, Fragment } from "react";
import { administrador, datos } from '@/api';
import { useTranslation } from 'react-i18next';
import "../styles/gestionTransportista.css";
import "../styles/statusBadge.css";
import StatusBadge from "@/components/StatusBadge";



export default function GestionTransportista( { user } ) {
    const { t } = useTranslation("transportista");
    const navigate = useNavigate();

    const { t: tForm } = useTranslation("form");
    const { t: tCommon } = useTranslation("common");

    const [transportistas, setTransportistas] = useState([]);
    const [transportistasSearch, setTransportistasSearch] = useState([]);
    const [documentos, setDocumentos] = useState({});

    const [tipoVinculo, setTipoVinculo] = useState([]);
    const [empresas, setEmpresas] = useState([]);

    const [errorDni, setErrorDni] = useState("");
    const [errorCuit, setErrorCuit] = useState("");
    const [errorPassword, setErrorPassword] = useState("");

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState(""); 
    const [expandedId, setExpandedId] = useState(null); 


    const [showModal, setShowModal] = useState(false);
    const [selectedUsuario, setSelectedUsuario] = useState(null);


    const [formData, setFormData] = useState({
        nombre: "",
        apellido: "",
        dni: "",
        email: "",
        passwordTemporal: "",
        confirmarPassword: "", 
        cuit: "",

        tipoVinculo: null,
        empresa: null,

        documentos: []
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [
                    tipoVinculoData,
                    empresasData,
                    transportistaData
                ] = await Promise.all([
                    datos.getTipoVinculo(),
                    datos.getEmpresas(),
                    datos.getTransportistas()
                ]);

                console.log(tipoVinculoData);
                console.log(empresasData);
                console.log(transportistaData);

                setTipoVinculo(tipoVinculoData);
                setEmpresas(empresasData);
                setTransportistasSearch(transportistaData);

            } catch (error) {
                console.error("Error cargando datos:", error);
            }
        };

        fetchData();
    }, []);

    const handleSelectVinculo = (e) => {
        const selected = tipoVinculo.find(tv => tv.id === Number(e.target.value));

        setFormData(prev => ({
            ...prev,
            tipoVinculo: selected
        }));
    };

    const handleSelectEmpresa = (e) => {
        const selected = empresas.find(emp => emp.id === Number(e.target.value));

        setFormData(prev => ({
            ...prev,
            empresa: selected
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

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

    const toggleExpand = async (legajo) => {
        if (expandedId === legajo) {
            setExpandedId(null);
            return;
        }

        setExpandedId(legajo);

        try {
            if (!transportistasSearch?.length) {
                console.warn("transportistasSearch vacío");
                return;
            }

            console.log("LEGAJO recibido:", legajo);
            console.log("transportistasSearch:", transportistasSearch);

            // 🔹 Buscar transportista por LEGAJO
            const transportista = transportistasSearch.find(
                (t) => String(t.legajo).trim() === String(legajo).trim()
            );

            if (!transportista) {
                console.warn("Transportista no encontrado por legajo");
                return;
            }

            // 🔹 Evitar repetir llamada
            if (documentos[legajo]) return;

            // 🔹 Llamada a API con ID real
            const docs = await datos.getDocumentos(transportista.id);
            console.log("DOCS API:", docs);

            // 🔹 Guardar por legajo
            setDocumentos((prev) => ({
                ...prev,
                [legajo]: docs.data || docs
            }));

        } catch (error) {
            console.error("Error al obtener documentos:", error);
        }
    };

    const getEstadoDocumento = (fechaVencimiento) => {
        const hoy = new Date();
        const vencimiento = new Date(fechaVencimiento);

        const diffTiempo = vencimiento - hoy;
        const diffDias = diffTiempo / (1000 * 60 * 60 * 24);

        if (diffDias < 0) return "vencido";          // 🔴 rojo
        if (diffDias <= 30) return "proximo";        // 🟠 naranja
        return "vigente";                            // 🟢 verde
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

    const darBajaUsuario = (usuario) => {
        const confirmacion = window.confirm(t("messages.confirmDeactivate", {
            name: `${usuario.nombre} ${usuario.apellido}`
        }))

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
                                        {usuario.tipoVinculo === "Tercerizado" ? (
                                             <td>{usuario.empresa}</td>
                                        ) : (
                                            <td><strong>{t("table.noCompany")}</strong></td>
                                        )}
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
                                                        onClick={() => toggleExpand(usuario.legajo)}
                                                    >
                                                        {expandedId === usuario.legajo ? (
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
                                                    <button className="editar-envio"
                                                    onClick={ async () => {
                                                        setSelectedUsuario(usuario);

                                                        const tipoVinculoSeleccionado = tipoVinculo.find((v) => v.nombre === usuario.tipoVinculo);
                                                        let empresaSeleccionado = null;

                                                        if(usuario.empresa !== null) {
                                                            empresaSeleccionado = empresas.find((c) => c.nombreFantasia === usuario.empresa);
                                                        };

                                                        setFormData(prev => ({
                                                            ...prev,
                                                            nombre: usuario.nombre,
                                                            apellido: usuario.apellido,
                                                            dni: usuario.dni,
                                                            email: usuario.email,
                                                            cuit: usuario.cuit,

                                                            tipoVinculo: tipoVinculoSeleccionado,
                                                            empresa: empresaSeleccionado
                                                        }))

                                                        setShowModal(true);
                                                    }}>
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
                                                    <strong>{t("table.noActions")}</strong>
                                                )}
                                            </div>
                                        </td>
                                    </tr>

                                    {/* ACA SE MOSTRARAN TODOS LOS DOCUMENTOS DEL TRANSPORTISTA */}
                                    {expandedId === usuario.legajo && (
                                        <tr className="fila-expandida">
                                            <td colSpan="8">
                                                <div className="detalle-envio">
                                                {documentos[usuario.legajo]?.length > 0 ? (
                                                    <div className="documentos-container">
                                                    {documentos[usuario.legajo].map((doc, index) => {
                                                        const estado = getEstadoDocumento(doc.fechaVencimiento);

                                                        return (
                                                        <div key={index} className={`doc-card ${estado}`}>
                                                            <p>
                                                            <strong>{t("details.document")}:</strong> {doc.tipoDocumentoNombre}
                                                            </p>
                                                            <p>
                                                            <strong>N°:</strong> {doc.nroDocumento}
                                                            </p>
                                                            <p>
                                                            <strong>{t("details.expiration")}:</strong> {doc.fechaVencimiento}
                                                            </p>
                                                        </div>
                                                        );
                                                    })}
                                                    </div>
                                                ) : (
                                                    <p>{t("details.noDocuments")}</p>
                                                )}
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
                                    {tForm("newOrder.sections.personalData")}
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
                                <label htmlFor="cuit">{tForm("newOrder.fields.cuit")}</label>
                                <input
                                type="text"
                                name="cuit"
                                value={formData.cuit}
                                onChange={handleChange}
                                required
                                />
                                {errorCuit && <span className="error">{errorCuit}</span>}
                            </div>

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

                        {/* 🔹 ACCESO */}
                        <div className="form-section">
                            <div className="form-section-title">
                                <h3> 
                                    <svg className="admin-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V7.875a4.125 4.125 0 10-8.25 0V10.5M6.75 10.5h10.5A1.5 1.5 0 0118.75 12v6A1.5 1.5 0 0117.25 19.5H6.75A1.5 1.5 0 015.25 18v-6A1.5 1.5 0 016.75 10.5z" />
                                    </svg>
                                    {tForm("newOrder.sections.accessData")}
                                </h3>
                            </div>

                            <div className="form-group">
                            <label>{tForm("newOrder.fields.password")}</label>
                            <input
                                type="password"
                                name="passwordTemporal"
                                value={formData.passwordTemporal}
                                onChange={handleChange}
                                required
                            />
                            </div>

                            <div className="form-group">
                                <label>{tForm("newOrder.fields.confirmPassword")}</label>
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

                        {/* 🔹 DOCUMENTACIÓN */}
                        <div className="form-section">
                            <div className="form-section-title">
                                <h3>
                                    <svg
                                        className="admin-icon"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1.8}
                                            d="M7.5 3h6l3 3v12.75A2.25 2.25 0 0114.25 21h-7.5A2.25 2.25 0 014.5 18.75V5.25A2.25 2.25 0 016.75 3H7.5z"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1.8}
                                            d="M9 9h6M9 12h6M9 15h4"
                                        />
                                        </svg>
                                {t("transportistaForm.sections.documentation")}
                                </h3>
                            </div>

                            {/* 🔸 Vinculación (NO se resetea) */}
                            <div className="form-row">
                                <div className="form-group">
                                    <label>{t("transportistaForm.fields.linkType")}</label>
                                        <select onChange={handleSelectVinculo} value={formData.tipoVinculo?.id || ""}>
                                            <option value="">{t("transportistaForm.fields.selectOption")}</option>
                                            {tipoVinculo.map(tv => (
                                                <option key={tv.id} value={tv.id}>
                                                    {tv.nombre}
                                                </option>
                                            ))}
                                        </select>
                                </div>
                            </div>

                            {formData.tipoVinculo?.nombre === "Tercerizado" && (
                                <div className="form-group">
                                    <label>{t("transportistaForm.fields.workCompany")}</label>
                                    <select onChange={handleSelectEmpresa} value={formData.empresa?.id || ""}>
                                        <option value="">{t("transportistaForm.fields.selectCompany")}</option>
                                        {empresas.map(emp => (
                                            <option key={emp.id} value={emp.id}>
                                                {emp.nombreFantasia}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                )}
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
                                    const confirmacion = window.confirm(t("messages.confirmEdit", {
                                        name: `${selectedUsuario.nombre} ${selectedUsuario.apellido}`
                                    }));


                                    const payload = {
                                        nombre: formData.nombre,
                                        apellido: formData.apellido,
                                        dni: Number(formData.dni),
                                        email: formData.email,
                                        passwordTemporal: formData.passwordTemporal,
                                        rolNombre: selectedUsuario.rol,
                                        cuit: formData.cuit,

                                        tipoVinculoId: formData.tipoVinculo?.id,
                                        empresaId: formData.empresa?.id,
                                        documentos: selectedUsuario.documentos
                                    };
                                    console.log(payload);

                                    const usuarioEditado = await administrador.editarUsuario(selectedUsuario.id, payload);
                                    console.log(usuarioEditado);

                                    setShowModal(false);
                                    window.location.reload();
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