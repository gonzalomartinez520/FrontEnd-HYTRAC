import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { canNotificarEntrega, transportista as transportistaApi } from "../api";
import "../styles/navbar.css";
import LogiTrackLogo from "../assets/LogiTrack_Logo_colored.png";

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const role = String(user?.normalizedRole || user?.role || "").toUpperCase();
  const [transportistaAction, setTransportistaAction] = useState({
    title: "Confirmar Envío",
    to: "/transportista",
    icon: "✅",
    label: "Confirmar Envío",
  });


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
              title: "Confirmar Envío",
              to: "/transportista",
              icon: "✅",
              label: "Confirmar Envío",
            });
          }
          return;
        }

        const shouldNotificarEntrega = canNotificarEntrega(orden);

        if (isMounted) {
          setTransportistaAction(
            shouldNotificarEntrega
              ? {
                  title: "Notificar Entrega",
                  to: `/transportista/orden/${orden.id}/iniciar-viaje`,
                  icon: "📦",
                  label: "Notificar Entrega",
                }
              : {
                  title: "Confirmar Envío",
                  to: `/transportista/orden/${orden.id}/iniciar-viaje`,
                  icon: "✅",
                  label: "Confirmar Envío",
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
  };

  const homeTo = homeByRole[role] || "/dashboard";


  // Definir acciones específicas por rol, SE PUEDE ESCALAR CON LOS ROLES RESTANTES.
  const actionByRole = {
    OPERADOR: {
      title: "Nueva Orden",
      to: "/nuevo-envio",
      icon: "➕",
      label: "Nueva Orden",
    },
    ADMIN: {
      title: "Confirmaciones",
      to: "/confirmaciones",
      icon: "✅",
      label: "Confirmaciones",
    },
    TRANSPORTISTA: {
      title: "Reportar Incidencia",
      to: "/transportista/incidencia",
      icon: "⚠️",
      label: "Incidencia",
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
            title="Panel Control"
            to={homeTo}
            onClick={() => setMenuOpen(false)}
          >
            {role === "TRANSPORTISTA" ? (
              <>
                <span className="route-nav-icon" aria-hidden="true">🛣️</span> Mi ruta
              </>
            ) : (
              <>
                <span className="icon">🏠</span> Panel Control
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
            title="Historial de Ordenes"
            to="/historial-operador"
            onClick={() => setMenuOpen(false)}
          >
            {role == "OPERADOR" ? (
              <>
                <span className="route-nav-icon" aria-hidden="true">🕘</span> Historial de Órdenes
              </>
            ) : (
              null
            
            )}
          </Link>
        </div>
      </div>

      <div className="nav-right">
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
            <span>{(user?.normalizedRole || user?.role || "Operario").toString().toLowerCase()}</span>
          </div>
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          Salir
        </button>
      </div>
    </nav>
  );
}
