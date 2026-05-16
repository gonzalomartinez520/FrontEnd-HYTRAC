import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import "../styles/navbar.css";
import LogiTrackLogo from "../assets/LogiTrack_Logo_colored.png";

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    // 🗑️ Eliminar sesión completa
    localStorage.removeItem("token");

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

  const role = user?.role?.toUpperCase();


  // Definir acciones específicas por rol, SE PUEDE ESCALAR CON LOS ROLES RESTANTES.
  const actionByRole = {
    OPERADOR: {
      title: "Nueva Orden",
      to: "/nuevo-envio",
      icon: "➕",
      label: "Nueva Orden",
    },
    ADMIN: {
      title: "Confirmar Envío",
      to: "/confirmar-envio",
      icon: "✅",
      label: "Confirmar Envío",
    },
  };

  const action = actionByRole[role];

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
            to="/dashboard"
            onClick={() => setMenuOpen(false)}
          >
            <span className="icon">🏠</span> Panel Control
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
        </div>
      </div>

      <div className="nav-right">
        <div className="user-profile">
          <span className="user-icon">👤</span>
          <div className="user-info">
            <strong>
              {user?.nombre || "Usuario"} {user?.apellido || ""}
            </strong>
            <span>{user?.role?.toLowerCase() || "Operario"}</span>
          </div>
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          Salir
        </button>
      </div>
    </nav>
  );
}