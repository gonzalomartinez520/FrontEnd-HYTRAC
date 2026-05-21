export default function StatusBadge({ estado }) {
  const getStatusClass = (estado) => {
    if (!estado) return "status-unknown";
    
    const normalized = estado
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-");
    
    return `status-${normalized}`;
  };

  const formatearEstado = (estado) => {
    if (!estado) return "";
    
    let estadoMapeado = estado;

    // 🔹 Estados existentes
    if (estadoMapeado.toUpperCase() === "EN_VIAJE") {
      estadoMapeado = "EN_CURSO";
    } else if (estadoMapeado.toUpperCase() === "CANCELADO") {
      estadoMapeado = "CANCELADA";
    } else if (estadoMapeado.toUpperCase() === "ENTREGADO") {
      estadoMapeado = "ENTREGADA";
    }

    // 🔹 NUEVOS ESTADOS (sin romper lo demás)
    else if (estadoMapeado.toUpperCase() === "CONFIRMADO") {
      estadoMapeado = "CONFIRMADO";
    } else if (estadoMapeado.toUpperCase() === "RECHAZADO") {
      estadoMapeado = "RECHAZADO";
    } else if (estadoMapeado.toUpperCase() === "PENDIENTE_CONFIRMAR") {
      estadoMapeado = "PENDIENTE A CONFIRMAR";
    }

    return estadoMapeado
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const statusClass = getStatusClass(estado);

  return (
    <span className={`badge ${statusClass}`}>
      {formatearEstado(estado)}
    </span>
  );
}