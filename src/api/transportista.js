import apiClient from "./apiClient";

const resolveLegajo = (transportistaId) => {
  const legajo = localStorage.getItem("legajo") || transportistaId;

  if (legajo == null || legajo === "") {
    return null;
  }

  return String(legajo);
};

export const getOrdenEstado = (orden) =>
  orden?.estado ??
  orden?.status ??
  orden?.estadoOrden ??
  orden?.estadoNombre ??
  orden?.orderState ??
  "";

export const normalizeEstado = (estado) =>
  String(estado || "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/\s+/g, "_");

export const isOrdenEnCurso = (orden) => {
  const estado = normalizeEstado(getOrdenEstado(orden));
  return estado === "EN_CURSO" || estado === "EN_VIAJE" || estado === "ENCURSO";
};

export const canNotificarEntrega = (orden) => isOrdenEnCurso(orden);

export const getPrimaryActionLabel = (orden) =>
  canNotificarEntrega(orden) ? "Notificar Entrega" : "Confirmar Envío";

const normalizeOrdenEnCurso = (payload) => {
  if (!payload) {
    return null;
  }

  if (Array.isArray(payload)) {
    return payload[0] ?? null;
  }

  if (Array.isArray(payload?.envios)) {
    return payload.envios[0] ?? null;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data[0] ?? null;
  }

  if (Array.isArray(payload?.items)) {
    return payload.items[0] ?? null;
  }

  if (payload?.envio || payload?.shipment) {
    return payload.envio || payload.shipment;
  }

  return payload;
};

const normalizeOrdenPendiente = (payload) => {
  if (!payload) {
    return null;
  }

  if (Array.isArray(payload)) {
    return payload[0] ?? null;
  }

  if (Array.isArray(payload?.envios)) {
    return payload.envios[0] ?? null;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data[0] ?? null;
  }

  if (Array.isArray(payload?.items)) {
    return payload.items[0] ?? null;
  }

  if (payload?.envio || payload?.shipment) {
    return payload.envio || payload.shipment;
  }

  return payload;
};

const transportista = {
  getOrdenPendiente: async (transportistaId) => {
    const resolvedLegajo = resolveLegajo(transportistaId);

    try {
      if (!resolvedLegajo) {
        return null;
      }

      const { data } = await apiClient.get(`/transportista/${resolvedLegajo}/orden`);

      return normalizeOrdenPendiente(data);
    } catch (error) {
      console.warn("No se pudo obtener la orden pendiente del transportista:", error?.response?.data || error.message);
    }

    return null;
  },
  getOrdenEnCurso: async (transportistaId) => {
    const resolvedLegajo = resolveLegajo(transportistaId);

    try {
      if (!resolvedLegajo) {
        return null;
      }

      const { data } = await apiClient.get(`/transportista/${resolvedLegajo}/orden-en-curso`);

      return normalizeOrdenEnCurso(data);
    } catch (error) {
      console.warn("No se pudo obtener la orden del transportista:", error?.response?.data || error.message);
    }

    return null;
  },

  getEnviosAsignados: async (transportistaId) => {
    const [ordenPendiente, ordenEnCurso] = await Promise.all([
      transportista.getOrdenPendiente(transportistaId),
      transportista.getOrdenEnCurso(transportistaId),
    ]);

    if (ordenEnCurso) {
      return [ordenEnCurso];
    }

    return ordenPendiente ? [ordenPendiente] : [];
  },

  notificarEntrega: async (ordenId, payload = {}) => {
    const { data } = await apiClient.put(
      `/transportista/orden/${ordenId}/notificar-entrega`,
      payload
    );

    return data;
  },

  createIncidencia: async (payload) => {
    const { data } = await apiClient.post("/transportistas/incidencia", payload);

    return data;
  },
};

export default transportista;