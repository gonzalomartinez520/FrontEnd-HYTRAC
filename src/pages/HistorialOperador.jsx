import { useNavigate } from "react-router-dom";
import { useState, useEffect, Fragment } from "react";
import "../styles/historialOperador.css";
import "../styles/statusBadge.css";
import StatusBadge from "@/components/StatusBadge";
import { envios } from '@/api';
import { datos } from '@/api';
import RouteMap from "../components/RouteMap";

export default function HistorialOperador( { user } ) {
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

    const [plantasTotales, setPlantasTotales] = useState([]);
    const [estacionesTotales, setEstacionesTotales] = useState([]);

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
    // Logística
    provinciaOrigen: null,
    localidadOrigen: null,
    refineriaOrigen: null,
    provinciaDestino: null,
    localidadDestino: null,
    estacionDestino: null,
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [shipments, setShipments] = useState([]);
    const [search, setSearch] = useState("");  //Ver si le agregamos un buscador al historial o solo sera con filtro o automaticamente poner los mas nuevos primeros.
    const [expandedId, setExpandedId] = useState(null); 

    const [showModal, setShowModal] = useState(false);
    const [selectedShipment, setSelectedShipment] = useState(null);

    useEffect(() => {
      const timer = setTimeout(() => {
        const fetchData = async () => {
          try {
            const response = await envios.getAll();  //Cambiar o agregarle a este que me pase la ID del Operador que hizo el envio, asi lo filtro con eso en la tabla.
            console.log("Datos obtenidos de la API:", response);
            setShipments(response);
          } catch (error) {
            console.error("Error al obtener envíos:", error);
          } finally {
            setLoading(false);
          }
        };

        fetchData();
      }, 1000);

      return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
      const fetchData = async () => {
        try {
          const [
            combustiblesData,
            provinciasData,
            camionesData,
            acopladosData,
            transportistasData,
            plantasData,
            estacionesData,
          ] = await Promise.all([
            datos.getCombustibles(),
            datos.getProvincias(),
            datos.getCamiones(),
            datos.getAcoplados(),
            datos.getTransportistas(),
            datos.getPlantas(),
            datos.getEstaciones(),
          ]);

          setCombustibles(combustiblesData);
          setProvincias(provinciasData);
          setCamiones(camionesData);
          setAcoplados(acopladosData);
          setTransportistas(transportistasData);
          setPlantasTotales(plantasData);
          setEstacionesTotales(estacionesData);

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

  useEffect(() => {
    const origenId = formData.refineriaOrigen?.id;
    const destinoId = formData.estacionDestino?.id;

    if (!origenId || !destinoId) return;

    // 🔥 Si ya es la misma ruta, no recalcular
    if (routeData.rutaId && selectedShipment?.rutaId === routeData.rutaId) {
      return;
    }

    const fetchRoute = async () => {
      try {
        setIsRouteLoading(true);

        const data = await datos.calculateRuta(origenId, destinoId);

        setRouteData({
          rutaId: data.rutaId,
          geometria: data.geometria,
          distanciaKm: data.distanciaKm,
          tiempoEstimadoHoras: data.tiempoEstimadoHoras
        });

      } catch (err) {
        console.error(err);
      } finally {
        setIsRouteLoading(false);
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
    const { name, value, type } = e.target;
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

    useEffect(() => {
      if (showModal) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "auto";
      }

      return () => {
        document.body.style.overflow = "auto";
      };
    }, [showModal]);

    const toggleExpand = (id) => {
        setExpandedId((prev) => (prev === id ? null : id));
    };

    const formatearFecha = (fechaString) => {
        const fecha = new Date(fechaString);

        return fecha.toLocaleString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    };

    const filteredShipments = shipments.filter((shipment) => {
        const searchText = (search || "").toLowerCase();
        const legajoText = (localStorage.getItem("legajo") || "").toLowerCase();

        const fields = [
            shipment.plantaDespachoNombre,
            shipment.estacionDestinoNombre,
            shipment.transportistaNombre,
        ];

        // 🔎 Coincidencia del buscador
        const matchesSearch =
            !searchText || // si está vacío, no filtra
            String(shipment.trackingId).includes(searchText) ||
            fields.some(field =>
                (field || "").toLowerCase().includes(searchText)
            );

        // 👷 Coincidencia del legajo
        const matchesLegajo =
            !legajoText || // si está vacío, no filtra
            String(shipment.operadorLegajo || "")
                .toLowerCase()
                .includes(legajoText);

        // ✅ Ambos deben cumplirse
        return matchesSearch && matchesLegajo;
    });


    if (loading) {
        return (
        <div className="historial-operador-loading-screen">
            <div className="historial-operador-loader"></div>
            <h2>Cargando historial de órdenes...</h2>
        </div>
        );
    }

    return (
    <div className="historial-operador-layout">
      {/* TOPBAR */}

      <main className="historial-operador-content">
        {/* HEADER */}
        <section className="historial-operador-header">
          <div>
            <h1>Historial de órdenes de {user?.nombre} {user?.apellido}</h1>
            <p>
              Aquí podrá visualizar todas tus órdenes creadas.
              Si es necesario, se podra editar una orden antes de su confirmación.
            </p>
          </div>
        </section>

        {/* TABLE */}
        <section className="historial-operador-card">
          <div className="historial-operador-top">
            <div>
                <h2>Historial de Órdenes Recientes</h2>
              <span>Órdenes encontradas: {filteredShipments.length}</span>
            </div>

            <div className="historial-operador-buscador">
              <input
                type="text"
                placeholder="🔎 Busqueda por ID, ruta o transportista..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <button>⏷</button>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Ruta Designada</th>
                <th>Combustible</th>
                <th>Estado</th>  
                <th>Chofer</th>
                <th>Fecha Creación</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {filteredShipments.map((shipment) => (
                <Fragment key={shipment.id}>
                <tr key={shipment.id}>
                      <td className="tracking" data-label="ID">{shipment.trackingId}</td>
                  <td data-label="Ruta Designada">
                    <strong>{shipment.plantaDespacho} → {shipment.estacionDestino}</strong>
                  </td>
                  <td data-label="Combustible">
                    <strong>{shipment.combustible}</strong>
                  </td>
                  <td data-label="Estado"> 
                    {shipment.confirmado ? (
                      <StatusBadge estado="CONFIRMADO" />
                    ) : shipment.motivoRechazo?.length > 0 ? (
                      <StatusBadge estado="RECHAZADO" />
                    ) : (
                      <StatusBadge estado="PENDIENTE A CONFIRMAR" />
                    )}
                  </td>
                  <td data-label="Chofer">{shipment.transportistaNombre} {shipment.transportistaApellido}</td>
                  <td data-label="Fecha Creación">{formatearFecha(shipment.fechaCreacion)}</td>
                  <td>
                    <div className="actions-historial-operador">
                        <button 
                        className="historial-operador-detalles"
                        onClick={() => toggleExpand(shipment.id)}
                        >
                        
                        {expandedId === shipment.id ? (
                            <svg
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
                        </svg>
                        ) : (
                        // OJO ABIERTO
                        <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="24"
                        viewBox="0 0 24 24"
                        width="24"
                        fill="currentColor"
                        >
                            <path d="M12 6c-4.79 0-8.73 3.11-10 6 1.27 2.89 5.21 6 10 6s8.73-3.11 10-6c-1.27-2.89-5.21-6-10-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>
                            <circle cx="12" cy="12" r="2.5"/>
                        </svg>
                        )}
                        </button>

                        {shipment.confirmado === true ? (
                          null
                        ) : (
                          <button 
                            className="editar-envio"
                            onClick={ async () => {
                            setSelectedShipment(shipment);

                            const camionEdicionSeleccionado = camiones.find((c) => c.patente === shipment.camionPatente);
                            const acopladoEdicionSeleccionado = acoplados.find((a) => a.patente === shipment.acopladoPatente);
                            const transportistaEdicionSeleccionado = transportistas.find((t) => t.legajo === shipment.transportistaLegajo); 
                            const combustibleEdicionSeleccionado = combustibles.find((c) => c.nombre === shipment.combustible);


                            const plantaDespachoEdicionSeleccionada = plantasTotales.find((p) => p.nombre === shipment.plantaDespacho);
                            const estacionDestinoEdicionSeleccionada = estacionesTotales.find((p) => p.nombre === shipment.estacionDestino);
                      
                          

                            setFormData(prev => ({
                              ...prev,
                                // Vehículo
                                camion: camionEdicionSeleccionado || null,
                                patenteCamion: camionEdicionSeleccionado ? camionEdicionSeleccionado.patente : "",
                                marcaCamion: camionEdicionSeleccionado ? camionEdicionSeleccionado.marca : "",
                                modeloCamion: camionEdicionSeleccionado ? camionEdicionSeleccionado.modelo : "",
                                pesoMaximo: camionEdicionSeleccionado ? camionEdicionSeleccionado.peso_maximo_carga : "",
                                acoplado: acopladoEdicionSeleccionado || null,
                                patenteAcoplado: acopladoEdicionSeleccionado ? acopladoEdicionSeleccionado.patente : "",
                                capacidad: acopladoEdicionSeleccionado ? acopladoEdicionSeleccionado.capacidadMaximaLitros : "",
                                // Chofer
                                transportista: transportistaEdicionSeleccionado || null,
                                choferAsignado: transportistaEdicionSeleccionado ? transportistaEdicionSeleccionado.nombre : "",
                                cuitTransportista: transportistaEdicionSeleccionado ? transportistaEdicionSeleccionado.cuit : "",
                                tipoVinculoTransportista: transportistaEdicionSeleccionado ? transportistaEdicionSeleccionado.tipoVinculo : "",
                                // Carga
                                combustible: combustibleEdicionSeleccionado || null,
                                tipoCombustible: combustibleEdicionSeleccionado ? combustibleEdicionSeleccionado.id : "",
                                codigoOnu: combustibleEdicionSeleccionado ? combustibleEdicionSeleccionado.numeroOnu : "",
                                temperatura: combustibleEdicionSeleccionado ? combustibleEdicionSeleccionado.temperaturaReferencia: "",
                                densidad: combustibleEdicionSeleccionado ? combustibleEdicionSeleccionado.densidad : "",
                                riesgo: combustibleEdicionSeleccionado ? combustibleEdicionSeleccionado.claseRiesgo : "",
                                volumenACargar: shipment.litrosCargados || "",
                                // Logística
                                provinciaOrigen: plantaDespachoEdicionSeleccionada?.provinciaId || null,
                                localidadOrigen: plantaDespachoEdicionSeleccionada?.localidadId || null,
                                refineriaOrigen: plantaDespachoEdicionSeleccionada || null,
                                provinciaDestino: estacionDestinoEdicionSeleccionada?.provinciaId || null,
                                localidadDestino: estacionDestinoEdicionSeleccionada?.localidadId || null,
                                estacionDestino: estacionDestinoEdicionSeleccionada || null,
                            }));

                            setRouteData({
                              rutaId: shipment.rutaId || null,
                              geometria: shipment.geometria || null,
                              distanciaKm: shipment.distanciaKm || null,
                              tiempoEstimadoHoras: shipment.tiempoEstimadoHoras || null
                            });
                            setShowModal(true);
                          }}
                          >
                            <svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              width="18" 
                              height="18" 
                              viewBox="0 0 24 24" 
                              fill="none" 
                              stroke="#f97316"
                              strokeWidth="2"
                            >
                              <path d="M12 20h9"/>
                              <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
                            </svg>
                        </button>
                        )}
                    </div>
                  </td>
                </tr>
                {expandedId === shipment.id && (
                <tr className="fila-expandida">
                    <td colSpan="7">
                        <div className="detalle-envio">
                            <p><strong>ID:</strong> {shipment.id}</p>
                            <p><strong>Transportista:</strong> {shipment.transportista}</p>
                            {/* Agregar mas datos para el historial del Operador*/}
                            {shipment.motivoRechazo && (
                              <div className="motivo-rechazo">
                                <h3>Motivo de rechazo:</h3>
                                <p>{shipment.motivoRechazo}</p>
                              </div>
                            )}
                        </div>
                        </td>
                    </tr>
                )}
            </Fragment>
            ))}
            </tbody>
          </table>
        </section>
      </main>
      {showModal && selectedShipment && (
      <div className="modal-overlay">
        <div className="modal-content">  {/*LUEGO REVISAR QUE DATOS NO SE PODRAN EDITAR */}

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
                <select
                  name="patenteCamion"
                  value={formData.patenteCamion}
                  disabled={loading}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccione una patente</option>

                  {camiones.map((camion) => (
                    <option key={camion.patente} value={camion.patente}>
                      {camion.patente}
                    </option>
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
               <svg className="icon" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 22s7-5.33 7-12A7 7 0 1 0 5 10c0 6.67 7 12 7 12z"
              />
              <circle cx="12" cy="10" r="3" fill="white" />
            </svg>
                Logistica de la orden</h2>
              <p>Ruta designada para la carga.</p>
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
          <div className="map-integration-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "20px", marginBottom: "20px", height: "40vh" }}>
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

        </section>

        <div className="modal-actions">
          <button className="cancelar-edicion" onClick={() => setShowModal(false)}>
            Cancelar
          </button>

          <button
            className="guardar-edicion"
            onClick={async () => {
              try {
                console.log(selectedShipment);
                
                    const payload = {
                    numeroRemito: selectedShipment.numeroRemito,
                    cot: selectedShipment.cot,
                    camionId: formData.camion?.id || null,
                    acopladoId: formData.acoplado?.id || null,
                    transportistaId: formData.transportista?.id || null,
                    plantaDespachoId: formData.refineriaOrigen?.id || null,
                    estacionDestinoId: formData.estacionDestino?.id || null,
                    operadorId: user?.id || null, 
                    combustibleId: formData.combustible?.id || null,
                    rutaId: routeData.rutaId || selectedShipment.rutaId,
                    estadoId: 1, //PENDIENTE
                    fechaCreacion: selectedShipment.fechaCreacion,
                    temperaturaCarga: formData.temperatura ? parseFloat(formData.temperatura) : null,
                    densidadCarga: formData.densidad ? parseFloat(formData.densidad) : null,
                    litrosCargados: formData.volumenACargar ? parseFloat(formData.volumenACargar) : null,
                    fieAdjunta: true,
                    observaciones: "",
                    confirmado: false,
                };
                console.log(payload);
                const envioEditado = await envios.editarEnvio(selectedShipment.id, payload);

                const confirmacion = window.confirm(`Envio con ID: ${selectedShipment.id} editado correctamente`);
                console.log(envioEditado);

                window.location.reload();

                setShowModal(false);
              } catch (error) {
                console.error("Error al editar envío:", error);
                console.log("DATA:", error.response?.data);
                console.log("STATUS:", error.response?.status);
              }
            }}
          >
            Guardar
          </button>
      </div>
        </div>
      </div>
    )}
    </div>
  );
}