import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import "../styles/transportistaForm.css";

export default function TransportistaForm() {
    const navigate = useNavigate();
    const { t: tForm } = useTranslation("form");
    const { t: tCommon } = useTranslation("common");

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
        <div className="transportista-container">
            <header className="transportista-header">
                <div>
                    <h2>{tCommon('roles.TRANSPORTISTA')} - {tForm('newOrder.new')}</h2>
                    <p>{tForm("newOrder.users.descriptions.TRANSPORTISTA")}</p>
                </div>
            </header>

            <form className="transportista-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="nombre">{tForm("newOrder.fields.nombre")}</label>
                    <input
                        type="text"
                        id="nombre"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
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
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="telefono">{tForm("newOrder.fields.telefono")}</label>
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
