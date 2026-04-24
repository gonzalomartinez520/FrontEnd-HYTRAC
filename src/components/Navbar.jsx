import { Link, useNavigate } from "react-router-dom";
import "../styles/navbar.css";
import LogiTrackLogo from "../assets/LogiTrack_Logo_colored.png";

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout(null);
    navigate("/login");
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
        <div className="nav-links">
          <Link title="Panel Control" to="/dashboard"><span className="icon">🏠</span> Panel Control</Link>
          <Link title="Nueva Orden" to="/nuevo-envio"><span className="icon">➕</span> Nueva Orden</Link>
        </div>
      </div>

      <div className="nav-right">
        <div className="user-profile">
          <span className="user-icon">👤</span>
          <div className="user-info">
            <strong>{user?.username || "Usuario"}</strong>
            <span>{user?.role || "Operario"}</span>
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout}>Salir</button>
      </div>
    </nav>
  );
}