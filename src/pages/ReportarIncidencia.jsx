import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { transportista as transportistaApi } from "../api";
import "../styles/reportarIncidencia.css";

const normalizeEnvios = (payload) => {
  if (!payload) return [];

  if (Array.isArray(payload)) return payload;

  if (Array.isArray(payload?.envios)) return payload.envios;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.result)) return payload.result;
  if (Array.isArray(payload?.items)) return payload.items;

  if (payload?.envio || payload?.shipment) {
    return [payload.envio || payload.shipment];
  }

  return [payload];
};

const getField = (envio, keys, fallback = "Pendiente") => {
  for (const key of keys) {
    const value = envio?.[key];
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }

  return fallback;
};

export default function ReportarIncidencia({ user }) {
  const navigate = useNavigate();
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState("");
  const [sentMessage, setSentMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [envios, setEnvios] = useState([]);

  const transportistaId = useMemo(
    () => user?.transportistaId ?? user?.id ?? user?.usuarioId ?? null,
    [user]
  );

  useEffect(() => {
    let isMounted = true;

    const loadEnvios = async () => {
      if (!transportistaId) {
        if (isMounted) {
          setEnvios([]);
          setLoading(false);
        }
        return;
      }

      setLoading(true);

      try {
        const response = await transportistaApi.getEnviosAsignados(transportistaId);
        const normalized = normalizeEnvios(response);

        if (isMounted) {
          setEnvios(normalized.filter(Boolean));
        }
      } catch (requestError) {
        console.error(requestError);

        if (isMounted) {
          setEnvios([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadEnvios();

    return () => {
      isMounted = false;
    };
  }, [transportistaId]);

  const activeEnvio = envios[0];

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!activeEnvio) {
      return;
    }

    if (!motivo.trim()) {
      setError("Ingresá el motivo de la incidencia para continuar.");
      return;
    }

    setError("");
    setSentMessage("Incidencia registrada localmente. En una próxima etapa se enviará al backend.");

    setTimeout(() => {
      navigate("/transportista");
    }, 1400);
  };

  return (
    <main className="incidencia-screen">
      <section className="incidencia-card">
        <button type="button" className="back-link" onClick={() => navigate("/transportista")}>← Volver a la ruta</button>

        <div className="incidencia-header">
          <div>
            <p className="eyebrow">Reportar incidencia</p>
            <h1>Detallá el motivo del incidente</h1>
            <p>
              Registrá cualquier desvío operativo, demora o problema en ruta para dejar constancia inmediata.
            </p>
          </div>

          <div className="summary-box">
            <span>Transportista</span>
            <strong>{user?.nombre ? `${user.nombre} ${user.apellido || ""}` : "Usuario"}</strong>
            <small>ID {transportistaId ?? "No disponible"}</small>
          </div>
        </div>

        {loading ? (
          <section className="incidencia-empty-state">
            <span className="section-label">Cargando</span>
            <h2>Verificando envíos asignados</h2>
            <p>Estamos consultando si hay un envío en curso para poder registrar una incidencia.</p>
          </section>
        ) : !activeEnvio ? (
          <section className="incidencia-empty-state">
            <span className="section-label">Sin asignación</span>
            <h2>No se puede registrar una incidencia</h2>
            <p>Este transportista no tiene envíos asignados, por lo que no puede cargar una incidencia.</p>
            <div className="form-actions">
              <button type="button" className="ghost-btn" onClick={() => navigate("/transportista")}>Volver a la ruta</button>
            </div>
          </section>
        ) : (
          <form className="incidencia-form" onSubmit={handleSubmit}>
            <div className="incidencia-shipment-ref">
              <span className="section-label">Envío activo</span>
              <strong>
                COT {getField(activeEnvio, ["cot", "numeroCot", "numero_cot", "cotizacion"], "Sin dato")} - {getField(activeEnvio, ["nro_remito", "numeroRemito", "remito"], "Sin dato")}
              </strong>
            </div>

            <label htmlFor="motivo">Motivo de la incidencia</label>
            <textarea
              id="motivo"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ej.: demora en carga, desvío de ruta, inconveniente mecánico, documentación pendiente..."
              rows={7}
            />

            {error && <div className="form-message form-message--error">{error}</div>}
            {sentMessage && <div className="form-message form-message--success">{sentMessage}</div>}

            <div className="form-actions">
              <button type="button" className="ghost-btn" onClick={() => navigate("/transportista")}>Cancelar</button>
              <button type="submit" className="primary-btn">Enviar incidencia</button>
            </div>
          </form>
        )}
      </section>
    </main>
  );
}
