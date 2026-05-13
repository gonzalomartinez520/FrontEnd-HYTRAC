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
    
    // Mapeo especial para estados específicos
    let estadoMapeado = estado;
    if (estadoMapeado.toUpperCase() === "EN_VIAJE") {
      estadoMapeado = "EN_CURSO";
    } else if (estadoMapeado.toUpperCase() === "CANCELADO") {
      estadoMapeado = "CANCELADA";
    } else if (estadoMapeado.toUpperCase() === "ENTREGADO") {
      estadoMapeado = "ENTREGADA";
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
