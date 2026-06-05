import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "../styles/transportistaForm.css";
import { administrador, datos } from '@/api';

export default function TransportistaForm() {
    const navigate = useNavigate();

    const [tipoVinculo, setTipoVinculo] = useState([]);
    const [tipoDocumento, setTipoDocumento] = useState([]);
    const [empresas, setEmpresas] = useState([]);

    const [errorDni, setErrorDni] = useState("");
    const [errorPassword, setErrorPassword] = useState("");

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [documentoForm, setDocumentoForm] = useState({
        tipoDocumentoId: "",
        nroDocumento: "",
        fechaVencimiento: null,
        archivoUrl: "" 
    });

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
                    tipoDocumentoData,
                    empresasData
                ] = await Promise.all([
                    datos.getTipoVinculo(),
                    datos.getTipoDocumento(),
                    datos.getEmpresas()
                ]);

                console.log(tipoVinculoData);
                console.log(tipoDocumentoData);
                console.log(empresasData);

                setTipoVinculo(tipoVinculoData);
                setTipoDocumento(tipoDocumentoData);
                setEmpresas(empresasData);

            } catch (error) {
                console.error("Error cargando datos:", error);
            }
        };

        fetchData();
    }, []);

    const handleDocumentoChange = (e) => {
        const { name, value } = e.target;

        setDocumentoForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

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

    const handleAddDocumento = () => {
        const { tipoDocumentoId, nroDocumento, fechaVencimiento, archivoUrl } = documentoForm;

        if (!tipoDocumentoId || !nroDocumento || !fechaVencimiento) {
            setError("Completá todos los campos del documento");
            return;
        }

        // ❌ evitar duplicados
        const yaExiste = formData.documentos.some(
            doc => doc.tipoDocumentoId === tipoDocumentoId
        );

        if (yaExiste) {
            setError("Ese documento ya fue cargado");
            return;
        }

        const nuevoDocumento = {
            tipoDocumentoId,
            nroDocumento,
            fechaEmision: formatDateToLocalDate(new Date()),
            fechaVencimiento: formatDateToLocalDate(fechaVencimiento),
            archivoUrl
        };

        setFormData(prev => ({
            ...prev,
            documentos: [...prev.documentos, nuevoDocumento]
        }));

        // 🔄 RESET SOLO DOCUMENTO (NO toca tipoVinculo ni empresa)
        setDocumentoForm({
            tipoDocumentoId: "",
            nroDocumento: "",
            fechaVencimiento: "",
            archivoUrl: ""
        });

        setError(null);
    };

    const handleRemoveDocumento = (index) => {
        setFormData(prev => ({
            ...prev,
            documentos: prev.documentos.filter((_, i) => i !== index)
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const formatDisplayDate = (date) => {
        if (!date) return "-";
        const [year, month, day] = date.split("-");
        return `${day}/${month}/${year}`;
    };

    const formatDateToLocalDate = (date) => {
        if (!date) return null;

        // 👉 si viene como string, convertirlo
        const parsedDate = typeof date === "string" ? new Date(date) : date;

        if (isNaN(parsedDate)) return null;

        const year = parsedDate.getFullYear();
        const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
        const day = String(parsedDate.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (formData.dni.length < 7 || formData.dni.length > 8) {
            setErrorDni("El DNI debe tener entre 7 y 8 dígitos");
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

        const cargados = formData.documentos.map(d => d.tipoDocumentoId);

        const faltantes = tipoDocumento.filter(
            td => !cargados.includes(td.id)
        );

        if (faltantes.length > 0) {
            setError(`Faltan ${faltantes.length} documentos obligatorios`);
            return;
        }

        try {
        const payload = {
            nombre: formData.nombre,
            apellido: formData.apellido,
            dni: formData.dni,
            email: formData.email,
            passwordTemporal: formData.passwordTemporal,
            cuit: formData.cuit,
            tipoVinculoId: formData.tipoVinculo?.id,
            empresaId: formData.empresa?.id,
            documentos: formData.documentos
        };

        //LLAMADO A API PARA GUARDAR NUEVO OPERADOR

        setTimeout(() => {
            navigate("/gestion-transportistas");
        }, 1500);

        } catch (err) {
        console.error(err);
        }
    };

    return (
        <div className="transportista-container">
            <header className="transportista-header">
                <div>
                    <h2>{tCommon('roles.TRANSPORTISTA')} - {tForm('newOrder.new')}</h2>
                    <p>{tForm("newOrder.users.descriptions.TRANSPORTISTA")}</p>
                </div>
            </header>

            <form className="transportista-form" onSubmit={handleSubmit}>
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
                    <label htmlFor="email">{tForm("newOrder.fields.email")}</label>
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
                    <label>DNI</label>
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
                    <label>Correo Electrónico</label>
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
                     Documentación
                     </h3>
                </div>

                {/* 🔸 Vinculación (NO se resetea) */}
                <div className="form-row">
                    <div className="form-group">
                        <label>Tipo de vínculo</label>
                            <select onChange={handleSelectVinculo} value={formData.tipoVinculo?.id || ""}>
                                <option value="">Seleccionar una opción</option>
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
                        <label>Empresa de trabajo</label>
                        <select onChange={handleSelectEmpresa} value={formData.empresa?.id || ""}>
                            <option value="">Seleccionar empresa</option>
                            {empresas.map(emp => (
                                <option key={emp.id} value={emp.id}>
                                    {emp.nombreFantasia}
                                </option>
                            ))}
                        </select>
                    </div>
                    )}

                {/* 🔸 Documento */}
                <div className="form-row">
                    <div className="form-group">
                        <label>Tipo de documento</label>
                            <select
                                name="tipoDocumentoId"
                                value={documentoForm.tipoDocumentoId}
                                onChange={handleDocumentoChange}
                            >
                                <option value="">Seleccionar documento</option>
                                {tipoDocumento.map(td => (
                                    <option key={td.id} value={td.id}>
                                        {td.nombre}
                                    </option>
                                ))}
                            </select>
                    </div>

                    <div className="form-group">
                        <label>Número del Documento</label>
                            <input
                                type="text"
                                name="nroDocumento"
                                value={documentoForm.nroDocumento}
                                onChange={handleDocumentoChange}
                            />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Fecha vencimiento</label>
                            <input
                                type="date"
                                name="fechaVencimiento"
                                value={documentoForm.fechaVencimiento}
                                onChange={handleDocumentoChange}
                            />
                    </div>

                    <div className="form-group">
                        <label>Archivo URL</label>
                            <input
                                type="text"
                                name="archivoUrl"
                                value={documentoForm.archivoUrl}
                                onChange={handleDocumentoChange}
                            />
                    </div>
                </div>

                <button className="btn-documento" type="button" onClick={handleAddDocumento}>
                    Agregar Documento
                </button>

                {/* Lista */}
                <div className="documentos-list">
                    {formData.documentos.map((doc, i) => {
                        const tipo = tipoDocumento.find(
                            td => td.id === Number(doc.tipoDocumentoId)
                        );

                        return (
                            <div key={i} className="documento-card">
                                
                                <div className="doc-header">
                                    <div className="doc-title-container">
                                        <span className="doc-icon">📄</span>
                                        <span className="doc-title">
                                            {tipo?.nombre || "Documento"}
                                        </span>
                                    </div>

                                    {/* ❌ BOTÓN ELIMINAR */}
                                    <button
                                        className="delete-btn"
                                        onClick={() => handleRemoveDocumento(i)}
                                    >
                                        ✕
                                    </button>
                                </div>

                                <div className="doc-body">
                                    <div className="doc-field">
                                        <span className="label">Número:</span>
                                        <span>{doc.nroDocumento}</span>
                                    </div>

                                    <div className="doc-field">
                                        <span className="label">Vence:</span>
                                        <span>{doc.fechaVencimiento}</span>
                                    </div>
                                </div>

                            </div>
                        );
                    })}
                </div>
            </div>

                {error && <div className="error-alert">❌ {error}</div>}
                {success && <div className="success-alert">✅ {success}</div>}

                <button type="submit" className="btn-submit">
                    Crear Usuario
                </button>
            </form>
        </div>
    );
}
