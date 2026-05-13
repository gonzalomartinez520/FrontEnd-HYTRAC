import apiClient from './apiClient';

const datos = {
    //Combustibles
    getCombustibles: async () => {
        const { data } = await apiClient.get('/combustibles');
        return data;
    },

    //Provincias
    getProvincias: async () => {
        const { data } = await apiClient.get('/provincias/get');
        return data;    
    },
    
    //Localidades
    getLocalidades: async (provinciaId) => {
        const { data } = await apiClient.get(`/localidades/provincia/${provinciaId}`, { params: { provinciaId } });
        return data;    
    },

    //Vehiculos
    getCamiones: async () => {
        const { data } = await apiClient.get('/vehiculos/camiones');
        return data;    
    },
    getAcoplados: async () => {
        const { data } = await apiClient.get('/vehiculos/acoplados');
        return data;
    },

    //Transportistas
    getTransportistas: async () => {
        const { data } = await apiClient.get('/transportistas');
        return data;    
    },

    //Lugares Operativos
    getPlantas: async () => {
        const { data } = await apiClient.get('/lugares-operativos/plantas/get');  
        return data;    
    },
    getEstaciones: async () => {
        const { data } = await apiClient.get('/lugares-operativos/estaciones-servicio/get');
        return data;    
    }
};

export default datos;