// Login.jsx

import { useState } from "react";
import "../styles/login.css";
import LogiTrackLogo from "../assets/LogiTrack_Logo_colored.png";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("LEG-04821");
  const [password, setPassword] = useState("********");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!username.trim()) {
      setError("Por favor ingresá un usuario válido.");
      return;
    }

    if (!password.trim()) {
      setError("Por favor ingresá tu contraseña.");
      return;
    }

    setError("");

    onLogin({
      username,
    });
  };

  return (
    <div className="login-page">
      {/* PANEL IZQUIERDO */}
      <div className="left-panel">
        <div className="grid-overlay"></div>

        <div className="brand-container">
          <div className="brand-top">
            <div className="logo-icon">⛟</div>

            <div>
              <h2>HYTRAC</h2>
              <span>HYDROCARBON LOGISTICS</span>
            </div>
          </div>

          <p className="platform-tag">
            // PLATAFORMA OPERATIVA v4.2
          </p>

          <div className="hero-text">
            <h1>
              Trazabilidad total
              <br />
              del combustible
              <br />
              <span>en tiempo real.</span>
            </h1>

            <p>
              Gestión integral de envíos hidrocarburíferos para
              operadores, supervisores y transportistas en toda
              Argentina.
            </p>
          </div>

          <div className="metrics">
            <div className="metric-item">
              <h3>2.4K</h3>
              <span>Envíos / mes</span>
            </div>

            <div className="metric-item">
              <h3>98.7%</h3>
              <span>Cumplimiento</span>
            </div>

            <div className="metric-item">
              <h3>24/7</h3>
              <span>Monitoreo</span>
            </div>
          </div>
        </div>
      </div>

      {/* PANEL DERECHO */}
      <div className="right-panel">
        <div className="login-card">
          <div className="mobile-logo">
            <img src={LogiTrackLogo} alt="HYTRAC" />
          </div>

          <h1>Bienvenido</h1>

          <p className="login-subtitle">
            Inicie sesión para acceder a la plataforma.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>LEG AJO / USUARIO</label>

              <div className="input-wrapper">
                <span>⌘</span>

                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="LEG-04821"
                />
              </div>
            </div>

            <div className="input-group">
              <div className="password-top">
                <label>CONTRASEÑA</label>

                <button
                  type="button"
                  className="forgot-btn"
                >
                  ¿Olvidó su contraseña?
                </button>
              </div>

              <div className="input-wrapper">
                <span>🔒</span>

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                />
              </div>
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <button type="submit" className="login-btn">
              Iniciar Sesión
            </button>
          </form>

          <div className="login-footer">
            <span>v4.2.1 - build 2024.11</span>

            <span>© HYTRAC Argentina</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// LOGICA REAL, DEPENDE DE BACKEND
/*import { useState } from "react";
import "./login.css";

export default function Login() {
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("operario");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      username,
      role,
    };

    try {
      const res = await fetch("http://localhost:8080/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("Login response:", data);
    } catch (err) {
      console.error("Error:", err);
    }
  };
  

  return (
    <div className="container">
      <div className="card">
        <div className="logo"><img src={LogiTrackLogo} alt="LogiTrack" className="login-logo-img" /></div>

        <h1>
          <span className="red">Logi</span>Track
        </h1>
        <p className="subtitle">Sistema de Gestión de Envíos</p>

        <form onSubmit={handleSubmit}>
          <label>Usuario</label>
          <input
            type="text"
            placeholder="Ingresa tu nombre de usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <label>Selecciona tu rol</label>

          <div className="roles">
            <div
              className={`role ${role === "operario" ? "active" : ""}`}
              onClick={() => setRole("operario")}
            >
              👤
              <span>Operario</span>
            </div>

            <div
              className={`role ${role === "supervisor" ? "active" : ""}`}
              onClick={() => setRole("supervisor")}
            >
              🛡️
              <span>Supervisor</span>
            </div>
          </div>

          <button type="submit">Iniciar Sesión</button>
        </form>

        <div className="footer">
          Prototipo navegable - LogiTrack ERP © 2026
        </div>
      </div>
    </div>
  );
}*/