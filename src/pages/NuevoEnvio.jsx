import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/nuevoEnvio.css";
import { envios } from '@/api';
import { datos } from '@/api';

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

  const [formData, setFormData] = useState({
    // Vehículo
    camion: null,
    patenteCamion: "",
    marcaCamion: "",
    modeloCamion: "",
    pesoMaximo: "",
    acoplado: null,
    patenteAcoplado: "",
    capacidad: "",
    // Chofer
    transportista: null,
    choferAsignado: "",
    cuitTransportista: "",
    tipoVinculoTransportista: "",
    // Carga
    combustible: null,
    tipoCombustible: null,
    codigoOnu: "",
    temperatura: "",
    densidad: "",
    riesgo: "",
    volumenACargar: "",
    peso: "",
    // Logística
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
      const data = await datos.getPlantas(formData.localidadOrigen);
      setPlantasOrigen(data);
    };
    fetchPlantasOrigen();
  }, [formData.localidadOrigen]);

  useEffect(() => {
    const fetchEstacionesDestino = async () => {
      if (!formData.localidadDestino) return;
      const data = await datos.getEstaciones(formData.localidadDestino);
      setEstacionesDestino(data);
    };
    fetchEstacionesDestino();
  }, [formData.localidadDestino]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "acceptedTerms") {
      setAcceptedTerms(checked);
    } else if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name === "provinciaOrigen") {
      setFormData((prev) => ({
        ...prev,
        provinciaOrigen: Number(value),
        localidadOrigen: null,
        refineriaOrigen: null,
      }));
      setLocalidadesOrigen([]);
      setPlantasOrigen([]);
    } else if (name === "localidadOrigen") {
      setFormData((prev) => ({
        ...prev,
        localidadOrigen: Number(value),
        refineriaOrigen: null,
      }));
      setPlantasOrigen([]);
    } else if (name === "provinciaDestino") {
      setFormData((prev) => ({
        ...prev,
        provinciaDestino: Number(value),
        localidadDestino: null,
        estacionDestino: null,
      }));
      setLocalidadesDestino([]);
      setEstacionesDestino([]);
    } else if (name === "localidadDestino") {
      setFormData((prev) => ({
        ...prev,
        localidadDestino: Number(value),
        estacionDestino: null,
      }));
      setEstacionesDestino([]);
    } else if (name === "refineriaOrigen") {
      setFormData((prev) => ({
        ...prev,
        refineriaOrigen: Number(value),
      }));
    } else if (name === "estacionDestino") {
      setFormData((prev) => ({
        ...prev,
        estacionDestino: Number(value),
      }));
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
    } else if (name === "refineriaOrigen") {
      const refineriaSeleccionada = plantasOrigen.find((p) => p.id === Number(value));
      setFormData((prev) => ({
        ...prev,
        provinciaOrigen: refineriaSeleccionada ? refineriaSeleccionada.provinciaId : null,
        localidadOrigen: refineriaSeleccionada ? refineriaSeleccionada.localidadId : null,
        refineriaOrigen: refineriaSeleccionada,
      }));
    } else if (name === "estacionDestino") {
      const estacionSeleccionada = estacionesDestino.find((e) => e.id === Number(value));
      setFormData((prev) => ({
        ...prev,
        provinciaDestino: estacionSeleccionada ? estacionSeleccionada.provinciaId : null,
        localidadDestino: estacionSeleccionada ? estacionSeleccionada.localidadId : null,
        estacionDestino: estacionSeleccionada,
      }));
    }
      else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    setError("");
  };


/*   const isFutureDate = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    return !Number.isNaN(date.getTime()) && date > new Date();
  };

  const documentStatus = (dateString) => {
    if (!dateString) return "Sin fecha";
    return isFutureDate(dateString) ? "En regla" : "Vencido";
  };

  const booleanStatus = (value) => (value ? "Correcto" : "Incorrecto"); */

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
        numero_remito: formData.remito,
        cot: formData.cot,
        camion_id: formData.camion?.id || null,
        acoplado_id: formData.acoplado?.id || null,
        transportista_id: formData.transportista?.id || null,
        planta_despacho_id: formData.refineriaOrigen?.id || null,
        estacion_destino_id: formData.estacionDestino?.id || null,
        operador_id: user?.id || null,
        combustible_id: formData.combustible?.id || null,
        estado_id: 1, //PENDIENTE
        fecha_creacion: new Date().toISOString(),
        fecha_salida_planta: null,
        fecha_entrega_estimada: null,
        temperatura_carga: formData.temperatura ? parseFloat(formData.temperatura) : null,
        densidad_carga: formData.densidad ? parseFloat(formData.densidad) : null,
        litros_cargados: formData.volumenACargar ? parseFloat(formData.volumenACargar) : null,
        litros_entregados: null,
        fie_adjunta: true,
        observaciones: "",
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

{/*           {formData.tipoVinculoTransportista === "Monotributista" && (
            <section className="transportista-documents">
              <div className="section-title section-title--transportista">
                <span className="step">01B</span>
                <div className="section-text">
                  <h2>
                    <svg className="icon" viewBox="0 0 24 24">
                      <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5zm0 2c-3.33 0-10 1.667-10 5v3h20v-3c0-3.333-6.67-5-10-5z"/>
                    </svg>
                    Documentación del transportista
                  </h2>
                  <p>Verificación de fechas y documentos obligatorios.</p>
                </div>
              </div>

              <div className="grid-3 transportista-documents-grid">
                <div className={`document-card ${documentStatus(formData.licenciaConducir) === "En regla" ? "document-card--green" : "document-card--red"}`}>
                  <div className="document-card__label">Licencia de conducir</div>
                  <div className="document-card__status">{documentStatus(formData.licenciaConducir)}</div>
                </div>

                <div className={`document-card ${documentStatus(formData.examenPsicofisico) === "En regla" ? "document-card--green" : "document-card--red"}`}>
                  <div className="document-card__label">Examen psicofísico</div>
                  <div className="document-card__status">{documentStatus(formData.examenPsicofisico)}</div>
                </div>

                <div className={`document-card ${documentStatus(formData.vtv) === "En regla" ? "document-card--green" : "document-card--red"}`}>
                  <div className="document-card__label">VTV</div>
                  <div className="document-card__status">{documentStatus(formData.vtv)}</div>
                </div>

                <div className={`document-card ${booleanStatus(formData.seguroCargaPeligrosa) === "Correcto" ? "document-card--green" : "document-card--red"}`}>
                  <div className="document-card__label">Seguro carga peligrosa</div>
                  <div className="document-card__status">{booleanStatus(formData.seguroCargaPeligrosa)}</div>
                </div>

                <div className={`document-card ${booleanStatus(formData.art) === "Correcto" ? "document-card--green" : "document-card--red"}`}>
                  <div className="document-card__label">ART</div>
                  <div className="document-card__status">{booleanStatus(formData.art)}</div>
                </div>

                <div className={`document-card ${booleanStatus(formData.certificadoAntecedentesPenales) === "Correcto" ? "document-card--green" : "document-card--red"}`}>
                  <div className="document-card__label">Certificado antecedentes</div>
                  <div className="document-card__status">{booleanStatus(formData.certificadoAntecedentesPenales)}</div>
                </div>
              </div>
            </section>
          )} */}
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
                <select name="refineriaOrigen" value={formData.refineriaOrigen} disabled={!formData.localidadOrigen || loading} onChange={handleChange}>
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
                <select name="estacionDestino" value={formData.estacionDestino} disabled={!formData.localidadDestino || loading} onChange={handleChange}>
                  <option value="">Seleccione una estación</option>
                  {estacionesDestino.map((est) => (
                    <option key={est.id} value={est.id}>{est.nombre}</option>
                  ))}
                </select>
              </div>
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