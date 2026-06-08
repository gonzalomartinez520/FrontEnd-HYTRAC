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


  const [openNotif, setOpenNotif] = useState(false);
  const [closing, setClosing] = useState(false);

  const handleToggle = () => {
    if (openNotif) {
      setClosing(true);

      setTimeout(() => {
        setOpenNotif(false);
        setClosing(false);
      }, 250); // 🔥 igual que CSS
    } else {
      setOpenNotif(true);
    }
  };

  const [notifications, setNotifications] = useState([
    { id: 1, texto: "Nueva orden creada", vista: false },
    { id: 2, texto: "Entrega confirmada", vista: true },
    { id: 3, texto: "Reporte generado", vista: false },
  ]);

  const unreadCount = notifications.filter(n => !n.vista).length;

  const BellNormal = () => (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path
        fill="#ff7a00"
        d="M12 2a6 6 0 0 0-6 6v4.5l-1.7 2.6A1 1 0 0 0 5 17h14a1 1 0 0 0 .8-1.6L18 12.5V8a6 6 0 0 0-6-6zm0 20a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22z"
      />
    </svg>
  );

  const BellWithNotification = () => (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path
        fill="#ff7a00"
        d="M12 2a6 6 0 0 0-6 6v4.5l-1.7 2.6A1 1 0 0 0 5 17h14a1 1 0 0 0 .8-1.6L18 12.5V8a6 6 0 0 0-6-6zm0 20a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22z"
      />
      <circle cx="18" cy="6" r="5" fill="#ff3b3b" />
    </svg>
  );

  const marcarTodasLeidas = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, vista: true }))
    );
  };

  const marcarLeida = (id) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === id ? { ...n, vista: true } : n
      )
    );
  };


  const [menuOpen, setMenuOpen] = useState(false);
  const role = String(user?.normalizedRole || user?.role || "").toUpperCase();
  const [transportistaAction, setTransportistaAction] = useState({
    title: t("confirmarEnvio"),
    to: "/transportista",
    icon: "✅",
    label: t("confirmarEnvio"),
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
              title: t("confirmarEnvio"),
              to: "/transportista",
              icon: "✅",
              label: t("confirmarEnvio"),
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
                  title: t("confirmarEnvio"),
                  to: `/transportista/orden/${orden.id}/iniciar-viaje`,
                  icon: "✅",
                  label: t("confirmarEnvio"),
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
  }, [role, user, t]);

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

  const roleConfig = {
    OPERADOR: {
      title: t("historialOrdenes"),
      to: "/historial-operador",
      icon: "🕘",
      label: t("historialOrdenes"),
    },
    SUPERVISOR: {
      title: "Reportes",
      to: "/reportes",
      icon: "📈",
      label: "Reportes",
    },
  };

  const config = roleConfig[role];

  const action = role === "TRANSPORTISTA" ? transportistaAction : actionByRole[role];

  return (
    <nav className="top-nav">
      <div className="nav-left">
        <div className="nav-logo">
          <img src={LogiTrackLogo} alt="LogiTrack" className="logo-img" />
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

          {config && (
            <Link
              title={config.label}
              to={config.to}
              onClick={() => setMenuOpen(false)}
            >
              <span className="icon">{config.icon}</span> {config.label}
            </Link>
          )}

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

        <div className="notification-container">
          <button
            className="notification-btn"
            onClick={handleToggle}
          >
            <div className="bell-wrapper">
              <BellNormal />

              {unreadCount > 0 && (
                <span className="notification-badge">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </div>
          </button>

          {(openNotif || closing) && (
            <div className={`notification-dropdown ${closing ? "closing" : ""}`}>
              <div className="notif-header">
                <strong>Notificaciones</strong>
                <button onClick={marcarTodasLeidas}>
                  Marcar todas
                </button>
              </div>

              <div className="notif-list">
                {notifications.length === 0 ? (
                  <span className="empty">Sin notificaciones</span>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`notif-item ${n.vista ? "" : "unread"}`}
                      onClick={() => marcarLeida(n.id)}
                      style={{ cursor: "pointer" }}
                    >
                      {n.texto}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

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
