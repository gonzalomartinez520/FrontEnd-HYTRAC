import { useRef, useState } from "react";
//import { usuarios } from "@/api";
import "../styles/TerminosModal.css";

export default function TerminosModal({ user, onAceptar }) {
    const canvasRef = useRef(null);
    const [dibujando, setDibujando] = useState(false);
    const [firmado, setFirmado] = useState(false);
    const [loading, setLoading] = useState(false);

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
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.strokeStyle = "#fefeff";
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
                        <h2>Términos y Condiciones de Uso</h2>
                        <p>HYTRAC — Black Mesa Research</p>
                    </div>
                </div>

                <div className="terminos-body">
                    <h3>1. Protección de Datos Personales — Ley 25.326</h3>
                    <p>
                        En cumplimiento de la <strong>Ley 25.326 de Protección de Datos Personales</strong>, 
                        HYTRAC informa que sus datos personales (nombre, DNI, legajo, email) serán 
                        tratados exclusivamente con fines operativos y logísticos. Usted tiene derecho 
                        a acceder, rectificar y suprimir sus datos (derechos ARCO).
                    </p>

                    <h3>2. Uso de la Plataforma</h3>
                    <p>
                        El acceso a HYTRAC es personal e intransferible. El usuario es responsable 
                        de mantener la confidencialidad de sus credenciales. Cualquier uso indebido 
                        de la plataforma será registrado en los logs de auditoría del sistema.
                    </p>

                    <h3>3. Normativa aplicable</h3>
                    <p>
                        El uso de esta plataforma implica el conocimiento y aceptación de las 
                        normativas vigentes: Ley 24.449, Ley 24.051, Ley 25.326, Decreto 779/95 
                        y Resolución SE 1102/2004.
                    </p>
                </div>

                <div className="terminos-firma">
                    <p>Firmá a continuación para confirmar que leíste y aceptás los términos:</p>

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
                        Limpiar firma
                    </button>
                </div>

                <div className="terminos-footer">
                    <p className="terminos-usuario">
                        {user.nombre} {user.apellido} — Legajo {user.legajo}
                    </p>
                    <button
                        className="aceptar-btn"
                        onClick={handleAceptar}
                        disabled={!firmado || loading}
                    >
                        {loading ? "Procesando..." : "Acepto los Términos y Condiciones"}
                    </button>
                </div>

            </div>
        </div>
    );
}