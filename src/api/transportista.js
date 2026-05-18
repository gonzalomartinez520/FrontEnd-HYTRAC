import apiClient from "./apiClient";

const MOCK_ENVIOS_BY_TRANSPORTISTA_ID = {
  /*3: {
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
  },*/
};

const getMockEnvio = (transportistaId) => {
  const normalizedId = Number(transportistaId);

  if (!Number.isFinite(normalizedId)) {
    return null;
  }

  return MOCK_ENVIOS_BY_TRANSPORTISTA_ID[normalizedId] ?? null;
};

const legajo =  localStorage.getItem("legajo");

const transportista = {
  getEnviosAsignados: async (transportistaId) => {

    try {
    const { data } = await apiClient.get(`/transportista/${legajo}/orden`);
        console.log("Respuesta de envíos asignados:", data);
      
    if (data) {
     console.log(data);
        return data;
      }
    } catch (error) {
      console.warn("Fallback al mock de transportista:", error?.response?.data || error.message);
    }

    const mockEnvio = getMockEnvio(transportistaId);

    if (mockEnvio) {
      return mockEnvio;
    }

    return [];
  },
};

export default transportista;