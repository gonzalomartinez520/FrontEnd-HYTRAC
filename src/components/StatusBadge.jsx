import { useTranslation } from "react-i18next";

export default function StatusBadge({ estado }) {
  const { t } = useTranslation("common");

  if (!estado) {
    return <span className="badge status-unknown">{t("status.sin_estado")}</span>;
  }

  // 🔹 Normalizar
  const normalize = (str) => str.toLowerCase().trim();

  // 🔹 Generar clase CSS (NO se toca)
  const getStatusClass = (estado) => {
    return `status-${normalize(estado).replace(/\s+/g, "-")}`;
  };

  // 🔹 MAPEO CLAVE (🔥 importante)
  const mapEstadoToKey = (estado) => {
    const key = normalize(estado);

    const mapping = {
      "en viaje": "en_viaje",
      "en curso": "en_curso",
      "cancelado": "cancelado",
      "cancelada": "cancelada",
      "entregado": "entregado",
      "entregada": "entregada",
      "confirmado": "confirmado",
      "rechazado": "rechazado",
      "pendiente": "pendiente",
      "pendiente confirmar": "pendiente_confirmar",
      "pendiente a confirmar": "pendiente_confirmar",
      "pendiente de confirmacion de entrega": "pendiente_confirmacion_entrega",
      "pendiente de inicio de viaje": "pendiente_inicio_viaje",
    };

    return mapping[key] || key.replace(/\s+/g, "_");
  };

  const statusClass = getStatusClass(estado);
  const estadoKey = mapEstadoToKey(estado);

  // 🔥 traducción real
  const label = t(`status.${estadoKey}`);

  return (
    <span className={`badge ${statusClass}`}>
      {label}
    </span>
  );
}