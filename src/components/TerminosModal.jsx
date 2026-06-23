import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usuarios } from "../api/apiClient";
import "../styles/TerminosModal.css";

import { useTranslation } from "react-i18next";

export default function TerminosModal({ user, onAceptar }) {
    const { t } = useTranslation("aceptarTerminos");

    const canvasRef = useRef(null);
    const navigate = useNavigate();
    const [dibujando, setDibujando] = useState(false);
    const [firmado, setFirmado] = useState(false);
    const [loading, setLoading] = useState(false);
    const [mostrarAlerta, setMostrarAlerta] = useState(false);

    // ─── Canvas drawing ───────────────────────────────────────────
    const getPos = (e, canvas) => {
        const rect = canvas.getBoundingClientRect();
        if (e.touches) {
            return {
                x: e.touches[0].clientX - rect.left,
                y: e.touches[0].clientY - rect.top
            };
        }
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const iniciarDibujo = (e) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        const pos = getPos(e, canvas);
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        setDibujando(true);
    };

    const dibujar = (e) => {
        if (!dibujando) return;
        e.preventDefault();
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        const pos = getPos(e, canvas);
        const strokeColor = getComputedStyle(document.documentElement)
        .getPropertyValue("--text-primary")
        .trim();
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.strokeStyle = strokeColor || "#fefeff";
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        setFirmado(true);
    };

    const terminarDibujo = () => setDibujando(false);

    const limpiarFirma = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setFirmado(false);
    };

    // ─── Confirmar Salida ────────────────────────────────────────
    const confirmarSalida = () => {
        localStorage.clear(); // Limpia token, legajo y lugar operativo de una
        navigate("/login");
        window.location.reload();
    };

    // ─── Aceptar ──────────────────────────────────────────────────
    const handleAceptar = async () => {
        if (!firmado) return;
        setLoading(true);
        try {
            await usuarios.aceptarTerminos(user.legajo);
            onAceptar();
        } catch (error) {
            console.error("Error al aceptar términos:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="terminos-overlay">
            <div className="terminos-modal">

                <div className="terminos-header">
                    <span>⛟</span>
                    <div>
                        <h2>{t("title")}</h2>
                        <p>{t("subtitle")}</p>
                    </div>
                </div>

                <div className="terminos-body">
                    <h3>{t("body.title1")}</h3>
                    <p>
                        {t("body.text1")}
                    </p>

                    <h3>{t("body.title2")}</h3>
                    <p>
                        {t("body.text2")}
                    </p>

                    <h3>{t("body.title3")}</h3>
                    <p>
                        {t("body.text3")}
                    </p>
                </div>

                <div className="terminos-firma">
                    <p>{t("extras.firma")}</p>

                    <canvas
                        ref={canvasRef}
                        width={480}
                        height={120}
                        className="firma-canvas"
                        onMouseDown={iniciarDibujo}
                        onMouseMove={dibujar}
                        onMouseUp={terminarDibujo}
                        onMouseLeave={terminarDibujo}
                        onTouchStart={iniciarDibujo}
                        onTouchMove={dibujar}
                        onTouchEnd={terminarDibujo}
                    />

                    <button className="limpiar-firma" onClick={limpiarFirma}>
                        {t("extras.limpiarFirma")}
                    </button>
                </div>

                <div className="terminos-footer">
                    <p className="terminos-usuario">
                        {user.nombre} {user.apellido} — Legajo {user.legajo}
                    </p>
                    <button className="volver-btn" onClick={() => setMostrarAlerta(true)}>
                        {t("extras.volver")}
                    </button>
                    <button
                        className="aceptar-btn"
                        onClick={handleAceptar}
                        disabled={!firmado || loading}
                    >
                        {loading ? t("extras.procesando") : t("extras.aceptoTerminos")}
                    </button>
                </div>

            </div>

            {mostrarAlerta && (
                <div className="alerta-overlay">
                    <div className="alerta-card">
                        <div className="alerta-icono">⚠️</div>
                        <h3>{t("extras.atencion")}</h3>
                        <p>{t("extras.mensajeAtencion")}</p>
                        <div className="alerta-acciones">
                            <button className="alerta-btn-cancelar" onClick={() => setMostrarAlerta(false)}>
                                {t("extras.cancelar")}
                            </button>
                            <button className="alerta-btn-salir" onClick={confirmarSalida}>
                                {t("extras.volverLogin")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}