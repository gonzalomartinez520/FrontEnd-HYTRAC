import { useNavigate } from "react-router-dom"; 
import { useState, useEffect } from "react";
import "../styles/confirmaciones.css";
import { envios, datos } from '@/api';

export default function Confirmaciones({ user }) {
  const navigate = useNavigate();

  const [enviosSupervisor, setEnviosSupervisor] = useState([]);

  // 🔢 estados
  const [noConfirmados, setNoConfirmados] = useState(0);
  const [pendienteInicio, setPendienteInicio] = useState(0);
  const [pendienteEntrega, setPendienteEntrega] = useState(0);
  const [incidencias, setIncidencias] = useState(0);

  // 📦 traer TODO en paralelo
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [enviosRes, incidenciasRes] = await Promise.all([
          envios.getAll(),
          datos.getIncidencias() // 👈 endpoint incidencias
        ]);

        setEnviosSupervisor(enviosRes);

        // 🔴 filtrar incidencias activas (ajustá según tu modelo)
        const incidenciasActivas = incidenciasRes.filter(
          (i) => !i.resuelto   // o i.activa === true
        );

        setIncidencias(incidenciasActivas.length);

      } catch (error) {
        console.error("Error cargando datos:", error);
      }
    };

    fetchData();
  }, []);

  // 🧠 filtros
  const isNoConfirmado = (shipment) => !shipment.confirmado && !shipment.motivoRechazo?.length > 0;

  const isPendienteInicio = (shipment) =>
    (shipment.estado || "")
      .toLowerCase()
      .trim() === "pendiente de inicio de viaje";

  const isPendienteEntrega = (shipment) =>
    (shipment.estado || "")
      .toLowerCase()
      .trim() === "pendiente de confirmacion de entrega";

  // 📊 calcular contadores envíos
  useEffect(() => {
    if (!enviosSupervisor.length) return;

    let noConf = 0;
    let inicio = 0;
    let entrega = 0;

    // 🔥 más eficiente que 3 filters
    enviosSupervisor.forEach((s) => {
      if (isNoConfirmado(s)) noConf++;
      if (isPendienteInicio(s)) inicio++;
      if (isPendienteEntrega(s)) entrega++;
    });

    setNoConfirmados(noConf);
    setPendienteInicio(inicio);
    setPendienteEntrega(entrega);

  }, [enviosSupervisor]);

    return (
        <div className="confirmaciones-layout">

            <main className="confirmaciones-content">
                <section className="confirmaciones-header">
                    <div>
                        <h1>Confirmaciones</h1>
                        <p>
                            Por favor, seleccione una de las opciones.
                        </p>
                    </div>
                </section>
                {/* LUEGO AGREGAR UNA IMAGEN EN CADA CARD PARA REPRESENTARLOS*/}
                <section className="confirmaciones-card">
                    <div className="pendientes" onClick={() => navigate("/confirmar-envio")}>
                        <div className="icon-confirmaciones">🧾</div>
                        <div className="badge-cantidad ordenes">{noConfirmados}</div>
                        <h2>Nuevas órdenes</h2>
                        <p>
                            Validación de órdenes entrantes al sistema
                        </p>
                    </div>

                    <div className="cambios-estado" onClick={() => navigate("/confirmar-inicio-viaje")}>
                        <div className="icon-confirmaciones">🚚</div>
                        <div className="badge-cantidad inicio">{pendienteInicio}</div>
                        <h2>Inicio de viajes</h2>
                        <p>
                            Confirmación para iniciar viaje
                        </p>
                    </div>
                </section>

                <section className="confirmaciones-card">
                    <div className="entregas" onClick={() => navigate("/confirmar-entregas")}>
                        <div className="icon-confirmaciones">📦</div>
                        <div className="badge-cantidad entregas">{pendienteEntrega}</div>
                        <h2>Entregas</h2>
                        <p>
                            Verificación de entregas completadas
                        </p>
                    </div>

                    <div className="incidencias" onClick={() => navigate("/confirmar-incidencias")}>
                        <div className="icon-confirmaciones">⚠️</div>
                        <div className="badge-cantidad incidencias">{incidencias}</div>
                        <h2>Indicencias</h2>
                        <p>
                            Validación de incidencias registradas
                        </p>
                    </div>
                </section>
            </main>
        </div>
    );
}