import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import "../styles/operadorForm.css";
import { administrador } from '@/api';

export default function OperadorForm() {
    const navigate = useNavigate();
    const { t: tForm } = useTranslation("form");
    const { t: tCommon } = useTranslation("common");

    const [errorDni, setErrorDni] = useState("");

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [formData, setFormData] = useState({
        nombre: "",
        apellido: "",
        dni: "",
        email: "",
        passwordTemporal: ""
    });

    // 🔹 Este valor NO viene del formulario
    const rolNombre = "OPERADOR"; // lo podés cambiar dinámicamente si querés

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
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

        try {
            const payload = {
                nombre: formData.nombre,
                apellido: formData.apellido,
                dni: Number(formData.dni),
                email: formData.email,
                passwordTemporal: formData.passwordTemporal,
                rolNombre: rolNombre
            };

            console.log("Payload a enviar:", payload);
            const response = await administrador.crearUsuario(payload);
            setSuccess(tForm("newOrder.messages.userCreatedSuccess"));
            setError("");

            setTimeout(() => {
                navigate("/gestion-operarios");
            }, 1500);

        } catch (err) {
            console.error(err);
            setError(tForm("newOrder.messages.userCreatedError"));
            setSuccess("");
        }
    };

    return (
        <div className="operador-container">
            <header className="operador-header">
                <div>
                    <h2>{tCommon('roles.OPERADOR')} - {tForm('newOrder.new')}</h2>
                    <p>{tForm("newOrder.users.descriptions.OPERADOR")}</p>
                </div>
            </header>

            <form className="operador-form" onSubmit={handleSubmit}>

                <div className="form-group">
                    <label htmlFor="nombre">{tForm("newOrder.fields.nombre")}</label>
                    <input
                        type="text"
                        id="nombre"
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
                        id="apellido"
                        name="apellido"
                        value={formData.apellido}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="dni">{tForm("newOrder.fields.dni")}</label>
                    <input
                        type="text"
                        id="dni"
                        name="dni"
                        value={formData.dni}
                        onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, ""); // solo números
                            setFormData((prev) => ({
                            ...prev,
                            dni: value
                            }));
                        }}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="email">{tForm("newOrder.fields.email")}</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="passwordTemporal">{tForm("newOrder.fields.passwordTemporal")}</label>
                    <input
                        type="password"
                        id="passwordTemporal"
                        name="passwordTemporal"
                        value={formData.passwordTemporal}
                        onChange={handleChange}
                        required
                    />
                </div>

                {error && <div className="error-alert">❌ {error}</div>}
                {success && <div className="success-alert">✅ {success}</div>}

                <button type="submit" className="btn-submit">
                    {tForm("newOrder.buttons.create")}
                </button>

            </form>
        </div>
    );
}
