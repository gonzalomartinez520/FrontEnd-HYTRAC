import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/nuevoEnvio.css";
import LogiTrackLogo from "../assets/LogiTrack_Logo_colored.png";

export default function NuevoEnvio({ user }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    origen: "",
    destino: "",
    destinatarioNombre: "",
    destinatarioTelefono: "",
    peso: "",
    dimensiones: "",
    tipoEnvio: "NORMAL",
    notasAdicionales: "",
    ventanaHoras: "24",
    fragil: false,
    frio: false,
    distanciaEstimada: "",
    saturacion: "MEDIA"
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Logic: Volume Calculation
  const calculateVolume = () => {
    if (!formData.dimensiones) return 0;
    const dims = formData.dimensiones.split("x");
    if (dims.length !== 3) return 0;
    const [largo, ancho, alto] = dims.map(d => parseFloat(d.trim()));
    if (isNaN(largo) || isNaN(ancho) || isNaN(alto)) return 0;
    return Math.round((largo * ancho * alto) / 1000);
  };

  // Logic: Date Calculation
  const calculateEstimatedDate = () => {
    const hours = parseInt(formData.ventanaHoras);
    if (isNaN(hours)) return "Esperando horas...";
    const date = new Date();
    date.setHours(date.getHours() + hours);
    return date.toLocaleString('es-AR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const calculatedVolume = calculateVolume();
  const calculatedDateString = calculateEstimatedDate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "acceptedTerms") {
      setAcceptedTerms(checked);
    } else if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!acceptedTerms) {
      setError("Debes aceptar los términos y condiciones.");
      setLoading(false);
      return;
    }

    try {
      const deliveryDate = new Date();
      deliveryDate.setHours(deliveryDate.getHours() + parseInt(formData.ventanaHoras));

      const payload = {
        ...formData,
        peso: parseFloat(formData.peso),
        volumen: calculatedVolume,
        ventanaHoras: parseInt(formData.ventanaHoras),
        fechaEstimadaEntrega: deliveryDate.toISOString(),
        distanciaEstimada: formData.distanciaEstimada ? parseInt(formData.distanciaEstimada) : null,
        creadoPor: user?.username || "operario-web"
      };

      const response = await api.post("/envios", payload);
      setSuccess(`¡Envío creado exitosamente! Tracking ID: ${response.data.trackingId}`);
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      setError(err?.response?.data?.message || "Error al crear el envío.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="nuevo-envio-container">
      <header className="form-header">
        <div className="header-icon"><img src={LogiTrackLogo} alt="LogiTrack" className="header-logo-img" /></div>
        <div>
          <h1>Nuevo Envío</h1>
          <p>Sistema de Gestión LogiTrack</p>
        </div>
      </header>

      <form className="envio-form card" onSubmit={handleSubmit}>

        {/* 1. INFORMACION DE RUTA */}
        <section className="form-section">
          <h3>📍 Información de Ruta</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Origen *</label>
              <input name="origen" placeholder="Ej: Buenos Aires" value={formData.origen} required disabled={loading} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Destino *</label>
              <input name="destino" placeholder="Ej: Córdoba" value={formData.destino} required disabled={loading} onChange={handleChange} />
            </div>
          </div>
        </section>

        {/* 2. INFORMACION DESTINATARIO */}
        <section className="form-section">
          <h3>👤 Información del Destinatario</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Nombre completo *</label>
              <input name="destinatarioNombre" value={formData.destinatarioNombre} required disabled={loading} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Teléfono *</label>
              <input name="destinatarioTelefono" value={formData.destinatarioTelefono} required disabled={loading} onChange={handleChange} />
            </div>
          </div>
        </section>

        {/* 3. INFORMACION PAQUETE */}
        <section className="form-section">
          <h3>📦 Información del Paquete</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Peso (kg) *</label>
              <input name="peso" type="number" step="0.1" value={formData.peso} required disabled={loading} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Dimensiones (cm) *</label>
              <input name="dimensiones" placeholder="Ej: 40x30x20" value={formData.dimensiones} required disabled={loading} onChange={handleChange} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group checkbox-group">
              <label>
                <input name="fragil" type="checkbox" checked={formData.fragil} disabled={loading} onChange={handleChange} />
                <span>Paquete frágil</span>
              </label>
            </div>
            <div className="form-group checkbox-group">
              <label>
                <input name="frio" type="checkbox" checked={formData.frio} disabled={loading} onChange={handleChange} />
                <span>Requiere refrigeración</span>
              </label>
            </div>
          </div>
          <div className="form-group">
            <label>Volumen auto-calculado (Litros)</label>
            <input type="number" value={calculatedVolume} disabled className="input-disabled" />
          </div>
        </section>

        {/* 4. INFORMACION DE ENVIO */}
        <section className="form-section">
          <h3>🚚 Información de Envío</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Distancia estimada (km) *</label>
              <input
                name="distanciaEstimada"
                type="number"
                placeholder="Ej: 250"
                value={formData.distanciaEstimada}
                required
                disabled={loading}
                onChange={handleChange}
              />
              <small>Distancia aproximada entre origen y destino</small>
            </div>
            <div className="form-group">
              <label>Nivel de saturación *</label>
              <select name="saturacion" value={formData.saturacion} disabled={loading} onChange={handleChange}>
                <option value="BAJA">Baja</option>
                <option value="MEDIA">Media</option>
                <option value="ALTA">Alta</option>
              </select>
              <small>Congestión esperada en la ruta</small>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Tipo de Envío *</label>
              <select name="tipoEnvio" value={formData.tipoEnvio} disabled={loading} onChange={handleChange}>
                <option value="NORMAL">Normal</option>
                <option value="EXPRESS">Express</option>
              </select>
            </div>
            <div className="form-group">
              <label>Ventana de entrega (horas) *</label>
              <input 
                name="ventanaHoras"
                type="number" 
                min="1"
                placeholder="Ej: 24" 
                value={formData.ventanaHoras}
                required 
                disabled={loading}
                onChange={handleChange}
              />
              <small>Tiempo máximo disponible para realizar la entrega</small>
            </div>
          </div>
          <div className="form-group full-width">
            <label>Fecha estimada de entrega (Calculada automáticamente)</label>
            <input type="text" value={calculatedDateString} disabled className="input-disabled" style={{ fontWeight: 'bold', color: '#2c3e50' }} />
          </div>
        </section>

        {/* 5. FINALIZAR */}
        <section className="form-section">
          <h3>✅ Finalizar Registro</h3>
          <div className="form-group full-width">
            <label>Notas adicionales (opcional)</label>
            <textarea
              name="notasAdicionales"
              placeholder="Ej: Frágil - Manejar con cuidado..."
              value={formData.notasAdicionales}
              disabled={loading}
              onChange={handleChange}
            />
          </div>

          <div className="terms-section">
            <label className="terms-checkbox">
              <input name="acceptedTerms" type="checkbox" checked={acceptedTerms} onChange={handleChange} required />
              <span>
                Acepto los términos y condiciones asociados a la <strong>Ley 25.326</strong> (Protección de Datos Personales).
                Confirmo que los datos del destinatario han sido proporcionados con su consentimiento y serán utilizados únicamente para fines de entrega.
              </span>
            </label>
          </div>
          <div className="info-alert">
            <strong>Información:</strong> Una vez creado el envío, se generará automáticamente un número de seguimiento único (tracking ID). El estado inicial será "PENDIENTE" y será creado por el usuario: <strong>{user?.username || "operario-web"}</strong>
          </div>
        </section>

        {error && <div className="error-alert">❌ {error}</div>}
        {success && <div className="success-alert">✅ {success}</div>}

        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={() => navigate("/dashboard")} disabled={loading}>Cancelar</button>
          <button type="submit" className="btn-submit" disabled={loading}>{loading ? "Procesando..." : "Crear Envío"}</button>
        </div>
      </form>
    </div>
  );
}