import { data, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "../styles/jefeEstacionDashboard.css";
import "../styles/statusBadge.css";
import StatusBadge from "@/components/StatusBadge";
import { envios } from '@/api'; 


export default function JefeEstacionDashboard({ user }) {
  const navigate = useNavigate();
  const { t } = useTranslation("common");

  const [loading, setLoading] = useState(true);
  const [shipments, setShipments] = useState([]);
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [litros, setLitros] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [selectedShipment, setSelectedShipment] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const fetchData = async () => {
        try {
          const response = await envios.getAll();
          console.log("Datos obtenidos de la API:", response);

          // 🔽 Filtrar por estación destino = lugar operativo del usuario
          const filtrados = response.filter(envio => 
            envio.estacionDestino === localStorage.getItem("lugarOperativo")
          );

          setShipments(filtrados);
        } catch (error) {
          console.error("Error al obtener envíos:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }, 1000);

    return () => clearTimeout(timer);
  }, [user]);

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

  const confirmarEntregaJefe = (id, payload) => {
            const fetchConfirmar = async () => {
                try {
                    await envios.confirmarEntregaJefe(id, payload);
                    console.log(`Entrega confirmada con ID: ${id}`);

                    // 🔄 REFRESCAR DATOS (sin recargar página)
                    window.location.reload();

                } catch (error) {
                    console.error(`Error al confirmar entrega con ID: ${id}`, error);
                }
            };

            fetchConfirmar();
        
    };

  const filteredShipments = shipments.filter((shipment) => {
    const searchText = (search || "").toLowerCase();

    const fields = [
      shipment.plantaDespachoNombre,
      shipment.estacionDestinoNombre,
      shipment.transportistaNombre,
    ];

    const matchesSearch =
      String(shipment.trackingId).includes(searchText) ||
        fields.some(field =>
            (field || "").toLowerCase().includes(searchText)
          );
      return shipment.confirmado && matchesSearch;
  });

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
        <h2>{t("common.loading")}</h2>
      </div>
    );
  }

  return (
    <div className="hytrac-layout">
      {/* TOPBAR */}

      <main className="dashboard-content">
        {/* HEADER */}
        <section className="dashboard-header">
          <div>
            <h1>{t("stationDashboard.title")}</h1>
            <p>
              {t("stationDashboard.subtitle")}
            </p>
          </div>
        </section>

        {/* TABLE */}
        <section className="table-card">
          <div className="table-top">
            <div>
              <h2>{t("stationDashboard.pendingHistory")}</h2>
              <span>{t("dashboard.ordersFound", { count: filteredShipments.length })}</span>
            </div>

            <div className="table-actions">
              <input
                type="text"
                placeholder={t("dashboard.searchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>{t("table.id")}</th>
                <th>{t("table.route")}</th>
                <th>{t("table.status")}</th>
                <th>{t("table.driver")}</th>
                <th>{t("table.createdAt")}</th>
                <th>{t("stationDashboard.actions")}</th>
              </tr>
            </thead>

            <tbody>
              {/* aca tengo que filtrar solo los envios pendientes */}
              {filteredShipments.map((shipment) => (
                <tr key={shipment.id}>
                      <td className="tracking" data-label={t("table.id")}>{shipment.trackingId}</td>
                  <td data-label={t("table.route")}>
                    <strong>{shipment.plantaDespacho} - {shipment.estacionDestino}</strong>
                  </td>
                  <td data-label={t("table.status")}>
                    <StatusBadge estado={shipment.estado} />
                  </td>
                  <td data-label={t("table.driver")}>{shipment.transportistaNombre} {shipment.transportistaApellido}</td>
                  <td data-label={t("table.createdAt")}>{formatearFecha(shipment.fechaCreacion)}</td>

                  {/* aca tengo que poner los 3 botones(el ojo tiene que seguir mostrando el detalle) */}
                 <td data-label={t("stationDashboard.actions")}>
                  <div className="actions-table">

                    {/* 👁️ VER DETALLE */}
                    <button
                      className="confirmar-detalles"
                      onClick={() => navigate(`/ordenes/${shipment.id}`)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="22"
                        viewBox="0 0 24 24"
                        width="22"
                        fill="currentColor"
                      >
                        <path d="M12 6c-4.79 0-8.73 3.11-10 6 1.27 2.89 5.21 6 10 6s8.73-3.11 10-6c-1.27-2.89-5.21-6-10-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>
                        <circle cx="12" cy="12" r="2.5"/>
                      </svg>
                    </button>

                    {shipment.estado?.toLowerCase() === "pendiente de confirmacion de entrega" &&
                      (shipment.litrosEntregados === null || shipment.litrosEntregados === "") && (
                        <>
                          {/* ✅ CONFIRMAR */}
                          <button
                            className="confirmar-envio"
                            onClick={() => {
                              setSelectedShipment(shipment);
                              setShowModal(true);
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                             
                              <rect x="2" y="5" width="20" height="15" rx="3" fill="currentColor" opacity="0.15"/>                             
                              <rect x="2" y="5" width="20" height="15" rx="3" stroke="currentColor" stroke-width="2"/>                                
                              <path d="M2 10h20" stroke="currentColor" stroke-width="2"/>                           
                              <path d="M8 14l3 3 5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                              
                            </svg>
                          </button>
                        </>
                      )}

                  </div>
                </td>

                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
      {showModal && (
         <div className="modal-overlay">
        <div className="modal modal-confirmar-entrega">

            {/* Header */}
            <div className="modal-confirmar-header">
                <div className="modal-confirmar-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                        <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                </div>
                <div>
                    <p className="modal-confirmar-title">{t("stationDashboard.confirmDelivery")}</p>
                    <p className="modal-confirmar-subtitle">{t("stationDashboard.confirmDeliverySubtitle")}</p> 
                </div>
            </div>

            {/* Info del envío */}
            {selectedShipment && (
                <div className="modal-confirmar-envio-info">
                    <div>
                        <span>{t("table.id")}</span>
                        <strong>{selectedShipment.trackingId}</strong>
                    </div>
                    <div>
                        <span>{t("table.route")}</span>
                        <strong>{selectedShipment.plantaDespacho} → {selectedShipment.estacionDestino}</strong>
                    </div>
                </div>
            )}

            {/* Litros */}
            <div className="modal-confirmar-field">
                <label htmlFor="litros-input">
                    {t("stationDashboard.deliveredLiters")}
                </label>
                <div className="litros-input-wrapper">
                    <input
                        id="litros-input"
                        type="number"
                        min="0"
                        placeholder="0"
                        value={litros}
                        onChange={(e) => setLitros(e.target.value)}
                    />
                  <span className="litros-suffix">L</span>
                </div>
                  <p className={`litros-hint ${litros > 0 ? "litros-hint--valid" : ""}`}>
                    {litros > 0
                      ? t("stationDashboard.litersToRegister", { count: Number(litros).toLocaleString("es-AR") })
                      : t("stationDashboard.litersHint")}
                  </p> 
            </div>

            {/* Observaciones */}
            <div className="modal-confirmar-field">
                <label htmlFor="obs-input">
                    {t("stationDashboard.observations")}
                </label>
                <textarea
                    id="obs-input"
                    rows={3}
                    placeholder={t("stationDashboard.observationsPlaceholder")}
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                />
            </div>

            <div className="modal-buttons">
              <button
                    className="cancelar"
                    onClick={() => {
                        setShowModal(false);
                        setLitros("");
                        setObservaciones("");
                    }}
                >
                    {t("buttons.cancel")}
                </button>
                <button
                    className="confirmar confirmar--success"
                    disabled={!litros || Number(litros) <= 0}
                    onClick={async () => {
                        try {
                            await confirmarEntregaJefe(selectedShipment.id, {
                                litrosEntregados: Number(litros),
                                observaciones,
                            });
                            setLitros("");
                            setObservaciones("");
                            setShowModal(false);
                        } catch (error) {
                            console.error("Error al confirmar entrega:", error);
                        }
                    }}
                >
                    ✓ {t("buttons.confirm")}
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
