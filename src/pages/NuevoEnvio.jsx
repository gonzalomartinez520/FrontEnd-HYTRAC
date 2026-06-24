import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/nuevoEnvio.css";
import { envios } from '@/api';
import { datos } from '@/api';
import RouteMap from "../components/RouteMap";

import { useTranslation } from "react-i18next";

export default function NuevoEnvio({ user }) {
  const navigate = useNavigate();
  const { t } = useTranslation("form");
  const { t: tTransportista } = useTranslation("transportista");

  const [combustibles, setCombustibles] = useState([]);
  const [provincias, setProvincias] = useState([]);
  const [localidadesOrigen, setLocalidadesOrigen] = useState([]);
  const [localidadesDestino, setLocalidadesDestino] = useState([]);
  const [camiones, setCamiones] = useState([]);
  const [acoplados, setAcoplados] = useState([]);
  const [transportistas, setTransportistas] = useState([]);
  const [plantasOrigen, setPlantasOrigen] = useState([]);
  const [estacionesDestino, setEstacionesDestino] = useState([]);

  // COT
  const [cotEstado, setCotEstado] = useState("idle"); 
  const [cotNumero, setCotNumero] = useState(null);

  const [documentos, setDocumentos] = useState({});

  const [loading, setLoading] = useState(false);
  const [loadingTransportistas, setLoadingTransportistas] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          combustiblesData,
          provinciasData,
          camionesData,
          acopladosData,
        ] = await Promise.all([
          datos.getCombustibles(),
          datos.getProvincias(),
          datos.getCamiones(),
          datos.getAcoplados(),
        ]);

        setCombustibles(combustiblesData);
        setProvincias(provinciasData);
        setCamiones(camionesData);
        setAcoplados(acopladosData);
      } catch (error) {
        console.error("Error cargando datos:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    // 🔹 Validaciones previas
    if (
      !formData?.combustible ||
      !formData?.volumenACargar ||
      !routeData?.tiempoEstimadoHoras
    ) {
      return; // no ejecuta nada si falta algún dato
    }

    const fetchTransportistas = async () => {
      try {
        const payload = {
          volumenCargaLitros: parseFloat(formData.volumenACargar),
          tiempoEfectivoEstimadoHoras: Math.round(routeData.tiempoEstimadoHoras),
          combustibleId: formData.combustible?.id,
        };

        const response = await datos.seleccionarOptimos(payload);
        console.log(response);

        // 🔹 Guardamos en estado
        setTransportistas(response);
      } catch (error) {
        console.error("Error al obtener transportistas óptimos:", error);
      } finally {
        setLoadingTransportistas(false);
      }
    };

    fetchTransportistas();

    // 🔹 Dependencias
  }, [formData.combustible, formData.volumenACargar, routeData.tiempoEstimadoHoras]);

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

  // Dynamic Route Evaluator Hook using Centralized API Client
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
        
        // --- FIXED: Using Axios client module instead of hardcoded raw fetch ---
        const data = await datos.calculateRuta(origenId, destinoId);
        
        setRouteData({
          rutaId: data.rutaId,
          geometria: data.geometria,
          distanciaKm: data.distanciaKm,
          tiempoEstimadoHoras: data.tiempoEstimadoHoras
        });
      } catch (err) {
        console.error("Routing resolution layer engine crash: ", err);
        // Safely clear out UI metrics on structural API errors
        setRouteData({ rutaId: null, geometria: null, distanciaKm: null, tiempoEstimadoHoras: null });
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


  const simularGeneracionCot = async () => {
    if (cotEstado !== "idle") return;
    setCotEstado("generando");

    await new Promise(resolve => setTimeout(resolve, 2200));

    const año = new Date().getFullYear();
    const random = Math.random().toString(36).substring(2, 10).toUpperCase();
    setCotNumero(`COT-${año}-${random}`);
    setCotEstado("generado");
  };

  const fetchDocumentosTransportista = async (transportistaId) => {
    try {
      if (!transportistaId) return;

      // 🔹 Evitar llamadas repetidas
      if (documentos[transportistaId]) return;

      const docs = await datos.getDocumentos(transportistaId);
      console.log("DOCS:", docs);

      setDocumentos((prev) => ({
        ...prev,
        [transportistaId]: docs.data || docs
      }));

    } catch (error) {
      console.error("Error al obtener documentos:", error);
    }
  };

  const getEstadoDocumento = (fechaVencimiento) => {
    if (!fechaVencimiento) return "vencido";

    const hoy = new Date();
    const vencimiento = new Date(fechaVencimiento);

    // Normalizamos horas para evitar errores de comparación
    hoy.setHours(0, 0, 0, 0);
    vencimiento.setHours(0, 0, 0, 0);

    const diffTime = vencimiento - hoy;
    const diffDias = diffTime / (1000 * 60 * 60 * 24);

    if (diffDias < 0) return "vencido";        // 🔴 ya venció
    if (diffDias <= 30) return "proximo";      // 🟠 vence en menos de 1 mes
    return "vigente";                          // 🟢 al día
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "provinciaOrigen") {
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
    } else if (name === "cantidad") {
        let numero = Number(value);

        if (numero > formData.capacidad) {
          numero = formData.capacidad;
        }

    } else if (name === "tipoCombustible") {
      const combustibleSeleccionado = combustibles.find((combustible) => combustible.id === Number(value));
      setFormData((prev) => ({
        ...prev,
        combustible: combustibleSeleccionado,
        tipoCombustible: combustibleSeleccionado ? combustibleSeleccionado.id : "",
        codigoOnu: combustibleSeleccionado ? combustibleSeleccionado.numeroOnu : "",
        temperatura: combustibleSeleccionado ? combustibleSeleccionado.temperaturaReferencia : "",
        densidad: combustibleSeleccionado ? combustibleSeleccionado.densidad : "",
        riesgo: combustibleSeleccionado ? combustibleSeleccionado.claseRiesgo : "",
      }));
    } else if (name === "choferAsignado") {
      const transportistaSeleccionado = transportistas.find(
        (t) => t.id === Number(value)
      );

      setFormData((prev) => ({
        ...prev,
        transportista: transportistaSeleccionado,
        choferAsignado: transportistaSeleccionado ? transportistaSeleccionado.id : "",
        cuitTransportista: transportistaSeleccionado ? transportistaSeleccionado.cuit : "",
        tipoVinculoTransportista: transportistaSeleccionado ? transportistaSeleccionado.tipoVinculo : "",
      }));

      // 🔥 ACA LLAMÁS A LOS DOCUMENTOS
      if (transportistaSeleccionado) {
        fetchDocumentosTransportista(transportistaSeleccionado.id);
      }
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

  const preciosCombustible = {
    1: 950,
    2: 1050,
    3: 1200
  };

  const calcularValorMercaderia = (formData) => {
    const litros = Number(formData.volumenACargar) || 0;
    const combustibleId = formData.combustible?.id;

    if (!combustibleId || !preciosCombustible[combustibleId]) {
      return 0;
    }

    const precioPorLitro = preciosCombustible[combustibleId];

    return litros * precioPorLitro;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
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
        valorMercaderia: calcularValorMercaderia(formData),
        litrosEntregados: null,
        fieAdjunta: true,
        observaciones: "",
        confirmado: false,
      };

      const newEnvio = await envios.create(payload);
      console.log(newEnvio);
      setSuccess(t("newOrder.messages.success", { id: newEnvio.id }));

      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);

    } catch (err) {
      console.error(err);
      const errorMessage = err?.response?.data?.message || err?.message || t("newOrder.messages.error");
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="nuevo-envio-container">
      <header className="form-header">
        <div>
          <p id="nueva-orden">{t("newOrder.new")}</p>
          <h1>{t("newOrder.title")}</h1>
          <p>{t("newOrder.subtitle")}</p>
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
                  <path d="M3 6h11v8H3zM14 9h3l3 3v2h-6zM7 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm10 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
                </svg>
                {t("newOrder.sections.unitDriver")}
              </h2>
              <p>{t("newOrder.sections.unitDriverDesc")}</p>
            </div>
          </div>


          <div className="grid-2">
            <div>
              <div className="form-group">
                <label>{t("newOrder.fields.truckPlate")}</label>
                <select name="patenteCamion" value={formData.patenteCamion} disabled={loading} onChange={handleChange} required>
                  <option value="">{t("newOrder.placeholders.selectTruck")}</option>
                  {camiones.map((camion) => (
                    <option key={camion.patente} value={camion.patente}>{camion.patente}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>{t("newOrder.fields.brand")}</label>
                <input type="text" value={formData.marcaCamion} disabled={true} />
              </div>

              <div className="form-group">
                <label>{t("newOrder.fields.model")}</label>
                <input type="text" value={formData.modeloCamion} disabled={true} />
              </div>
            </div>

            <div>
              <div className="form-group">
                <label>{t("newOrder.fields.trailerPlate")}</label>
                <select name="patenteAcoplado" value={formData.patenteAcoplado} disabled={loading} onChange={handleChange} required>
                  <option value="">{t("newOrder.placeholders.selectTruck")}</option>
                  {acoplados.map((acoplado) => (
                    <option key={acoplado.patente} value={acoplado.patente}>{acoplado.patente}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>{t("newOrder.fields.capacity")}</label>
                <input type="text" name="capacidad" value={formData.capacidad} disabled={true} />
              </div>

              <div className="form-group">
                <label>{t("newOrder.fields.maxWeight")}</label>
                <input type="number" name="pesoMaximo" value={formData.pesoMaximo} disabled={true} />
              </div>
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
                  <path d="M7 2h10v2H7zM7 20h10v2H7zM5 4h14v16H5zM5 10h14M5 14h14" />
                </svg>
                {t("newOrder.sections.cargoSpecs")}</h2>
              <p>{t("newOrder.sections.cargoSpecsDesc")}</p>
            </div>
          </div>

          <div className="grid-3">
            <div className="form-group">
              <label>{t("newOrder.fields.fuelType")}</label>
              <select name="tipoCombustible" value={formData.tipoCombustible} disabled={loading} onChange={handleChange} required>
                <option value="">{t("newOrder.placeholders.selectFuel")}</option>
                {combustibles.map((combustible) => (
                  <option key={combustible.id} value={combustible.id}>
                    {combustible.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>{t("newOrder.fields.onuCode")}</label>
              <input type="text" name="codigoOnu" value={formData.codigoOnu} required disabled />
            </div>

            <div className="form-group">
              <label>{t("newOrder.fields.temperature")}</label>
              <input type="number" name="temperatura" value={formData.temperatura} required disabled />
            </div>

            <div className="form-group">
              <label>{t("newOrder.fields.volume")}</label>
              <input type="number" name="volumenACargar" placeholder="30000" min="0" value={formData.volumenACargar}  max={formData.capacidad} required disabled={loading} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>{t("newOrder.fields.density")}</label>
              <input type="number" name="densidad" value={formData.densidad} required disabled />
            </div>

            <div className="form-group">
              <label>{t("newOrder.fields.risk")}</label>
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
                  <path d="M6 2h9l5 5v15H6zM15 2v6h6M8 13h8M8 17h8M8 9h4" />
                </svg>
                {t("newOrder.sections.logistics")}</h2>
              <p>{t("newOrder.sections.logisticsDesc")}</p>
            </div>
          </div>

          <div className="grid-2">
            <div>
              <div className="form-group">
                <label>{t("newOrder.fields.originProvince")}</label>
                <select name="provinciaOrigen" value={formData.provinciaOrigen} disabled={loading} onChange={handleChange}>
                  <option value=""> {t("newOrder.placeholders.selectProvince")} </option>
                  {provincias.map((prov) => (
                    <option key={prov.id} value={prov.id}>{prov.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>{t("newOrder.fields.originCity")}</label>
                <select name="localidadOrigen" value={formData.localidadOrigen} disabled={!formData.provinciaOrigen || loading} onChange={handleChange}>
                  <option value=""> {t("newOrder.placeholders.selectCity")} </option>
                  {localidadesOrigen.map((loc) => (
                    <option key={loc.id} value={loc.id}>{loc.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>{t("newOrder.fields.originPlant")}</label>
                <select name="refineriaOrigen" value={formData.refineriaOrigen?.id || ""} disabled={!formData.localidadOrigen || loading} onChange={handleChange}>
                  <option value=""> {t("newOrder.placeholders.selectLocation")} </option>
                  {plantasOrigen.map((ref) => (
                    <option key={ref.id} value={ref.id}>{ref.nombre}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <div className="form-group">
                <label>{t("newOrder.fields.destinationProvince")}</label>
                <select name="provinciaDestino" value={formData.provinciaDestino} disabled={loading} onChange={handleChange}>
                  <option value=""> {t("newOrder.placeholders.selectProvince")} </option>
                  {provincias.map((prov) => (
                    <option key={prov.id} value={prov.id}>{prov.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>{t("newOrder.fields.destinationCity")}</label>
                <select name="localidadDestino" value={formData.localidadDestino} disabled={!formData.provinciaDestino || loading} onChange={handleChange}>
                  <option value=""> {t("newOrder.placeholders.selectCity")} </option>
                  {localidadesDestino.map((loc) => (
                    <option key={loc.id} value={loc.id}>{loc.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>{t("newOrder.fields.destinationStation")}</label>
                <select name="estacionDestino" value={formData.estacionDestino?.id || ""} disabled={!formData.localidadDestino || loading} onChange={handleChange}>
                  <option value=""> {t("newOrder.placeholders.selectLocation")} </option>
                  {estacionesDestino.map((est) => (
                    <option key={est.id} value={est.id}>{est.nombre}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* PERSISTENT MAP GRID BLOCK WITH UPDATED LOADING STATE */}
          <div className="map-integration-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "20px", marginBottom: "20px", height: "40vh"}}>
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

            <div className="route-telemetry-panel">
                {isRouteLoading ? (
                            <div className="route-telemetry-loading">
                              <div className="route-telemetry-spinner" />
                              <span className="route-telemetry-loading-text">
                                {t("newOrder.route.calculating")}
                              </span>
                            </div>
                          ) : (
                            <>
                              <h3 className="route-telemetry-title">
                                {t("newOrder.route.title")}
                              </h3>
                              <p className="route-telemetry-row">
                                <strong>{t("newOrder.route.distance")}:</strong>{" "}
                                {routeData.distanciaKm ? `${Number(routeData.distanciaKm).toFixed(1)} km` : "--"}
                              </p>
                              <p className="route-telemetry-row">
                                <strong>{t("newOrder.route.time")}:</strong>{" "}
                                {routeData.tiempoEstimadoHoras ? formatRouteTime(routeData.tiempoEstimadoHoras) : "--"}
                              </p>

                              {(!formData.refineriaOrigen || !formData.estacionDestino) && (
                                <span className="route-telemetry-warning">
                                  {t("newOrder.route.incomplete")}
                                </span>
                              )}
                            </>
                          )}
              </div>
          </div>
          {/* COT Simulado */}
          <div className="cot-block">
              <div className="cot-left">
                  <div className="cot-info">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                          <polyline points="14 2 14 8 20 8"/>
                          <line x1="16" y1="13" x2="8" y2="13"/>
                          <line x1="16" y1="17" x2="8" y2="17"/>
                          <polyline points="10 9 9 9 8 9"/>
                      </svg>
                      <div>
                          <p className="cot-label">Código de Operación de Traslado</p>
                          <p className="cot-sublabel">Requerido por ARBA — Ley 11.904 </p>
                      </div>
                  </div>

                  {cotEstado === "generado" && cotNumero && (
                      <div className="cot-numero">
                          <span className="cot-numero-label">COT Generado</span>
                          <span className="cot-numero-value">{cotNumero}</span>
                      </div>
                  )}
              </div>

              <button
                  type="button"
                  className={`cot-btn cot-btn--${cotEstado}`}
                  onClick={simularGeneracionCot}
                  disabled={cotEstado !== "idle" || !formData.refineriaOrigen || !formData.estacionDestino}
              >
                  {cotEstado === "idle" && (
                      <>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="13 17 18 12 13 7"/>
                              <polyline points="6 17 11 12 6 7"/>
                          </svg>
                          Generar COT
                      </>
                  )}
                  {cotEstado === "generando" && (
                      <>
                          <span className="cot-spinner" />
                          Generando COT...
                      </>
                  )}
                  {cotEstado === "generado" && (
                      <>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"/>
                          </svg>
                          COT Generado
                      </>
                  )}
              </button>
          </div>
        </section>

        {/* 04 Datos del chofer*/}
        <section className="form-section">
          <div className="section-title">
            <span className="step">04</span>
            <div className="section-text">
              <h2>
                <svg
                  className="icon"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="orange"
                >
                  <path d="M12 12c2.76 0 5-2.24 5-5S14.76 2 12 2 7 4.24 7 7s2.24 5 5 5zm0 2c-3.33 0-10 1.67-10 5v3h20v-3c0-3.33-6.67-5-10-5z"/>
                </svg>
                {t("newOrder.sections.driver")}
              </h2>
              <p>{t("newOrder.sections.driverDesc")}</p>
            </div>
          </div>

          <div className="chofer-full-width">
            <div className="form-group">
              <label>{t("newOrder.fields.driver")}</label>
              <select name="choferAsignado" value={formData.choferAsignado} disabled={loadingTransportistas} onChange={handleChange} required>
                <option value="">{t("newOrder.placeholders.selectTransport")}</option>
                {transportistas.map((trans) => (
                  <option key={trans.id} value={trans.id}>
                    {trans.nombre} {trans.apellido} 🔸 {" "}
                    {trans.probabilidadExito === "-1%" 
                      ? t("newOrder.fields.novato")
                      : trans.probabilidadExito}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>{t("newOrder.fields.cuit")}</label>
              <input type="text" value={formData.cuitTransportista} disabled />
            </div>

            <div className="form-group">
              <label>{t("newOrder.fields.relationship")}</label>
              <input type="text" value={formData.tipoVinculoTransportista} disabled />
            </div>

            {formData.transportista?.id && (
              <div className="documentos-wrapper">
                {documentos[formData.transportista.id]?.length > 0 ? (
                  <div className="documentos-container">
                    {documentos[formData.transportista.id].map((doc, index) => {
                      const estado = getEstadoDocumento(doc.fechaVencimiento);

                      return (
                        <div key={index} className={`doc-card ${estado}`}>
                          <p>
                            <strong>{tTransportista("details.document")}:</strong>{" "}
                            {doc.tipoDocumentoNombre}
                          </p>
                          <p>
                            <strong>N°:</strong> {doc.nroDocumento}
                          </p>
                          <p>
                            <strong>{tTransportista("details.expiration")}:</strong>{" "}
                            {doc.fechaVencimiento}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p style={{ marginTop: "10px" }}>
                    {tTransportista("details.noDocuments")}
                  </p>
                )}
              </div>
            )}
          </div>
        </section>

        {/* 04 - Finalizar */}
        <section className="form-section">
          <div className="info-alert">
            <strong>Información:</strong> {t("newOrder.info")} <strong>{user?.nombre || "operario-web"} {user?.apellido || ""}</strong>
          </div>
        </section>

        {error && <div className="error-alert">❌ {error}</div>}
        {success && <div className="success-alert">✅ {success}</div>}

        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={() => navigate("/dashboard")} disabled={loading}>{t("newOrder.buttons.cancel")}</button>
          <button type="submit" className="btn-submit" disabled={loading || isRouteLoading}>{loading ? t("newOrder.buttons.loading") : t("newOrder.buttons.submit")}</button>
        </div>
      </form>
    </div>
  );
}