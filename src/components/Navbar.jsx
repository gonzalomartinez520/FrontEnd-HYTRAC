import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { canNotificarEntrega, transportista as transportistaApi } from "../api";
import "../styles/navbar.css";
import LogiTrackLogo from "../assets/LogiTrack_Logo_colored.png";
import i18n from "../i18n";
import { useTranslation } from "react-i18next";

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();
  const { t } = useTranslation("navbar");
  const { t : tCommon } = useTranslation("common");

  const languages = [
    { code: "es", label: "Español", flag: "🇦🇷" },
    { code: "en", label: "English", flag: "🇺🇸" },
    { code: "pt", label: "Português", flag: "🇧🇷" }
  ];

  const [menuOpen, setMenuOpen] = useState(false);
  const role = String(user?.normalizedRole || user?.role || "").toUpperCase();
  const [transportistaAction, setTransportistaAction] = useState({
    title: t("confirmarEnvío"),
    to: "/transportista",
    icon: "✅",
    label: t("confirmarEnvío"),
  });

  const handleChangeLanguage = (e) => {
    const lang = e.target.value;
    i18n.changeLanguage(lang);

    // opcional (MUY recomendado)
    localStorage.setItem("lang", lang);
  };


useEffect(() => {
    let isMounted = true;

    const loadTransportistaAction = async () => {
      if (role !== "TRANSPORTISTA") {
        return;
      }

      const transportistaId =
        user?.transportistaId ?? user?.id ?? user?.usuarioId ?? null;

      if (!transportistaId) {
        return;
      }

      try {
        const orden = await transportistaApi.getOrdenEnCurso(transportistaId);

        if (!orden?.id) {
          if (isMounted) {
            setTransportistaAction({
              title: t("confirmarEnvío"),
              to: "/transportista",
              icon: "✅",
              label: t("confirmarEnvío"),
            });
          }
          return;
        }

        const shouldNotificarEntrega = canNotificarEntrega(orden);

        if (isMounted) {
          setTransportistaAction(
            shouldNotificarEntrega
              ? {
                  title: t("notificarEntrega"),
                  to: `/transportista/orden/${orden.id}/iniciar-viaje`,
                  icon: "📦",
                  label: t("notificarEntrega"),
                }
              : {
                  title: t("confirmarEnvío"),
                  to: `/transportista/orden/${orden.id}/iniciar-viaje`,
                  icon: "✅",
                  label: t("confirmarEnvío"),
                }
          );
        }
      } catch (requestError) {
        console.error(requestError);
      }
    };

    loadTransportistaAction();

    return () => {
      isMounted = false;
    };
  }, [role, user]);

  const handleLogout = () => {
    // 🗑️ Eliminar sesión completa
    localStorage.removeItem("token");
    localStorage.removeItem("legajo");

    // 🧠 Limpiar estado en App
    onLogout(null);

    // 📱 Cerrar menú si está abierto
    setMenuOpen(false);

    // 🔄 Redirigir al login sin posibilidad de volver atrás
    navigate("/login", { replace: true });
  };

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  const homeByRole = {
    TRANSPORTISTA: "/transportista",
    JEFE_ESTACION: "/jefe-estacion",
    ADMIN: "/administrador",
  };

  const homeTo = homeByRole[role] || "/dashboard";


  // Definir acciones específicas por rol, SE PUEDE ESCALAR CON LOS ROLES RESTANTES.
  const actionByRole = {
    OPERADOR: {
      title: t("nuevaOrden"),
      to: "/nuevo-envio",
      icon: "➕",
      label: t("nuevaOrden"),
    },
    SUPERVISOR: {
      title: t("confirmaciones"),
      to: "/confirmaciones",
      icon: "✅",
      label: t("confirmaciones"),
    },
    TRANSPORTISTA: {
      title: t("reportarIncidencia"),
      to: "/transportista/incidencia",
      icon: "⚠️",
      label: t("reportarIncidencia"),
    },
    ADMIN: {
      title: t("usuarioNuevo"),
      to: "/alta-usuario",
      icon: "➕",
      label: t("usuarioNuevo"),
    },
  };

   const action = role === "TRANSPORTISTA" ? transportistaAction : actionByRole[role];

  return (
    <nav className="top-nav">
      <div className="nav-left">
        <div className="nav-logo">
          <img src={LogiTrackLogo} alt="LogiTrack" className="logo-img" />
          <div className="logo-text">
            <strong>HYTRAC</strong>
          </div>
        </div>

        <button
          className="mobile-menu-btn"
          type="button"
          onClick={toggleMenu}
          aria-expanded={menuOpen}
        >
          {menuOpen ? "✕" : "☰"}
        </button>

        <div className={`nav-links ${menuOpen ? "active" : ""}`}>
          <Link
            title={t("panelControl")}
            to={homeTo}
            onClick={() => setMenuOpen(false)}
          >
            {role === "TRANSPORTISTA" ? (
              <>
                <span className="route-nav-icon" aria-hidden="true">🛣️</span> {t("miRuta")}
              </>
            ) : role === "JEFE_ESTACION" ? (
              <>
                <span className="icon">⛽</span> {t("panelEstacion")}
              </>
            ) : role === "ADMIN" ? (
              <>
              <svg
                className="icon icon-admin"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="orange"
              >
                <path d="M16 11c1.66 0 3-1.57 3-3.5S17.66 4 16 4s-3 1.57-3 3.5S14.34 11 16 11zm-8 0c1.66 0 3-1.57 3-3.5S9.66 4 8 4 5 5.57 5 7.5 6.34 11 8 11zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
              </svg> 
                <span>{t("gestionUsuarios")}</span>
              </>
            ) : (
              <>
                <span className="icon">📊</span> {t("panelControl")}
              </>
            )}
          </Link>

          {action && (
            <Link
              title={action.title}
              to={action.to}
              onClick={() => setMenuOpen(false)}
            >
              <span className="icon">{action.icon}</span> {action.label}
            </Link>
          )}

          <Link
            title={t("historialOrdenes")}
            to="/historial-operador"
            onClick={() => setMenuOpen(false)}
          >
            {role == "OPERADOR" ? (
              <>
                <span className="route-nav-icon" aria-hidden="true">🕘</span> {t("historialOrdenes")}
              </>
            ) : (
              null
            
            )}
          </Link>
        </div>
      </div>

      <div className="nav-right">

        <select className="language-select" onChange={handleChangeLanguage} value={i18n.language}>
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.flag} {lang.label}
            </option>
          ))}
        </select>

        <div className="user-profile">
          <span className="user-icon">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="orange"
            >
              <path d="M12 12c2.76 0 5-2.24 5-5S14.76 2 12 2 7 4.24 7 7s2.24 5 5 5zm0 2c-3.33 0-10 1.67-10 5v3h20v-3c0-3.33-6.67-5-10-5z"/>
            </svg>
          </span>
          <div className="user-info">
            <strong>
              {user?.nombre || "Usuario"} {user?.apellido || ""}
            </strong>
            <span>
              {tCommon(`roles.${(user?.normalizedRole || user?.role || "OPERADOR").toUpperCase()}`)}
            </span>
          </div>
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          {t("salir")}
        </button>
      </div>
    </nav>
  );
}
