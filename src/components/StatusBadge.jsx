export default function StatusBadge({ estado }) {
  if (!estado) {
    return <span className="badge status-unknown">Sin estado</span>;
  }

  // 🔹 Normaliza para CSS
  const normalize = (str) =>
    str.toLowerCase().trim();

  const getStatusClass = (estado) => {
    return `status-${normalize(estado).replace(/\s+/g, "-")}`;
  };

  // 🔹 Configuración centralizada (PRO 🔥)
  const estadosConfig = {
    // 🔹 EXISTENTES
    "en viaje": "En curso",
    "en curso": "En curso",
    "cancelado": "Cancelada",
    "cancelada": "Cancelada",
    "entregado": "Entregada",
    "entregada": "Entregada",

    // 🔹 NUEVOS
    "confirmado": "Confirmado",
    "rechazado": "Rechazado",
    "pendiente confirmar": "Pendiente a confirmar",
    "pendiente a confirmar": "Pendiente a confirmar",

    // 🔹 PERSONALIZADOS (los que pediste)
    "pendiente de confirmacion de entrega": "Confirmación de entrega",
    "pendiente de inicio de viaje": "Inicio pendiente",
  };

  // 🔹 Obtener label
  const getEstadoLabel = (estado) => {
    const key = normalize(estado);

    if (estadosConfig[key]) {
      return estadosConfig[key];
    }

    // fallback automático
    return key.replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const statusClass = getStatusClass(estado);
  const label = getEstadoLabel(estado);

  return (
    <span className={`badge ${statusClass}`}>
      {label}
    </span>
  );
}