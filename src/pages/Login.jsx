// Login.jsx

import axios from 'axios';
import { Fragment, useState } from "react";
import { useTranslation } from "react-i18next";
import "../styles/login.css";
import LogiTrackLogo from "../assets/LogiTrack_Logo_colored.png";

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
  const [error, setError] = useState("");

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
      };

      onLogin(userData);

    localStorage.setItem("token", JSON.stringify(userData));
    localStorage.setItem("legajo", userData.legajo);

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
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
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
