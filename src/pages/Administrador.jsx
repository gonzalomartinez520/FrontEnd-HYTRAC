import { useNavigate } from "react-router-dom"; 
import { useState, useEffect } from "react";
import "../styles/administrador.css";
import { envios, datos } from '@/api';

export default function Administrador({ user }) {
  const navigate = useNavigate();

  const [usuarios, setUsuarios] = useState([]);

  // ROLES
  const [transportistas, setTransportistas] = useState(0);
  const [operarios, setOperarios] = useState(0);
  const [supervisores, setSupervisores] = useState(0);
  const [jefesEstacion, setJefeEstacion] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => {
            const fetchData = async () => {
                try {
                    const response = await envios.getUsuarios();
                    console.log("Datos obtenidos de la API:", response);
                    setUsuarios(response);
                } catch (error) {
                    console.error("Error al obtener usuarios:", error);
                }
            };
            fetchData();
        }, 1000);

    }, []);

    //FILTROS PARA CADA ROL.

    return (
        <div className="gestion-usuarios-layout">

            <main className="gestion-usuarios-content">
                <section className="gestion-usuarios-header">
                    <div>
                        <h1>Gestion de Usuarios</h1>
                        <p>
                            Por favor, seleccione una de las opciones.
                        </p>
                    </div>
                </section>
                
                <section className="gestion-usuarios-card">
                    <div className="operarios" onClick={() => navigate("/gestion-operarios")}>
                        <div className="icon-gestion-usuarios">🛠️</div>
                        <div className="badge-cantidad operarios">5</div>   {/*LUEGO REEMPLAZAR POR VALORES REALES */}
                        <h2>Operadores</h2>
                        <p>
                            Gestiona operaciones del sistema
                        </p>
                    </div>

                    <div className="supervisores" onClick={() => navigate("/gestion-supervisores")}>
                        <div className="icon-gestion-usuarios">✔️</div>
                        <div className="badge-cantidad supervisores">3</div>
                        <h2>Supervisores</h2>
                        <p>
                            Supervisa y valida procesos
                        </p>
                    </div>
                </section>

                <section className="gestion-usuarios-card">
                    <div className="transportistas" onClick={() => navigate("/gestion-transportistas")}>
                        <div className="icon-gestion-usuarios">🚚</div>
                        <div className="badge-cantidad transportistas">9</div>
                        <h2>Transportistas</h2>
                        <p>
                            Gestiona rutas y entregas
                        </p>
                    </div>

                    <div className="jefe-estacion" onClick={() => navigate("/gestion-jefe-estacion")}>
                        <div className="icon-gestion-usuarios">⛽</div>
                        <div className="badge-cantidad jefe-estacion">2</div>
                        <h2>Jefes de Estación</h2>
                        <p>
                            Administra la operación de la estación
                        </p>
                    </div>
                </section>
            </main>
        </div>
    );
}