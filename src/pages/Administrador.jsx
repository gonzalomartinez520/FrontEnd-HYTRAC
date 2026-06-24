import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import "../styles/administrador.css";
import { administrador } from '@/api';

export default function Administrador({ user }) {
  const navigate = useNavigate();
  // Usamos 'common' para las traducciones globales y 'admin' si tienes un archivo separado
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
          const response = await administrador.obtenerUsuarios();
          console.log("Datos obtenidos de la API:", response);
          setUsuarios(response);
        } catch (error) {
          console.error("Error al obtener usuarios:", error);
        }
      };
      fetchData();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!usuarios.length) return;

    let op = 0, sup = 0, trans = 0, jefe = 0;

    usuarios.forEach((usuario) => {
      if (usuario.activo) {
        if (usuario.rol === "OPERADOR") op++;
        else if (usuario.rol === "SUPERVISOR") sup++;
        else if (usuario.rol === "TRANSPORTISTA") trans++;
        else if (usuario.rol === "JEFE_ESTACION") jefe++;
      }
    });

    setOperarios(op);
    setSupervisores(sup);
    setTransportistas(trans);
    setJefeEstacion(jefe);
  }, [usuarios]);

  return (
    <div className="gestion-usuarios-layout">
      <main className="gestion-usuarios-content">
        <section className="gestion-usuarios-header">
          <div>
            <h1>{t("admin.title")}</h1>
            <p>{t("admin.subtitle")}</p>
          </div>
        </section>
        
        <section className="gestion-usuarios-card">
          <button className="operarios" onClick={() => navigate("/gestion-operarios")}>
            <div className="icon-gestion-usuarios">🛠️</div>
            <div className="badge-cantidad operarios">{operarios}</div>
            <h2>{t("roles.OPERADOR")}</h2>
            <p>{t("admin.cards.operators.description")}</p>
          </button>

          <button className="supervisores" onClick={() => navigate("/gestion-supervisores")}>
            <div className="icon-gestion-usuarios">✔️</div>
            <div className="badge-cantidad supervisores">{supervisores}</div>
            <h2>{t("roles.SUPERVISOR")}</h2>
            <p>{t("admin.cards.supervisors.description")}</p>
          </button>
        </section>

        <section className="gestion-usuarios-card">
          <button className="transportistas" onClick={() => navigate("/gestion-transportistas")}>
            <div className="icon-gestion-usuarios">🚚</div>
            <div className="badge-cantidad transportistas">{transportistas}</div>
            <h2>{t("roles.TRANSPORTISTA")}</h2>
            <p>{t("admin.cards.carriers.description")}</p>
          </button>

          <button className="jefe-estacion" onClick={() => navigate("/gestion-jefe-estacion")}>
            <div className="icon-gestion-usuarios">⛽</div>
            <div className="badge-cantidad jefe-estacion">{jefesEstacion}</div>
            <h2>{t("roles.JEFE_ESTACION")}</h2>
            <p>{t("admin.cards.stationManagers.description")}</p>
          </button>
        </section>
      </main>
    </div>
  );
}