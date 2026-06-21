// Login.jsx

import axios from 'axios';
import { Fragment, useState } from "react";
import { useTranslation } from "react-i18next";
import "../styles/login.css";
import LogiTrackLogo from "../assets/LogiTrack_Logo_colored.png";
import { useTheme } from "@/hooks/useTheme";



const decodeJwtPayload = (token) => {
  if (!token || typeof token !== "string") {
    return null;
  }

  try {
    const payloadPart = token.split(".")[1];

    if (!payloadPart) {
      return null;
    }

    const normalizedPayload = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(normalizedPayload)
        .split("")
        .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, "0")}`)
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

export default function Login({ onLogin }) {
  const { t } = useTranslation("common");
  const [mail, setMail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { theme, toggleTheme } = useTheme();

  const API_URL = import.meta.env.VITE_API_URL

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!mail || typeof mail !== "string" || !mail.trim()) {
      setError(t("login.errors.emailRequired"));
      return;
    }

    if (!password || typeof password !== "string" || !password.trim()) {
      setError(t("login.errors.passwordRequired"));
      return;
    }

    setError("");

    try {
      const { data } = await axios.post(`${API_URL}/auth/login`, {
        email: mail,
        password: password,
      });

      console.log("Login OK:", data);

      const transportistaId =
        data?.transportistaId ??
        data?.idTransportista ??
        data?.transportista?.id ??
        data?.transportista?.transportistaId ??
        data?.id ??
        null;

      const tokenPayload = decodeJwtPayload(
  data?.token ?? data?.accessToken ?? data?.jwt ?? data?.authToken
);

console.log("TOKEN PAYLOAD COMPLETO:", tokenPayload);

console.log("LEGAJO DEL TOKEN:", {
  legajo: tokenPayload?.legajo,
  nroLegajo: tokenPayload?.nroLegajo,
  numeroLegajo: tokenPayload?.numeroLegajo,
  employeeId: tokenPayload?.employeeId,
  Legajo: tokenPayload?.Legajo,
  id_legajo: tokenPayload?.id_legajo,
});

      const legajo =
        tokenPayload?.legajo ??
        tokenPayload?.nroLegajo ??
        tokenPayload?.numeroLegajo ??
        tokenPayload?.employeeId ??
        data?.legajo ??
        data?.nroLegajo ??
        data?.numeroLegajo ??
        data?.employeeId ??
        data?.transportista?.legajo ??
        data?.transportista?.nroLegajo ??
        null;

      const userData = {
        ...data,
        role: data.rol,
        normalizedRole: String(data.rol || data.role || "").toUpperCase(),
        transportistaId,
        legajo,
        aceptoTerminos: data. aceptoTerminos ?? false,
      };

      onLogin(userData);

    localStorage.setItem("token", JSON.stringify(userData));
    localStorage.setItem("legajo", userData.legajo);
    localStorage.setItem("lugarOperativo", tokenPayload.lugarOperativo);

    } catch (error) {
      console.error(error);

      if (error.response) {
        const message = error.response.data?.message;
        
        // Comprobamos código 401 o variaciones del mensaje de credenciales incorrectas
        if (
          error.response.status === 401 || 
          (typeof message === "string" && message.toLowerCase().includes("incorrect"))
        ) {
          setError(t("login.errors.invalidCredentials"));
        } else if (message) {
          setError(message);
        } else {
          setError(t("login.errors.unexpected"));
        }
      } else {
        setError(t("login.errors.unexpected"));
      }
    }
  };

  return (
    <div className="login-page">

       <div className="login-theme-toggle">
        <button
          className="theme-switch"
          onClick={toggleTheme}
          role="switch"
          aria-checked={theme === "light"}
          title={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
        >
          <span className="theme-switch-track">
            <span className="theme-switch-icon sun">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="5"/>
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
              </svg>
            </span>
            <span className="theme-switch-icon moon">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            </span>
            <span className="theme-switch-thumb" />
          </span>
        </button>
      </div>
      {/* PANEL IZQUIERDO */}
      <div className="left-panel">
        <div className="grid-overlay"></div>

        <div className="brand-container">
          <div className="brand-top">
            <div className="logo-icon">⛟</div>

            <div>
              <h2>HYTRAC</h2>
              <span>BLACK MESA RESEARCH</span>
            </div>
          </div>

          <div className="hero-text">
            <h1>
              {t("login.heroTitle").split("\n").map((line, index, lines) => (
                <Fragment key={line}>
                  {index === lines.length - 1 ? <span>{line}</span> : line}
                  {index < lines.length - 1 && <br />}
                </Fragment>
              ))}
            </h1>

            <p>
              {t("login.heroDescription")}
            </p>
          </div>

          <div className="metrics">
            <div className="metric-item">
              <h3>2.4K</h3>
              <span>{t("login.shipmentsPerMonth")}</span>
            </div>

            <div className="metric-item">
              <h3>98.7%</h3>
              <span>{t("login.compliance")}</span>
            </div>

            <div className="metric-item">
              <h3>24/7</h3>
              <span>{t("login.monitoring")}</span>
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

          <h1>{t("login.welcome")}</h1>

          <p className="login-subtitle">
            {t("login.subtitle")}
          </p>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>{t("login.email")}</label>

              <div className="input-wrapper">
                <span>⌘</span>

                <input
                  type="text"
                  value={mail}
                  onChange={(e) => setMail(e.target.value)}
                />
              </div>
            </div>

            <div className="input-group">
              <div className="password-top">
                <label>{t("login.password")}</label>
              </div>

              <div className="input-wrapper">
                <span>🔒</span>

                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <svg
                            xmlns="http://www.w3.org/2000/svg"
                            height="24"
                            viewBox="0 0 24 24"
                            width="24"
                            fill="currentColor"
                            >
                            {/* línea del ojo */}
                            <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z" opacity="0.3"/>
                                                    
                            {/* línea tachada */}
                            <line x1="3" y1="3" x2="21" y2="21" stroke="currentColor" strokeWidth="2"/>

                            {/* pupila */}
                            <circle cx="12" cy="12" r="3"/>
                            </svg> :                         
                            
                            <svg
                            xmlns="http://www.w3.org/2000/svg"
                            height="24"
                            viewBox="0 0 24 24"
                            width="24"
                            fill="currentColor"
                            >
                                <path d="M12 6c-4.79 0-8.73 3.11-10 6 1.27 2.89 5.21 6 10 6s8.73-3.11 10-6c-1.27-2.89-5.21-6-10-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>
                                <circle cx="12" cy="12" r="2.5"/>
                            </svg>}
                </button>
              </div>
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <button type="submit" className="login-btn">
              {t("login.submit")}
            </button>
          </form>

          <div className="login-footer">
            <span>BLACK MESA RESEARCH</span>
            <span>© HYTRAC Argentina</span>
          </div>
        </div>
      </div>
    </div>
  );
}
