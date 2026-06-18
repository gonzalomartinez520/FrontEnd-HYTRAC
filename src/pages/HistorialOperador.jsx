import { useNavigate } from "react-router-dom";
import { useState, useEffect, Fragment } from "react";
import { useTranslation } from "react-i18next";
import "../styles/historialOperador.css";
import "../styles/statusBadge.css";
import StatusBadge from "@/components/StatusBadge";
import { envios } from '@/api';
import { datos } from '@/api';
import RouteMap from "../components/RouteMap";

export default function HistorialOperador( { user } ) {
    const navigate = useNavigate();
    const { t: tOperador } = useTranslation("operador");
    const { t: tForm } = useTranslation("form");
    const { t: tCommon } = useTranslation("common");
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

    const [plantasTotales, setPlantasTotales] = useState([]);
    const [estacionesTotales, setEstacionesTotales] = useState([]);

    const [loadingTransportistas, setLoadingTransportistas] = useState(true);
    const [documentos, setDocumentos] = useState({});

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
            plantasData,
            estacionesData,
          ] = await Promise.all([
            datos.getCombustibles(),
            datos.getProvincias(),
            datos.getCamiones(),
            datos.getAcoplados(),
            datos.getPlantas(),
            datos.getEstaciones(),
          ]);

          setCombustibles(combustiblesData);
          setProvincias(provinciasData);
          setCamiones(camionesData);
          setAcoplados(acopladosData);
          setPlantasTotales(plantasData);
          setEstacionesTotales(estacionesData);

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
    if (
      transportistas.length > 0 &&
      selectedShipment?.transportistaLegajo
    ) {
      const encontrado = transportistas.find(
        (t) => t.legajo === selectedShipment.transportistaLegajo
      );

      if (encontrado) {
        setFormData((prev) => ({
          ...prev,
          transportista: encontrado,
          choferAsignado: encontrado.id,
          cuitTransportista: encontrado.cuit,
          tipoVinculoTransportista: encontrado.tipoVinculo,
        }));
      }
    }
  }, [transportistas, selectedShipment]);

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
    if (!decimalHours || isNaN(decimalHours)) return tOperador("historial.incompletePoints");
    const hours = Math.floor(decimalHours);
    const minutes = Math.round((decimalHours - hours) * 60);
    return `${hours}h ${minutes.toString().padStart(2, "0")}m`;
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
    } else if (name === "cantidad") {
        let numero = Number(value);

        if (numero > formData.capacidad) {
          numero = formData.capacidad;
        }

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
            <h2>{tOperador("historial.loading")}</h2>
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
            <h1>{tOperador("historial.title", { nombre: user?.nombre, apellido: user?.apellido })}</h1>
            <p>{tOperador("historial.subtitle")}</p>
          </div>
        </section>

        {/* TABLE */}
        <section className="historial-operador-card">
          <div className="historial-operador-top">
            <div>
                <h2>{tOperador("historial.recentTitle")}</h2>
              <span>{tOperador("historial.ordersFound", { count: filteredShipments.length })}</span>
            </div>

            <div className="historial-operador-buscador">
              <input
                type="text"
                placeholder={tOperador("historial.searchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <button>⏷</button>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>{tCommon("table.id")}</th>
                <th>{tCommon("table.route")}</th>
                <th>{tCommon("table.fuel")}</th>
                <th>{tCommon("table.status")}</th>
                <th>{tCommon("table.driver")}</th>
                <th>{tCommon("table.createdAt")}</th>
                <th>{tOperador("historial.actions")}</th>
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
                        ) : shipment.motivoRechazo?.length > 0 ? (
                          null
                        ) : (
                          <button 
                            className="editar-envio"
                            onClick={ async () => {
                            setSelectedShipment(shipment);

                            const camionEdicionSeleccionado = camiones.find((c) => c.patente === shipment.camionPatente);
                            const acopladoEdicionSeleccionado = acoplados.find((a) => a.patente === shipment.acopladoPatente);
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
                            <p><strong>{tCommon("table.id")}:</strong> {shipment.trackingId}</p>
                            <p><strong>Camion Asignado:</strong> {shipment.camionPatente}</p>
                            <p><strong>Acoplado Asignado:</strong> {shipment.acopladoPatente}</p>
                            <p><strong>Litros Cargados</strong> {shipment.litrosCargados} Lts.</p>
                            <p><strong>COT:</strong> {shipment.cot}</p>
                            <p><strong>Número de Remito</strong> {shipment.numeroRemito}</p>
                            {shipment.motivoRechazo && (
                              <div className="motivo-rechazo">
                                <h3>{tOperador("historial.expanded.rejectionReason")}</h3>
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
                {tForm("newOrder.sections.unitDriver")}</h2>
              <p>{tForm("newOrder.sections.unitDriverDesc")}</p>
            </div>
          </div>
          
          <div className="grid-2">
            <div>
              <div className="form-group">
                <label>{tForm("newOrder.fields.truckPlate")}</label>
                <select
                  name="patenteCamion"
                  value={formData.patenteCamion}
                  disabled={loading}
                  onChange={handleChange}
                  required
                >
                  <option value="">{tForm("newOrder.placeholders.selectTruck")}</option>

                  {camiones.map((camion) => (
                    <option key={camion.patente} value={camion.patente}>
                      {camion.patente}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>{tForm("newOrder.fields.brand")}</label>
                <input type="text" value={formData.marcaCamion} disabled={true} />
              </div>

              <div className="form-group">
                <label>{tForm("newOrder.fields.model")}</label>
                <input type="text" value={formData.modeloCamion} disabled={true} />
              </div>
            </div>

            <div>
              <div className="form-group">
                <label>{tForm("newOrder.fields.trailerPlate")}</label>
                <select name="patenteAcoplado" value={formData.patenteAcoplado} disabled={loading} onChange={handleChange} required>
                  <option value="">{tForm("newOrder.placeholders.selectTruck")}</option>
                  {acoplados.map((acoplado) => (
                    <option key={acoplado.patente} value={acoplado.patente}>{acoplado.patente}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>{tForm("newOrder.fields.capacity")}</label>
                <input type="text" name="capacidad" value={formData.capacidad} disabled={true} />
              </div>

              <div className="form-group">
                <label>{tForm("newOrder.fields.maxWeight")}</label>
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
                  <path d="M7 2h10v2H7zM7 20h10v2H7zM5 4h14v16H5zM5 10h14M5 14h14"/>
                </svg>
                {tForm("newOrder.sections.cargoSpecs")}</h2>
              <p>{tForm("newOrder.sections.cargoSpecsDesc")}</p>
            </div>
          </div>

          <div className="grid-3">
            <div className="form-group">
              <label>{tForm("newOrder.fields.fuelType")}</label>
              <select name="tipoCombustible" value={formData.tipoCombustible} disabled={loading} onChange={handleChange} required>
                <option value="">{tForm("newOrder.placeholders.selectFuel")}</option>
                {combustibles.map((combustible) => (
                  <option key={combustible.id} value={combustible.id}>
                    {combustible.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>{tForm("newOrder.fields.onuCode")}</label>
              <input type="text" name="codigoOnu" value={formData.codigoOnu} required disabled />
            </div>

            <div className="form-group">
              <label>{tForm("newOrder.fields.temperature")}</label>
              <input type="number" name="temperatura" value={formData.temperatura} required disabled />
            </div>

            <div className="form-group">
              <label>{tForm("newOrder.fields.volume")}</label>
              <input type="number" name="volumenACargar" placeholder="30000" min="0" value={formData.volumenACargar} required disabled={loading} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>{tForm("newOrder.fields.density")}</label>
              <input type="number" name="densidad" value={formData.densidad} required disabled />
            </div>

            <div className="form-group">
              <label>{tForm("newOrder.fields.risk")}</label>
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
                {tOperador("historial.logisticsSectionTitle")}</h2>
              <p>{tOperador("historial.logisticsSectionDesc")}</p>
            </div>
          </div>

          <div className="grid-2">
            <div>
              <div className="form-group">
                <label>{tForm("newOrder.fields.originProvince")}</label>
                <select name="provinciaOrigen" value={formData.provinciaOrigen} disabled={loading} onChange={handleChange}>
                  <option value="">{tForm("newOrder.placeholders.selectProvince")}</option>
                  {provincias.map((prov) => (
                    <option key={prov.id} value={prov.id}>{prov.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>{tForm("newOrder.fields.originCity")}</label>
                <select name="localidadOrigen" value={formData.localidadOrigen} disabled={!formData.provinciaOrigen || loading} onChange={handleChange}>
                  <option value="">{tForm("newOrder.placeholders.selectCity")}</option>
                  {localidadesOrigen.map((loc) => (
                    <option key={loc.id} value={loc.id}>{loc.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>{tOperador("historial.originRefinery")}</label>
                <select name="refineriaOrigen" value={formData.refineriaOrigen?.id || ""} disabled={!formData.localidadOrigen || loading} onChange={handleChange}>
                  <option value="">{tForm("newOrder.placeholders.selectLocation")}</option>
                  {plantasOrigen.map((ref) => (
                    <option key={ref.id} value={ref.id}>{ref.nombre}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <div className="form-group">
                <label>{tForm("newOrder.fields.destinationProvince")}</label>
                <select name="provinciaDestino" value={formData.provinciaDestino} disabled={loading} onChange={handleChange}>
                  <option value="">{tForm("newOrder.placeholders.selectProvince")}</option>
                  {provincias.map((prov) => (
                    <option key={prov.id} value={prov.id}>{prov.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>{tForm("newOrder.fields.destinationCity")}</label>
                <select name="localidadDestino" value={formData.localidadDestino} disabled={!formData.provinciaDestino || loading} onChange={handleChange}>
                  <option value="">{tForm("newOrder.placeholders.selectCity")}</option>
                  {localidadesDestino.map((loc) => (
                    <option key={loc.id} value={loc.id}>{loc.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>{tOperador("historial.destinationStation")}</label>
                <select name="estacionDestino" value={formData.estacionDestino?.id || ""} disabled={!formData.localidadDestino || loading} onChange={handleChange}>
                  <option value="">{tForm("newOrder.placeholders.selectLocation")}</option>
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
                    {tForm("newOrder.route.calculating")}
                  </span>
                </div>
              ) : (
                <>
                  <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", color: "#3b82f6", letterSpacing: "0.5px", textTransform: "uppercase" }}>
                    {tForm("newOrder.route.title")}
                  </h3>
                  <p style={{ margin: "6px 0", fontSize: "15px", color: "#cbd5e1" }}>
                    <strong style={{ color: "#fff" }}>{tForm("newOrder.route.distance")}:</strong> {routeData.distanciaKm ? `${Number(routeData.distanciaKm).toFixed(1)} km` : "--"}
                  </p>
                  <p style={{ margin: "6px 0", fontSize: "15px", color: "#cbd5e1" }}>
                    <strong style={{ color: "#fff" }}>{tForm("newOrder.route.time")}:</strong> {routeData.tiempoEstimadoHoras ? formatRouteTime(routeData.tiempoEstimadoHoras) : "--"}
                  </p>

                  {(!formData.refineriaOrigen || !formData.estacionDestino) && (
                    <span style={{ fontSize: "12px", color: "#94a3b8", marginTop: "12px", fontStyle: "italic" }}>
                      {tForm("newOrder.route.incomplete")}
                    </span>
                  )}
                </>
              )}
            </div>
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
                {tForm("newOrder.sections.driver")}
              </h2>
              <p>{tForm("newOrder.sections.driverDesc")}</p>
            </div>
          </div>

          <div className="chofer-full-width">
            <div className="form-group">
              <label>{tForm("newOrder.fields.driver")}</label>
              <select name="choferAsignado" value={formData.choferAsignado} disabled={loadingTransportistas} onChange={handleChange} required>
                <option value="">{tForm("newOrder.placeholders.selectTransport")}</option>
                {transportistas.map((trans) => (
                  <option key={trans.id} value={trans.id}>
                    {trans.nombre} {trans.apellido} 🔸 {trans.probabilidadExito}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>{tForm("newOrder.fields.cuit")}</label>
              <input type="text" value={formData.cuitTransportista} disabled />
            </div>

            <div className="form-group">
              <label>{tForm("newOrder.fields.relationship")}</label>
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

        <div className="modal-actions">
          <button className="cancelar-edicion" onClick={() => setShowModal(false)}>
            {tForm("newOrder.buttons.cancel")}
          </button>

          <button
            className="guardar-edicion"
            onClick={async () => {
              try {
                console.log(selectedShipment);
                
                    const payload = {
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
                    valorMercaderia: calcularValorMercaderia(formData),
                    fieAdjunta: true,
                    observaciones: "",
                    confirmado: false,
                };

                const envioEditado = await envios.editarEnvio(selectedShipment.id, payload);

                const confirmacion = window.confirm(tOperador("historial.messages.editSuccess", { id: selectedShipment.id }));
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
            {tForm("newOrder.buttons.save")}
          </button>
      </div>
        </div>
      </div>
    )}
    </div>
  );
}