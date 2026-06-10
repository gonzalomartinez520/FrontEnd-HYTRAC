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

    seleccionarOptimos: async () => {
        const { data } = await apiClient.post('/transportistas/seleccionar-optimos');
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
    },

    getPlantaLocalidad: async (localidadId) => {
        const { data } = await apiClient.get(`/lugares-operativos/plantas/${localidadId}` , { params: { localidadId } });
        return data;
    },

    getEstacionLocalidad: async (localidadId) => {
        const { data } = await apiClient.get(`/lugares-operativos/estaciones/${localidadId}` , { params: { localidadId } });
        return data;
    },

    //Incidencias
    getIncidencias: async () => {
        const { data } = await apiClient.get('/supervisor/incidencias');
        return data;
    },

    //Rutas
    calculateRuta: async (origenId, destinoId) => {
        const { data } = await apiClient.get(`/rutas/calculate/${origenId}/${destinoId}`);
        return data;
    },

    getRuta: async (rutaId) => {
        const { data } = await apiClient.get(`/rutas/get/${rutaId}`);
        return data;
    },


    //Entidades
    getTipoVinculo: async () => {
        const { data } = await apiClient.get('/entidades/tipo-vinculo');
        return data;
    },

    getTipoDocumento: async () => {
        const { data } = await apiClient.get('/entidades/tipo-documento');
        return data;
    },

    getEmpresas: async () => {
        const { data } = await apiClient.get('/entidades/empresas');
        return data;
    },

    //Notificaciones
    getNotificaciones: async (legajo) => {
        const { data } = await apiClient.get(`/notificaciones/${legajo}`);
        return data;
    },

    leerNotificacion: async (notificacionId) => {
        const { data } = await apiClient.put(`/notificaciones/${notificacionId}/leer`);
        return data;
    },

    //Documentos
    getDocumentos: async (transportistaId) => {
        const { data } = await apiClient.get(`/transportistas/${transportistaId}/documentos`);
        return data;
    }
};

export default datos;