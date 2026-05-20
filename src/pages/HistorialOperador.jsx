import { useNavigate } from "react-router-dom";
import { useState, useEffect, Fragment } from "react";
import "../styles/historialOperador.css";
import "../styles/statusBadge.css";
import StatusBadge from "@/components/StatusBadge";
import { envios } from '@/api';

export default function HistorialOperador( { user } ) {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [shipments, setShipments] = useState([]);
    const [search, setSearch] = useState("");  //Ver si le agregamos un buscador al historial o solo sera con filtro o automaticamente poner los mas nuevos primeros.
    const [expandedId, setExpandedId] = useState(null); 

    const [legajoOperador, setlegajoOperador] = useState("");

    useEffect(() => {
      const timer = setTimeout(() => {
        const fetchData = async () => {
          try {
            const response = await envios.getAll();  //Cambiar o agregarle a este que me pase la ID del Operador que hizo el envio, asi lo filtro con eso en la tabla.
            console.log("Datos obtenidos de la API:", response);
            setShipments(response);
            setlegajoOperador(localStorage.getItem("legajo"));
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
        const legajoText = (legajoOperador || "").toLowerCase();

        const fields = [
            shipment.plantaDespachoNombre,
            shipment.estacionDestinoNombre,
            shipment.transportistaNombre,
        ];

        // 🔎 Coincidencia del buscador
        const matchesSearch =
            !searchText || // si está vacío, no filtra
            String(shipment.id).includes(searchText) ||
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
                <th>Origen / Refinería</th>
                <th>Destino / Estación</th>
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
                      <td className="tracking" data-label="ID">{shipment.id}</td>
                  <td data-label="Origen">
                    <strong>{shipment.plantaDespacho}</strong>
                  </td>
                  <td data-label="Destino">
                    <strong>{shipment.estacionDestino}</strong>
                  </td>
                  <td data-labe="Estado">  {/*CAMBIARLO POR EL OTRO ESTADO QUE ES PARA CONFIRMACIONES */}
                    {shipment.confirmado === true ? (
                        <StatusBadge estado="CONFIRMADO"></StatusBadge>
                    ) : (
                        <StatusBadge estado="PENDIENTE A CONFIRMAR"></StatusBadge>
                    )}
{/*                     {shipment.motivoRechazo.length === 0 ? (
                        null
                    ) : (
                        <StatusBadge estado="RECHAZADO"></StatusBadge>
                    )} */}
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
                        <button className="ver-motivo-rechazo" onClick={() => toggleExpand(shipment.id)}>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                height="22"
                                viewBox="0 0 24 24"
                                width="22"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                            <line x1="6" y1="6" x2="18" y2="18" />
                            <line x1="18" y1="6" x2="6" y2="18" />
                            </svg>
                        </button>        
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
    </div>
  );
}