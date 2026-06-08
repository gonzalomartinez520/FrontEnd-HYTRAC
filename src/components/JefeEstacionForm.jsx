import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { datos, administrador } from '@/api';
import "../styles/jefeEstacionForm.css";

export default function JefeEstacionForm() {
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


    // 🔹 Este valor NO viene del formulario
    const rolNombre = "JEFE_ESTACION"; // lo podés cambiar dinámicamente si querés

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (formData.dni.length < 7 || formData.dni.length > 8) {
            setErrorDni(tForm("newOrder.messages.dniError"));
            return;
        } else {
            setErrorDni("");
        }

        if (formData.passwordTemporal !== formData.confirmarPassword) {
            setErrorPassword("Las contraseñas no coinciden");
            return;
        } else {
            setErrorPassword("");
        }

        try {
            const payload = {
                nombre: formData.nombre,
                apellido: formData.apellido,
                dni: Number(formData.dni),
                email: formData.email,
                passwordTemporal: formData.passwordTemporal,
                rolNombre: rolNombre,
                lugarOperativoId: formData.lugarOperativo?.id
            };

            console.log("Payload a enviar:", payload);

            const response = await administrador.crearUsuario(payload);
            
            setSuccess(tForm("newOrder.messages.userCreatedSuccess"));
            setError("");

            setTimeout(() => {
                navigate("/gestion-jefe-estacion");
            }, 1500);

        } catch (err) {
            console.error(err);
            setError(tForm("newOrder.messages.userCreatedError"));
            setSuccess("");
        }
    };

    return (
        <div className="jefeEstacion-container">
            <header className="jefeEstacion-header">
                <div>
                    <h2>{tCommon('roles.JEFE_ESTACION')} - {tForm('newOrder.new')}</h2>
                    <p>{tForm("newOrder.users.descriptions.JEFE_ESTACION")}</p>
                </div>
            </header>

            <form className="jefeEstacion-form" onSubmit={handleSubmit}>

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

            {error && <div className="error-alert">❌ {error}</div>}
            {success && <div className="success-alert">✅ {success}</div>}

            <div className="form-actions">
                <button type="submit" className="btn-submit">
                {tForm("newOrder.buttons.create")}
                </button>
            </div>

            </form>
        </div>
    );
}
