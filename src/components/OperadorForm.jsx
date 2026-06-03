import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "../styles/operadorForm.css";
import { administrador } from '@/api';

export default function OperadorForm() {
    const navigate = useNavigate();

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
            setErrorDni("El DNI debe tener entre 7 y 8 dígitos");
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
            setSuccess("Usuario creado exitosamente.");
            setError("");

            setTimeout(() => {
                navigate("/gestion-operarios");
            }, 1500);

        } catch (err) {
            console.error(err);
            setError("Error al crear el usuario.");
            setSuccess("");
        }
    };

    return (
        <div className="operador-container">
            <header className="operador-header">
                <div>
                    <h2>Alta de Usuario Operador</h2>
                    <p>Complete los siguientes datos para registrar un nuevo operador en el sistema.</p>
                </div>
            </header>

            <form className="operador-form" onSubmit={handleSubmit}>

                <div className="form-group">
                    <label htmlFor="nombre">Nombre</label>
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
                    <label htmlFor="apellido">Apellido</label>
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
                    <label htmlFor="dni">Documento Nacional de Identidad (DNI)</label>
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
                    <label htmlFor="email">Correo Electrónico</label>
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
                    <label htmlFor="passwordTemporal">Contraseña</label>
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
                    Crear Usuario
                </button>

            </form>
        </div>
    );
}