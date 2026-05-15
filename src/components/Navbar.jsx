import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import "../styles/navbar.css";
import LogiTrackLogo from "../assets/LogiTrack_Logo_colored.png";

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    onLogout(null);
    navigate("/login");
  };

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

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
          <Link title="Panel Control" to="/dashboard" onClick={() => setMenuOpen(false)}>
            <span className="icon">🏠</span> Panel Control
          </Link>
          <Link title="Nueva Orden" to="/nuevo-envio" onClick={() => setMenuOpen(false)}>
            <span className="icon">➕</span> Nueva Orden
          </Link>
          <Link title="Confirmar Envío" to="/confirmar-envio" onClick={() => setMenuOpen(false)}>
            <span className="icon">✅</span> Confirmar Envío
          </Link>
        </div>
      </div>

      <div className="nav-right">
        <div className="user-profile">
          <span className="user-icon">👤</span>
          <div className="user-info">
            <strong>{user?.nombre || "Usuario"} {user?.apellido || ""}</strong>
            <span>{user?.role?.toLowerCase() || "Operario"}</span>
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout}>Salir</button>
      </div>
    </nav>
  );
}