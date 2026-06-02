import { useState } from 'react';
import "../styles/supervisorForm.css";

export default function SupervisorForm() {
    const [formData, setFormData] = useState({
        nombre: "",
        email: "",
        telefono: ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
        const payload = {
            nombre: formData.nombre,
            email: formData.email,
            telefono: formData.telefono
        };

        //LLAMADO A API PARA GUARDAR NUEVO OPERADOR

        setTimeout(() => {
            navigate("/gestion-operarios");
        }, 1500);

        } catch (err) {
        console.error(err);
        }
    };

    return (
        <div className="supervisor-container">
            <header className="supervisor-header">
                <div>
                    <h2>Nuevo usuario supervisor</h2>
                    <p>Por favor, complete los siguientes campos para crear un nuevo supervisor.</p>
                </div>
            </header>

            <form className="supervisor-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="nombre">Nombre</label>
                    <input
                        type="text"
                        id="nombre"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="telefono">Teléfono</label>
                    <input
                        type="tel"
                        id="telefono"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleChange}
                    />
                </div>
            </form>
        </div>
    );
}