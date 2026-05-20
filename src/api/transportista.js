import apiClient from "./apiClient";

const resolveLegajo = (transportistaId) => {
  const legajo = localStorage.getItem("legajo") || transportistaId;

  if (legajo == null || legajo === "") {
    return null;
  }

  return String(legajo);
};

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

const transportista = {
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
    const ordenEnCurso = await transportista.getOrdenEnCurso(transportistaId);

    return ordenEnCurso ? [ordenEnCurso] : [];
  },
};

export default transportista;