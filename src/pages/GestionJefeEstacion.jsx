import { useNavigate } from "react-router-dom"; 
import { useState, useEffect, Fragment, useEffectEvent } from "react";
import { administrador, datos } from '@/api';
import { useTranslation } from 'react-i18next';
import "../styles/gestionJefeEstacion.css";
import "../styles/statusBadge.css";
import StatusBadge from "@/components/StatusBadge";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const MapaUbicacion = ({ lat, lng, nombre }) => {
  if (!lat || !lng) return <p>Ubicación no disponible</p>;

  return (
    <MapContainer
      center={[lat, lng]}
      zoom={13}
      style={{ height: "250px", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[lat, lng]}>
        <Popup>{nombre}</Popup>
      </Marker>
    </MapContainer>
  );
};


export default function GestionJefeEstacion( { user } ) {
    const { t } = useTranslation("jefeEstacion");
    const navigate = useNavigate();

    const { t: tForm } = useTranslation("form");
    const { t: tCommon } = useTranslation("common");

    const [errorDni, setErrorDni] = useState("");
    const [errorPassword, setErrorPassword] = useState("");

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [provincias, setProvincias] = useState([]);
    const [localidades, setLocalidades] = useState([]);
    const [lugaresOperativos, setLugaresOperativos] = useState([]);

    const [lugaresOperativosTotales, setLugaresOperativosTotales] = useState([]);

    const [formData, setFormData] = useState({
        nombre: "",
        apellido: "",
        dni: "",
        email: "",
        passwordTemporal: "",
        confirmarPassword: "",
        provincia: null,
        localidad: null,
        lugarOperativo: null
    });

    const [jefesEstacion, setJefesEstacion] = useState([]);

    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState(""); 
    const [expandedId, setExpandedId] = useState(null); 

    const [showModal, setShowModal] = useState(false);
    const [selectedUsuario, setSelectedUsuario] = useState(null);


    useEffect(() => {
        const fetchProvincias = async () => {
            try {
            const provinciasData = await datos.getProvincias();
            setProvincias(provinciasData);
            } catch (error) {
            console.error("Error cargando provincias:", error);
            }
        };

        fetchProvincias();
    }, []);
    
    useEffect(() => {
        const fetchLocalidades = async () => {
            if (!formData.provincia) return;

            try {
            const data = await datos.getLocalidades(formData.provincia.id);
            setLocalidades(data);
            } catch (err) {
            console.error("Error cargando localidades:", err);
            }
        };

        fetchLocalidades();
    }, [formData.provincia]);

    useEffect(() => {
        const fetchLugaresOperativos = async () => {
            if (!formData.localidad) return;

            try {
            const data = await datos.getEstacionLocalidad(formData.localidad.id);
            setLugaresOperativos(data);
            } catch (err) {
            console.error("Error cargando lugares operativos:", err);
            }
        };

        fetchLugaresOperativos();
    }, [formData.localidad]);

    useEffect(() => {
        const timer = setTimeout(() => {
            const fetchData = async () => {
                try {
                    const [
                        usuariosData,
                        provinciasData,
                        lugaresOperativosData,
                    ] = await Promise.all([
                        administrador.obtenerUsuarios(),
                        datos.getProvincias(),
                        datos.getEstaciones(),
                    ]);
                    
                    setJefesEstacion(usuariosData.filter(usuario => usuario.rol === "JEFE_ESTACION"));
                    setProvincias(provinciasData);
                    setLugaresOperativosTotales(lugaresOperativosData);

                } catch (error) {
                    console.log("Error al cargar datos:", error);
                } finally {
                    setLoading(false); // 👈 CLAVE
                }
            };

            fetchData();
        }, 1000);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "provincia") {
            const provinciaSeleccionada = provincias.find(
            (p) => Number(p.id) === Number(value)
            );

            setFormData((prev) => ({
            ...prev,
            provincia: provinciaSeleccionada || null,
            localidad: null,
            lugarOperativo: null,
            }));

            setLocalidades([]);
            setLugaresOperativos([]);
        }

        else if (name === "localidad") {
            const localidadSeleccionada = localidades.find(
            (l) => Number(l.id) === Number(value)
            );

            setFormData((prev) => ({
            ...prev,
            localidad: localidadSeleccionada || null,
            lugarOperativo: null,
            }));

            setLugaresOperativos([]);
        }

        else if (name === "lugarOperativo") {
            const lugarOperativoSeleccionado = lugaresOperativos.find(
            (e) => Number(e.id) === Number(value)
            );

            setFormData((prev) => ({
            ...prev,
            lugarOperativo: lugarOperativoSeleccionado || null,
            }));
        }

        else {
            setFormData((prev) => ({
            ...prev,
            [name]: value,
            }));
        }
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

    const toggleExpand = (id) => {
        setExpandedId((prev) => (prev === id ? null : id));
    };

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
                                            <td><StatusBadge estado="ACTIVO" /></td>
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
                                                    <button 
                                                    className="editar-envio"
                                                    onClick={async () => {
                                                        setSelectedUsuario(usuario);

                                                        const lugarOperativoSeleccionado = lugaresOperativosTotales.find(
                                                            (l) => l.nombre === usuario.lugarOperativo
                                                        );

                                                        if (!lugarOperativoSeleccionado) return;

                                                        // 🔹 Buscar provincia (objeto)
                                                        const provinciaObj = provincias.find(
                                                            (p) => p.id === lugarOperativoSeleccionado.provinciaId
                                                        );

                                                        // 🔹 Traer localidades de esa provincia
                                                        const localidadesData = await datos.getLocalidades(provinciaObj.id);

                                                        const localidadObj = localidadesData.find(
                                                            (l) => l.id === lugarOperativoSeleccionado.localidadId
                                                        );

                                                        // 🔹 Traer lugares operativos de esa localidad
                                                        const lugaresData = await datos.getEstacionLocalidad(localidadObj.id);

                                                        const lugarObj = lugaresData.find(
                                                            (l) => l.id === lugarOperativoSeleccionado.id
                                                        );

                                                        // 🔹 Setear todo correctamente
                                                        setLocalidades(localidadesData);
                                                        setLugaresOperativos(lugaresData);

                                                        setFormData(prev => ({
                                                            ...prev,
                                                            nombre: usuario.nombre,
                                                            apellido: usuario.apellido,
                                                            dni: usuario.dni,
                                                            email: usuario.email,
                                                            provincia: provinciaObj,
                                                            localidad: localidadObj,
                                                            lugarOperativo: lugarObj
                                                        }));

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
                                                    <strong>{t("table.noActions")}</strong>
                                                )}
                                            </div>
                                        </td>
                                    </tr>

                                    {expandedId === usuario.id && (
                                    <tr className="fila-expandida">
                                        <td colSpan="7">
                                        <div className="detalle-envio">
                                            {(() => {
                                            const lugar = lugaresOperativosTotales.find(
                                                (l) => l.nombre === usuario.lugarOperativo
                                            );

                                            return lugar ? (
                                                <div className="mapa-info-container">
                                                
                                                {/* 🗺️ Mapa */}
                                                <div className="mapa-box">
                                                    <MapaUbicacion
                                                    lat={lugar.latitud}
                                                    lng={lugar.longitud}
                                                    nombre={lugar.nombre}
                                                    />
                                                </div>

                                                {/* 📄 Info */}
                                                <div className="info-box">
                                                    <h3>📍 Información de la ubicación</h3>

                                                    <p><strong>Provincia:</strong> {lugar.provinciaNombre}</p>
                                                    <p><strong>Localidad:</strong> {lugar.localidadNombre}</p>
                                                    <p><strong>Dirección:</strong> {lugar.direccion}</p>
                                                </div>

                                                </div>
                                            ) : (
                                                <p>No se encontró la ubicación</p>
                                            );
                                            })()}
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
                                <label>{tForm("newOrder.fields.nombre")}</label>
                                <input
                                type="text"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                required
                                />
                            </div>

                            <div className="form-group">
                                <label>{tForm("newOrder.fields.apellido")}</label>
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
                                <label>{tForm("newOrder.fields.dni")}</label>
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
                                <label>{tForm("newOrder.fields.email")}</label>
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
                                    {tForm("newOrder.sections.accessData")}
                                </h3>
                            </div>

                            <div className="form-group">
                            <label>{tForm("newOrder.fields.passwordTemporal")}</label>
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

                        {/* 🔹 UBICACIÓN */}
                        <div className="form-section">
                            <div className="form-section-title">
                                <h3>
                                    <svg className="admin-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s7-5.686 7-11a7 7 0 10-14 0c0 5.314 7 11 7 11z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" />
                                    </svg>
                                    {tForm("newOrder.sections.operationalLocation")}
                                </h3>
                            </div>

                            <div className="form-row">
                            <div className="form-group">
                                <label>{tForm("newOrder.fields.originProvince")}</label>
                                <select
                                name="provincia"
                                value={formData.provincia?.id || ""}
                                onChange={handleChange}
                                required
                                >
                                <option value="">{tForm("newOrder.placeholders.selectProvince")}</option>
                                {provincias.map((prov) => (
                                    <option key={prov.id} value={prov.id}>
                                    {prov.nombre}
                                    </option>
                                ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>{tForm("newOrder.fields.originCity")}</label>
                                <select
                                name="localidad"
                                value={formData.localidad?.id || ""}
                                disabled={!formData.provincia}
                                onChange={handleChange}
                                required
                                >
                                <option value="">{tForm("newOrder.placeholders.selectCity")}</option>
                                {localidades.map((loc) => (
                                    <option key={loc.id} value={loc.id}>
                                    {loc.nombre}
                                    </option>
                                ))}
                                </select>
                            </div>
                            </div>

                            <div className="form-group">
                            <label>{tForm("newOrder.fields.originPlant")}</label>
                            <select
                                name="lugarOperativo"
                                value={formData.lugarOperativo?.id || ""}
                                disabled={!formData.localidad}
                                onChange={handleChange}
                                required
                            >
                                <option value="">{tForm("newOrder.placeholders.selectLocation")}</option>
                                {lugaresOperativos.map((est) => (
                                <option key={est.id} value={est.id}>
                                    {est.nombre}
                                </option>
                                ))}
                            </select>
                            </div>
                        </div>

                        {/* 🔹 ALERTAS */}
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
                                        lugarOperativoId: formData.lugarOperativo?.id
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