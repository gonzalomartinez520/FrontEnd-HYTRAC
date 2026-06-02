import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/nuevoUsuario.css";
import OperadorForm from "../components/OperadorForm";
import SupervisorForm from "../components/SupervisorForm";
import TransportistaForm from "../components/TransportistaForm";
import JefeEstacionForm from "../components/JefeEstacionForm";

import { useTranslation } from "react-i18next";

export default function NuevoUsuario( { user } ) {
    const navigate = useNavigate();
    const [selectedRole, setSelectedRole] = useState(null);

    const roles = [
        { value: "OPERADOR", label: "OPERADOR" },
        { value: "SUPERVISOR", label: "SUPERVISOR" },
        { value: "TRANSPORTISTA", label: "TRANSPORTISTA" },
        { value: "JEFE_ESTACION", label: "JEFE DE ESTACIÓN" }
    ];


    const [formData, setFormData] = useState({
        nombre: "", //LUEGO RELLENAR CON LOS CAMPOS NECESARIOS.
    });





    return (
        <div className="nuevo-usuario-layout">

            <main className="nuevo-usuario-content">

                <div className="top-section">
                    <header className="nuevo-usuario-header">
                        <div>
                            <p id="nuevo-usuario">NUEVO USUARIO</p>
                            <h1>Crear usuario nuevo</h1>
                            <p>Por favor, seleccione el rol del usuario que desea crear.</p>
                        </div>
                    </header>

                    <div className="role-selector">
                        {roles.map((role) => (
                            <button
                                key={role.value}
                                className={`role-tab ${selectedRole === role.value ? "active" : ""}`}
                                onClick={() => setSelectedRole(role.value)}
                            >
                                {role.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div key={selectedRole} className="form-container animate-form">
                    {selectedRole === "OPERADOR" && <OperadorForm />}
                    {selectedRole === "SUPERVISOR" && <SupervisorForm />}
                    {selectedRole === "TRANSPORTISTA" && <TransportistaForm />}
                    {selectedRole === "JEFE_ESTACION" && <JefeEstacionForm />}
                </div>
                
            </main>
        </div>
    );
}
