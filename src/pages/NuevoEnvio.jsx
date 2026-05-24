import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/nuevoEnvio.css";
import { envios } from '@/api';
import { datos } from '@/api';
import RouteMap from "../components/RouteMap";

export default function NuevoEnvio({ user }) {
  const navigate = useNavigate();

  const [combustibles, setCombustibles] = useState([]);
  const [provincias, setProvincias] = useState([]);
  const [localidadesOrigen, setLocalidadesOrigen] = useState([]);
  const [localidadesDestino, setLocalidadesDestino] = useState([]);
  const [camiones, setCamiones] = useState([]);
  const [acoplados, setAcoplados] = useState([]);
  const [transportistas, setTransportistas] = useState([]);
  const [plantasOrigen, setPlantasOrigen] = useState([]);
  const [estacionesDestino, setEstacionesDestino] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // --- NEW STATE FOR ROUTE LOADING ---
  const [isRouteLoading, setIsRouteLoading] = useState(false);

  // Initializing state structured exactly to your API layout
  const [routeData, setRouteData] = useState({
    rutaId: null,
    geometria: null,
    distanciaKm: null,
    tiempoEstimadoHoras: null
  });

  const [formData, setFormData] = useState({
    camion: null,
    patenteCamion: "",
    marcaCamion: "",
    modeloCamion: "",
    pesoMaximo: "",
    acoplado: null,
    patenteAcoplado: "",
    capacidad: "",
    transportista: null,
    choferAsignado: "",
    cuitTransportista: "",
    tipoVinculoTransportista: "",
    combustible: null,
    tipoCombustible: null,
    codigoOnu: "",
    temperatura: "",
    densidad: "",
    riesgo: "",
    volumenACargar: "",
    peso: "",
    provinciaOrigen: null,
    localidadOrigen: null,
    refineriaOrigen: null,
    provinciaDestino: null,
    localidadDestino: null,
    estacionDestino: null,
    remito: "",
    cot: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          combustiblesData,
          provinciasData,
          camionesData,
          acopladosData,
          transportistasData,
        ] = await Promise.all([
          datos.getCombustibles(),
          datos.getProvincias(),
          datos.getCamiones(),
          datos.getAcoplados(),
          datos.getTransportistas(),
        ]);

        setCombustibles(combustiblesData);
        setProvincias(provinciasData);
        setCamiones(camionesData);
        setAcoplados(acopladosData);
        setTransportistas(transportistasData);
      } catch (error) {
        console.error("Error cargando datos:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchLocalidadesOrigen = async () => {
      if (!formData.provinciaOrigen) return;
      const data = await datos.getLocalidades(formData.provinciaOrigen);
      setLocalidadesOrigen(data);
    };
    fetchLocalidadesOrigen();
  }, [formData.provinciaOrigen]);

  useEffect(() => {
    const fetchLocalidadesDestino = async () => {
      if (!formData.provinciaDestino) return;
      const data = await datos.getLocalidades(formData.provinciaDestino);
      setLocalidadesDestino(data);
    };
    fetchLocalidadesDestino();
  }, [formData.provinciaDestino]);

  useEffect(() => {
    const fetchPlantasOrigen = async () => {
      if (!formData.localidadOrigen) return;
      const data = await datos.getPlantaLocalidad(formData.localidadOrigen);
      setPlantasOrigen(data);
    };
    fetchPlantasOrigen();
  }, [formData.localidadOrigen]);

  useEffect(() => {
    const fetchEstacionesDestino = async () => {
      if (!formData.localidadDestino) return;
      const data = await datos.getEstacionLocalidad(formData.localidadDestino);
      setEstacionesDestino(data);
    };
    fetchEstacionesDestino();
  }, [formData.localidadDestino]);

  // Dynamic Route Evaluator Hook
  useEffect(() => {
    const fetchRoute = async () => {
      const origenId = formData.refineriaOrigen?.id;
      const destinoId = formData.estacionDestino?.id;

      // If either location is removed/reset, immediately wipe out the route data
      if (!origenId || !destinoId) {
        setRouteData({ rutaId: null, geometria: null, distanciaKm: null, tiempoEstimadoHoras: null });
        setIsRouteLoading(false);
        return;
      }

      try {
        setIsRouteLoading(true); // Turn loading animation ON
        const response = await fetch(`https://hytrac.dmelhado.com/api/rutas/${origenId}/${destinoId}`);
        if (!response.ok) throw new Error("Could not parse routing points from server connection");
        
        const data = await response.json();
        
        setRouteData({
          rutaId: data.rutaId,
          geometria: data.geometria,
          distanciaKm: data.distanciaKm,
          tiempoEstimadoHoras: data.tiempoEstimadoHoras
        });
      } catch (err) {
        console.error("Routing resolution layer engine crash: ", err);
      } finally {
        setIsRouteLoading(false); // Turn loading animation OFF
      }
    };

    fetchRoute();
  }, [formData.refineriaOrigen, formData.estacionDestino]);

  // Helper function to turn decimal hours (e.g. 5.159) into standard tracking formats (5h 09m)
  const formatRouteTime = (decimalHours) => {
    if (!decimalHours || isNaN(decimalHours)) return "Puntos incompletos";
    const hours = Math.floor(decimalHours);
    const minutes = Math.round((decimalHours - hours) * 60);
    return `${hours}h ${minutes.toString().padStart(2, "0")}m`;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "acceptedTerms") {
      setAcceptedTerms(checked);
    } else if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name === "provinciaOrigen") {
      setFormData((prev) => ({
        ...prev,
        provinciaOrigen: value,
        localidadOrigen: null,
        refineriaOrigen: null,
      }));
      setLocalidadesOrigen([]);
      setPlantasOrigen([]);
    } else if (name === "localidadOrigen") {
      setFormData((prev) => ({
        ...prev,
        localidadOrigen: value,
        refineriaOrigen: null,
      }));
      setPlantasOrigen([]);
    } else if (name === "provinciaDestino") {
      setFormData((prev) => ({
        ...prev,
        provinciaDestino: value,
        localidadDestino: null,
        estacionDestino: null,
      }));
      setLocalidadesDestino([]);
      setEstacionesDestino([]);
    } else if (name === "localidadDestino") {
      setFormData((prev) => ({
        ...prev,
        localidadDestino: value,
        estacionDestino: null,
      }));
      setEstacionesDestino([]);
    } else if (name === "patenteCamion") {
      const camionSeleccionado = camiones.find((camion) => camion.patente === value);
      setFormData((prev) => ({
        ...prev,
        camion: camionSeleccionado,
        patenteCamion: camionSeleccionado ? camionSeleccionado.patente : "",
        marcaCamion: camionSeleccionado ? camionSeleccionado.marca : "",
        modeloCamion: camionSeleccionado ? camionSeleccionado.modelo : "",
        pesoMaximo: camionSeleccionado ? camionSeleccionado.peso_maximo_carga : "",
      }));
    } else if (name === "patenteAcoplado") {
      const acopladoSeleccionado = acoplados.find((acoplado) => acoplado.patente === value);
      setFormData((prev) => ({
        ...prev,
        acoplado: acopladoSeleccionado,
        patenteAcoplado: acopladoSeleccionado ? acopladoSeleccionado.patente : "",
        capacidad: acopladoSeleccionado ? acopladoSeleccionado.capacidadMaximaLitros : "",
      }));
    } else if (name === "tipoCombustible") {
      const combustibleSeleccionado = combustibles.find((combustible) => combustible.id === Number(value));
      setFormData((prev) => ({
        ...prev,
        combustible: combustibleSeleccionado,
        tipoCombustible: combustibleSeleccionado ? combustibleSeleccionado.id : "",
        codigoOnu: combustibleSeleccionado ? combustibleSeleccionado.numeroOnu : "",
        temperatura: combustibleSeleccionado ? combustibleSeleccionado.temperaturaReferencia: "",
        densidad: combustibleSeleccionado ? combustibleSeleccionado.densidad : "",
        riesgo: combustibleSeleccionado ? combustibleSeleccionado.claseRiesgo : "",
      }));
    } else if (name === "choferAsignado") {
      const transportistaSeleccionado = transportistas.find((t) => t.nombre === value);
      setFormData((prev) => ({
        ...prev,
        transportista: transportistaSeleccionado,
        choferAsignado: transportistaSeleccionado ? transportistaSeleccionado.nombre : "",
        cuitTransportista: transportistaSeleccionado ? transportistaSeleccionado.cuit : "",
        tipoVinculoTransportista: transportistaSeleccionado ? transportistaSeleccionado.tipoVinculo : "",
      }));
    } else if (name === "estacionDestino") {
      const estacionSeleccionada = estacionesDestino.find(
        (e) => Number(e.id) === Number(value)
      );
      setFormData((prev) => ({
        ...prev,
        provinciaDestino: estacionSeleccionada?.provinciaId || null,
        localidadDestino: estacionSeleccionada?.localidadId || null,
        estacionDestino: estacionSeleccionada || null,
      }));
    } else if (name === "refineriaOrigen") {
      const refineriaSeleccionada = plantasOrigen.find(
        (e) => Number(e.id) === Number(value)
      );
      setFormData((prev) => ({
        ...prev,
        provinciaOrigen: refineriaSeleccionada?.provinciaId || null,
        localidadOrigen: refineriaSeleccionada?.localidadId || null,
        refineriaOrigen: refineriaSeleccionada || null,
      }));
    }
      else {
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
      const payload = {
        numeroRemito: formData.remito,
        cot: formData.cot,
        camionId: formData.camion?.id || null,
        acopladoId: formData.acoplado?.id || null,
        transportistaId: formData.transportista?.id || null,
        plantaDespachoId: formData.refineriaOrigen?.id || null,
        estacionDestinoId: formData.estacionDestino?.id || null,
        operadorId: user?.id || null, 
        combustibleId: formData.combustible?.id || null,
        rutaId: routeData.rutaId,
        estadoId: 1, //PENDIENTE
        fechaCreacion: new Date().toISOString(),
        fechaSalidaPlanta: null,
        fechaEntrega: null,
        temperaturaCarga: formData.temperatura ? parseFloat(formData.temperatura) : null,
        densidadCarga: formData.densidad ? parseFloat(formData.densidad) : null,
        litrosCargados: formData.volumenACargar ? parseFloat(formData.volumenACargar) : null,
        litrosEntregados: null,
        fieAdjunta: true,
        observaciones: "",
        confirmado: false,
      };

      const newEnvio = await envios.create(payload);
      setSuccess(`¡Envío creado exitosamente! Tracking ID: ${newEnvio.id}`);

      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);

    } catch (err) {
      console.error(err);
      const errorMessage = err?.response?.data?.message || err?.message || "Error al crear el envío.";
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

      <form className="envio-form-card" onSubmit={handleSubmit}>

        {/* 01 - Unidad & Chofer */}
        <section className="form-section">
          <div className="section-title">
            <span className="step">01</span>
            <div className="section-text">
              <h2>
                <svg className="icon" viewBox="0 0 24 24">
                  <path d="M3 6h11v8H3zM14 9h3l3 3v2h-6zM7 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm10 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/>
                </svg>
                Unidad & Chofer</h2>
              <p>Datos del vehículo y verificación documental.</p>
            </div>
          </div>
          

          <div className="grid-2">
            <div>
              <div className="form-group">
                <label>Patente Camión</label>
                <select name="patenteCamion" value={formData.patenteCamion} disabled={loading} onChange={handleChange} required>
                  <option value="">Seleccione una patente</option>
                  {camiones.map((camion) => (
                    <option key={camion.patente} value={camion.patente}>{camion.patente}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Marca</label>
                <input type="text" value={formData.marcaCamion} disabled={true} />
              </div>

              <div className="form-group">
                <label>Modelo</label>
                <input type="text" value={formData.modeloCamion} disabled={true} />
              </div>
            </div>

            <div>
              <div className="form-group">
                <label>Patente Acoplado</label>
                <select name="patenteAcoplado" value={formData.patenteAcoplado} disabled={loading} onChange={handleChange} required>
                  <option value="">Seleccione una patente</option>
                  {acoplados.map((acoplado) => (
                    <option key={acoplado.patente} value={acoplado.patente}>{acoplado.patente}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Capacidad Máxima Acoplado (L)</label>
                <input type="text" name="capacidad" value={formData.capacidad} disabled={true} />
              </div>

              <div className="form-group">
                <label>Peso Maximo (kg)</label>
                <input type="number" name="pesoMaximo" value={formData.pesoMaximo} disabled={true} />
              </div>
            </div>
          </div>

          <div className="chofer-full-width">
            <div className="form-group">
              <label>Chofer Asignado</label>
              <select name="choferAsignado" value={formData.choferAsignado} disabled={loading} onChange={handleChange} required>
                <option value="">Seleccione un transportista</option>
                {transportistas.map((trans) => (
                  <option key={trans.cuit} value={trans.nombre}>{trans.nombre} {trans.apellido}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>CUIT</label>
              <input type="text" value={formData.cuitTransportista} disabled />
            </div>

            <div className="form-group">
              <label>Tipo de vínculo</label>
              <input type="text" value={formData.tipoVinculoTransportista} disabled />
            </div>
          </div>
        </section>

        {/* 02 - Especificaciones de la carga */}
        <section className="form-section">
          <div className="section-title">
            <span className="step">02</span>
            <div className="section-text">
              <h2>
                <svg className="icon" viewBox="0 0 24 24">
                  <path d="M7 2h10v2H7zM7 20h10v2H7zM5 4h14v16H5zM5 10h14M5 14h14"/>
                </svg>
                Especificaciones de la carga</h2>
              <p>Combustible, código de transporte peligroso y condiciones.</p>
            </div>
          </div>

          <div className="grid-3">
            <div className="form-group">
              <label>Tipo de Combustible</label>
              <select name="tipoCombustible" value={formData.tipoCombustible} disabled={loading} onChange={handleChange} required>
                <option value="">Seleccione un combustible</option>
                {combustibles.map((combustible) => (
                  <option key={combustible.id} value={combustible.id}>
                    {combustible.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Código ONU</label>
              <input type="text" name="codigoOnu" value={formData.codigoOnu} required disabled />
            </div>

            <div className="form-group">
              <label>Temperatura (°C)</label>
              <input type="number" name="temperatura" value={formData.temperatura} required disabled />
            </div>

            <div className="form-group">
              <label>Volumen a cargar (L)</label>
              <input type="number" name="volumenACargar" placeholder="30000" min="0" value={formData.volumenACargar} required disabled={loading} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Densidad (kg/m³)</label>
              <input type="number" name="densidad" value={formData.densidad} required disabled />
            </div>

            <div className="form-group">
              <label>Clase de riesgo</label>
              <input type="text" name="riesgo" value={formData.riesgo} required disabled />
            </div>
          </div>
        </section>

        {/* 03 - Logistica & Documentacion*/}
        <section className="form-section">
          <div className="section-title">
            <span className="step">03</span>
            <div className="section-text">
              <h2>
                <svg className="icon" viewBox="0 0 24 24">
                  <path d="M6 2h9l5 5v15H6zM15 2v6h6M8 13h8M8 17h8M8 9h4"/>
                </svg>
                Logistica & Documentación</h2>
              <p>Origen, destino y comprobantes fiscales.</p>
            </div>
          </div>

          <div className="grid-2">
            <div>
              <div className="form-group">
                <label>Provincia de origen</label>
                <select name="provinciaOrigen" value={formData.provinciaOrigen} disabled={loading} onChange={handleChange}>
                  <option value="">Seleccione una provincia</option>
                  {provincias.map((prov) => (
                    <option key={prov.id} value={prov.id}>{prov.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Localidad de origen</label>
                <select name="localidadOrigen" value={formData.localidadOrigen} disabled={!formData.provinciaOrigen || loading} onChange={handleChange}>
                  <option value="">Seleccione una localidad</option>
                  {localidadesOrigen.map((loc) => (
                    <option key={loc.id} value={loc.id}>{loc.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Refinería de origen</label>
                <select name="refineriaOrigen" value={formData.refineriaOrigen?.id || ""} disabled={!formData.localidadOrigen || loading} onChange={handleChange}>
                  <option value="">Seleccione una refinería</option>
                  {plantasOrigen.map((ref) => (
                    <option key={ref.id} value={ref.id}>{ref.nombre}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <div className="form-group">
                <label>Provincia de destino</label>
                <select name="provinciaDestino" value={formData.provinciaDestino} disabled={loading} onChange={handleChange}>
                  <option value="">Seleccione una provincia</option>
                  {provincias.map((prov) => (
                    <option key={prov.id} value={prov.id}>{prov.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Localidad de destino</label>
                <select name="localidadDestino" value={formData.localidadDestino} disabled={!formData.provinciaDestino || loading} onChange={handleChange}>
                  <option value="">Seleccione una localidad</option>
                  {localidadesDestino.map((loc) => (
                    <option key={loc.id} value={loc.id}>{loc.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Estación de servicio destino</label>
                <select name="estacionDestino" value={formData.estacionDestino?.id || ""} disabled={!formData.localidadDestino || loading} onChange={handleChange}>
                  <option value="">Seleccione una estación</option>
                  {estacionesDestino.map((est) => (
                    <option key={est.id} value={est.id}>{est.nombre}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* PERSISTENT MAP GRID BLOCK WITH UPDATED LOADING STATE */}
          <div className="map-integration-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "20px", marginBottom: "20px" }}>
            <div style={{ position: "relative" }}>
              <RouteMap geometry={routeData.geometria} />
              
              {/* Optional: Simple subtle blur layer over the map during live fetch */}
              {isRouteLoading && (
                <div style={{
                  position: "absolute",
                  top: 0, left: 0, right: 0, bottom: 0,
                  backgroundColor: "rgba(15, 23, 42, 0.2)",
                  backdropFilter: "blur(2px)",
                  borderRadius: "8px",
                  zIndex: 400,
                  pointerEvents: "none"
                }} />
              )}
            </div>
            
            <div className="route-telemetry-panel" style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "24px", borderRadius: "8px", background: "#1a2332", color: "#fff", position: "relative" }}>
              
              {/* LIVE REFINERY BUFFERING INDICATOR */}
              {isRouteLoading ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px", height: "100%" }}>
                  {/* CSS Inline Animated Spinner */}
                  <div style={{
                    width: "36px",
                    height: "36px",
                    border: "3px solid rgba(59, 130, 246, 0.2)",
                    borderTop: "3px solid #3b82f6",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite"
                  }} />
                  <style>{`
                    @keyframes spin {
                      0% { transform: rotate(0deg); }
                      100% { transform: rotate(360deg); }
                    }
                  `}</style>
                  <span style={{ fontSize: "14px", color: "#94a3b8", fontWeight: "500", letterSpacing: "0.3px" }}>
                    Calculando ruta óptima...
                  </span>
                </div>
              ) : (
                <>
                  <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", color: "#3b82f6", letterSpacing: "0.5px", textTransform: "uppercase" }}>
                    Información de Ruta Estimada
                  </h3>
                  <p style={{ margin: "6px 0", fontSize: "15px", color: "#cbd5e1" }}>
                    <strong style={{ color: "#fff" }}>Distancia Total:</strong> {routeData.distanciaKm ? `${Number(routeData.distanciaKm).toFixed(1)} km` : "--"}
                  </p>
                  <p style={{ margin: "6px 0", fontSize: "15px", color: "#cbd5e1" }}>
                    <strong style={{ color: "#fff" }}>Tiempo Estimado:</strong> {routeData.tiempoEstimadoHoras ? formatRouteTime(routeData.tiempoEstimadoHoras) : "--"}
                  </p>
                  
                  {(!formData.refineriaOrigen || !formData.estacionDestino) && (
                    <span style={{ fontSize: "12px", color: "#94a3b8", marginTop: "12px", fontStyle: "italic" }}>
                      Seleccione refinería de origen y estación de destino para calcular la ruta.
                    </span>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="grid-2 remito-cot-centered">
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
            <strong>Información:</strong> Una vez creado el envío, se generará automáticamente un número de seguimiento único (tracking ID). El estado inicial será "PENDIENTE" y será creado por el usuario: <strong>{user?.nombre || "operario-web"} {user?.apellido || ""}</strong>
          </div>
        </section>

        {error && <div className="error-alert">❌ {error}</div>}
        {success && <div className="success-alert">✅ {success}</div>}

        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={() => navigate("/dashboard")} disabled={loading}>Cancelar</button>
          <button type="submit" className="btn-submit" disabled={loading || isRouteLoading}>{loading ? "Procesando..." : "Crear Envío"}</button>
        </div>
      </form>
    </div>
  );
}