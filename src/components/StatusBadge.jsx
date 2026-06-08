import { useTranslation } from "react-i18next";

export default function StatusBadge({ estado }) {
  // 🔹 Cargamos explícitamente el namespace "common" (que apunta a common.json)
  const { t } = useTranslation("common"); 

  if (!estado) {
    return <span className="badge status-sin-estado">{t("status.sin_estado", "Sin estado")}</span>;
  }

  const normalize = (str) => 
    str.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const mapEstadoToKey = (estado) => {
    const key = normalize(estado);

    const mapping = {
      "en viaje": "en_curso",
      "en curso": "en_curso",
      "cancelado": "cancelado",
      "cancelada": "cancelado",
      "entregado": "entregado",
      "entregada": "entregado",
      "confirmado": "confirmado",
      "rechazado": "rechazado",
      "pendiente": "pendiente",
      "pendiente confirmar": "pendiente_confirmar",
      "pendiente de confirmar": "pendiente_confirmar",
      "pendiente a confirmar": "pendiente_confirmar",
      "pendiente de confirmacion de entrega": "pendiente_confirmacion_entrega",
      "pendiente de inicio de viaje": "pendiente_inicio_viaje",
      "activo": "activo",
      "no activo": "no_activo"
    };
    return mapping[key] || key.replace(/\s+/g, "_");
  };

  const estadoKey = mapEstadoToKey(estado);
  
  const statusClass = `status-${estadoKey.replace(/_/g, "-")}`;
  const label = t(`status.${estadoKey}`, estado);

  return (
    <span className={`badge ${statusClass}`}>
      {label}
    </span>
  );
}