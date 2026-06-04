import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { transportista as transportistaApi } from "../api";
import "../styles/reportarIncidencia.css";
import { useTranslation } from "react-i18next";

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

const INCIDENCIA_OPTIONS = [
  { id: 1, key: "delay" },
  { id: 2, key: "accident" },
  { id: 3, key: "documentation" },
];

export default function ReportarIncidencia({ user }) {
  const navigate = useNavigate();
  const { t: tTransportista } = useTranslation("transportista");
  const [motivo, setMotivo] = useState("");
  const [tipoIncidenciaId, setTipoIncidenciaId] = useState("");
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
        const response = await transportistaApi.getEnviosAsignados(transportistaId, user?.legajo);
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!activeEnvio) {
      return;
    }

    if (!tipoIncidenciaId) {
      setError(tTransportista("reportarIncidencia.errors.typeRequired"));
      return;
    }

    if (!motivo.trim()) {
      setError(tTransportista("reportarIncidencia.errors.descriptionRequired"));
      return;
    }

    setError("");

    const tipoSeleccionado = INCIDENCIA_OPTIONS.find(
      (opt) => opt.id === Number(tipoIncidenciaId)
    );

    const payload = {
      numeroRemito: getField(activeEnvio, ["nro_remito", "numeroRemito", "remito"], null),
      legajoTransportista: user?.legajo ?? localStorage.getItem("legajo") ?? null,
      tipoIncidencia: tipoSeleccionado ? tTransportista(`reportarIncidencia.incidenceTypes.${tipoSeleccionado.key}`) : null,
      descripcion: motivo.trim(),
    };
    console.log(payload);

    try {
      await transportistaApi.createIncidencia(payload);
      setSentMessage(tTransportista("reportarIncidencia.errors.submitSuccess"));
    } catch (requestError) {
      console.error(requestError);
      setError(tTransportista("reportarIncidencia.errors.submitError"));
      return;
    }

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
            <h1>{tTransportista("reportarIncidencia.title")}</h1>
            <p>
              {tTransportista("reportarIncidencia.subtitle")}
            </p>
          </div>

          <div className="summary-box">
            <span>Transportista</span>
            <strong>{user?.nombre ? `${user.nombre} ${user.apellido || ""}` : tTransportista("reportarIncidencia.summary.fallbackUser")}</strong>
            <small>
              {transportistaId
                ? tTransportista("reportarIncidencia.summary.idLabel", { id: transportistaId })
                : tTransportista("reportarIncidencia.summary.idFallback")}
            </small>
          </div>
        </div>

        {loading ? (
          <section className="incidencia-empty-state">
            <span className="section-label">{tTransportista("reportarIncidencia.loading.label")}</span>
            <h2>{tTransportista("reportarIncidencia.loading.title")}</h2>
            <p>{tTransportista("reportarIncidencia.loading.subtitle")}</p>
          </section>
        ) : !activeEnvio ? (
          <section className="incidencia-empty-state">
            <span className="section-label">{tTransportista("reportarIncidencia.empty.label")}</span>
            <h2>{tTransportista("reportarIncidencia.empty.title")}</h2>
            <p>{tTransportista("reportarIncidencia.empty.subtitle")}</p>
            <div className="form-actions">
              <button type="button" className="ghost-btn" onClick={() => navigate("/transportista")}>
                {tTransportista("reportarIncidencia.empty.back")}
              </button>
            </div>
          </section>
        ) : (
          <form className="incidencia-form" onSubmit={handleSubmit}>
            <div className="incidencia-shipment-ref">
              <span className="section-label">{tTransportista("reportarIncidencia.shipment.label")}</span>
              <strong>
                {getField(activeEnvio, ["cot", "numeroCot", "numero_cot", "cotizacion"], tTransportista("reportarIncidencia.shipment.noData"))} | {tTransportista("reportarIncidencia.shipment.remitoLabel")}: {getField(activeEnvio, ["nro_remito", "numeroRemito", "remito"], tTransportista("reportarIncidencia.shipment.noData"))}
              </strong>
            </div>

            <label htmlFor="tipo-incidencia">{tTransportista("reportarIncidencia.form.typeLabel")}</label>
            <select
              id="tipo-incidencia"
              value={tipoIncidenciaId}
              onChange={(e) => setTipoIncidenciaId(e.target.value)}
            >
              <option value="">{tTransportista("reportarIncidencia.form.typePlaceholder")}</option>
              {INCIDENCIA_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {tTransportista(`reportarIncidencia.incidenceTypes.${option.key}`)}
                </option>
              ))}
            </select>

            <label htmlFor="motivo">{tTransportista("reportarIncidencia.form.descriptionLabel")}</label>
            <textarea
              id="motivo"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder={tTransportista("reportarIncidencia.form.descriptionPlaceholder")}
              rows={7}
            />

            {error && <div className="form-message form-message--error">{error}</div>}
            {sentMessage && <div className="form-message form-message--success">{sentMessage}</div>}

            <div className="form-actions">
              <button type="button" className="ghost-btn" onClick={() => navigate("/transportista")}>
                {tTransportista("reportarIncidencia.form.cancel")}
              </button>
              <button type="submit" className="primary-btn">{tTransportista("reportarIncidencia.form.submit")}</button>
            </div>
          </form>
        )}
      </section>
    </main>
  );
}