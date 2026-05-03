import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/nuevoEnvio.css";
import LogiTrackLogo from "../assets/LogiTrack_Logo_colored.png";
import { envios } from '@/api';

export default function NuevoEnvio({ user }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    patenteCamion: "",
    patenteAcoplado: "",
    capacidad: "",
    pesoMaximo: "",
    choferAsignado: "",
    tipoCombustible: "",
    codigoOnu: "",
    temperatura: "",
    volumenACargar: "",
    densidad: "",
    riesgo: "",
    origen: "",
    destino: "",
    remito: "",
    cot: "",
    distanciaEstimada: "",
    etaEstimada: "",
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
      deliveryDate.setHours(deliveryDate.getHours() + parseInt(formData.ventanaHoras || 24));

      const payload = {
        ...formData,
        peso: formData.peso ? parseFloat(formData.peso) : null,
        volumen: calculatedVolume,
        ventanaHoras: parseInt(formData.ventanaHoras),
        fechaEstimadaEntrega: deliveryDate.toISOString(),
        distanciaEstimada: formData.distanciaEstimada
          ? parseInt(formData.distanciaEstimada)
          : null,
        creadoPor: user?.username || "operario-web",
        // Add any other missing fields your backend expects
      };

      const newEnvio = await envios.create(payload);   // ← Returns the created object

      setSuccess(`¡Envío creado exitosamente! Tracking ID: ${newEnvio.trackingId}`);

      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);

    } catch (err) {
      console.error(err);
      // Improved error handling
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Error al crear el envío.";

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="nuevo-envio-container">
      <header className="form-header">
        <div>
          <p id="nueva-orden">NUEVA ORDEN</p>
          <h1>Crear orden de transporte</h1>
          <p>Complete las secciones para generar el orden</p>
        </div>
      </header>

      <form className="envio-form card" onSubmit={handleSubmit}>

        {/* 01 - Unidad & Chofer */}
        <section className="form-section">
          <span className="step">01</span>
          <h2>Unidad & Chofer</h2>
          <small>Datos del vehículo y verificación documental.</small>

          <div className="grid-2">
            <div className="form-group">
              <label>Patente Camión</label>
              <input type="text" name="patenteCamion" placeholder="AB 432 KL" value={formData.patenteCamion} required disabled={loading} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Patente Acoplado</label>
              <input type="text" name="patenteAcoplado" placeholder="CD 891 OP" value={formData.patenteAcoplado} required disabled={loading} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Capacidad (Litros)</label>
              <input type="number" name="capacidad" placeholder="32000" value={formData.capacidad} required disabled={loading} onChange={handleChange} />
              <small>Volumen máximo del tanque cisterna.</small>
            </div>

            <div className="form-group">
              <label>Peso Maximo (kg)</label>
              <input type="number" name="pesoMaximo" placeholder="45000" value={formData.pesoMaximo} required disabled={loading} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label>Chofer Asignado</label>
            <select defaultValue="Romero">
              <option value="Romero"> C. Romero - Lic. CL-A</option>
            </select>
          </div>

          <div className="grid-2">
            <div className="status ok"> LINTI - En regla</div>
            <div className="status warn"> VTV - Por vencer</div>
          </div>
        </section>

        {/* 02 - Especificaciones de la carga */}
        <section className="form-section">
          <span className="step">02</span>
          <h2>Especificaciones de la carga</h2>
          <small>Combustible, código de transporte peligroso y condiciones.</small>

          <div className="grid-3">
            <div className="form-group">
              <label>Tipo de Combustible</label>
              <select defaultValue="super">
                <option value="super">Súper</option>
              </select>
            </div>

            <div className="form-group">
              <label>Código ONU</label>
              <input type="text" name="codigoOnu" placeholder="UN 1203" value={formData.codigoOnu} required disabled={loading} onChange={handleChange} />
              <small>Código de Operación de Transporte.</small>
            </div>

            <div className="form-group">
              <label>Temperatura (°C)</label>
              <input type="number" name="temperatura" placeholder="22" value={formData.temperatura} required disabled={loading} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Volumen a cargar (L)</label>
              <input type="number" name="volumenACargar" placeholder="30000" value={formData.volumenACargar} required disabled={loading} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Densidad (kg/m³)</label>
              <input type="number" name="densidad" placeholder="745" value={formData.densidad} required disabled={loading} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Clase de riesgo</label>
              <input type="text" name="riesgo" placeholder="Clase 3 - Liquido inflamable" value={formData.riesgo} required disabled={loading} onChange={handleChange} />
            </div>
          </div>
        </section>

        {/* 03 - Logistica & Documentacion*/}
        <section className="form-section">
          <span className="step">03</span>
          <h2>Logistica & Documentación</h2>
          <small>Origen, destino y comprobantes fiscales.</small>

          <div className="grid-2">
            <div className="form-group">
              <label>Origen / Refinería</label>
              <input type="text" name="origen" placeholder="Refinería Dock Sud - Buenos Aires" value={formData.origen} required disabled={loading} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Destino / Estación</label>
              <input type="text" name="destino" placeholder="YPF Neuquén Centro" value={formData.destino} required disabled={loading} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Remito #</label>
              <input type="text" name="remito" placeholder="0042-00012487" value={formData.remito} required disabled={loading} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>COT (ARBA)</label>
              <input type="text" name="cot" placeholder="20240419AR04823910" value={formData.cot} required disabled={loading} onChange={handleChange} />
              <small>Código de Operación de Transporte.</small>
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label>Distancia Estimada (km)</label>
              <input type="number" name="distanciaEstimada" placeholder="500km" value={formData.distanciaEstimada} required disabled={loading} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>ETA Estimada</label>
              <input type="text" name="etaEstimada" placeholder="14:20 - 30/04/2026" value={formData.etaEstimada} required disabled={loading} onChange={handleChange} />
            </div>
          </div>

          <div className="status">
            Verificacion FIE - Validado
          </div>
        </section>

        {/* 04 - Finalizar */}
        <section className="form-section">
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