import { useNavigate } from "react-router-dom"; 
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "../styles/administrador.css";
import { envios, datos } from '@/api';

export default function Administrador({ user }) {
  const navigate = useNavigate();
  const { t } = useTranslation("common");

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
                        <h1>{t("admin.title")}</h1>
                        <p>
                            {t("admin.subtitle")}
                        </p>
                    </div>
                </section>
                
                <section className="gestion-usuarios-card">
                    <div className="operarios" onClick={() => navigate("/gestion-operarios")}>
                        <div className="icon-gestion-usuarios">🛠️</div>
                        <div className="badge-cantidad operarios">5</div>   {/*LUEGO REEMPLAZAR POR VALORES REALES */}
                        <h2>{t("admin.cards.operators.title")}</h2>
                        <p>
                            {t("admin.cards.operators.description")}
                        </p>
                    </div>

                    <div className="supervisores" onClick={() => navigate("/gestion-supervisores")}>
                        <div className="icon-gestion-usuarios">✔️</div>
                        <div className="badge-cantidad supervisores">3</div>
                        <h2>{t("admin.cards.supervisors.title")}</h2>
                        <p>
                            {t("admin.cards.supervisors.description")}
                        </p>
                    </div>
                </section>

                <section className="gestion-usuarios-card">
                    <div className="transportistas" onClick={() => navigate("/gestion-transportistas")}>
                        <div className="icon-gestion-usuarios">🚚</div>
                        <div className="badge-cantidad transportistas">9</div>
                        <h2>{t("admin.cards.carriers.title")}</h2>
                        <p>
                            {t("admin.cards.carriers.description")}
                        </p>
                    </div>

                    <div className="jefe-estacion" onClick={() => navigate("/gestion-jefe-estacion")}>
                        <div className="icon-gestion-usuarios">⛽</div>
                        <div className="badge-cantidad jefe-estacion">2</div>
                        <h2>{t("admin.cards.stationManagers.title")}</h2>
                        <p>
                            {t("admin.cards.stationManagers.description")}
                        </p>
                    </div>
                </section>
            </main>
        </div>
    );
}
