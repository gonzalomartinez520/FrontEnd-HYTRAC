import apiClient from "./apiClient";

/*const MOCK_ENVIOS_BY_TRANSPORTISTA_ID = {
  3: {
    id: 3001,
    cot: "COT-2026-0148",
    nro_remito: "R-77821",
    origen: "Refinería Bahía Blanca",
    destino: "Planta San Lorenzo",
    patenteCamion: "AH-482-KP",
    patenteAcoplado: "AG-933-ZT",
    tipoCombustible: "Gasoil Grado 3",
    litrosCargados: 32000,
    fechaSalida: "2026-05-18T08:30:00-03:00",
    fechaLlegada: "2026-05-18T20:15:00-03:00",
  },*/
  /*4: {
    id: 4001,
    cot: "COT-2026-0152",
    nro_remito: "R-77834",
    origen: "Terminal Dock Sud",
    destino: "Depósito Neuquén",
    patenteCamion: "AE-215-LM",
    patenteAcoplado: "AR-102-PQ",
    tipoCombustible: "Nafta Súper",
    litrosCargados: 28000,
    fechaSalida: "2026-05-18T06:45:00-03:00",
    fechaLlegada: "2026-05-18T18:10:00-03:00",
  },
  5: {
    id: 5001,
    cot: "COT-2026-0161",
    nro_remito: "R-77856",
    origen: "Puerto Rosario",
    destino: "Base Cuyo",
    patenteCamion: "AB-331-QR",
    patenteAcoplado: "AL-778-XD",
    tipoCombustible: "Gasoil Premium",
    litrosCargados: 35000,
    fechaSalida: "2026-05-18T09:10:00-03:00",
    fechaLlegada: "2026-05-18T22:40:00-03:00",
  },
};
*/
const getMockEnvio = (transportistaId) => {
  const normalizedId = Number(transportistaId);

  if (!Number.isFinite(normalizedId)) {
    return null;
  }

  return MOCK_ENVIOS_BY_TRANSPORTISTA_ID[normalizedId] ?? null;
};

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
      console.warn("Fallback al mock de transportista:", error?.response?.data || error.message);
    }

    return getMockEnvio(transportistaId);
  },

  getEnviosAsignados: async (transportistaId) => {
    const ordenEnCurso = await transportista.getOrdenEnCurso(transportistaId);

    return ordenEnCurso ? [ordenEnCurso] : [];
  },
};

export default transportista;