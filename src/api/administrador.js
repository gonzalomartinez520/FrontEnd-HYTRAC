import apiClient from './apiClient';

const administrador = {

    // CREACIÓN DE USUARIOS OPERADOR, SUPERVISOR Y JEFE DE ESTACION
    crearUsuario: async (usuarioData) => {
        const { data } = await apiClient.post('/admin/usuarios/alta', usuarioData);
        return data;
    },

    crearTransportista: async (usuarioData) => {
        const { data } = await apiClient.post('/transportistas/alta', usuarioData);
        return data;
    },

    obtenerUsuarios: async () => {
        const { data } = await apiClient.get('/admin/usuarios');
        return data;
    },

    editarUsuario: async (id, payload) => {
        const { data } = await apiClient.put(`/admin/usuarios/editar/${id}`, payload);
        return data;
    },

    darBajaUsuario: async (id) => {
        const { data } = await apiClient.delete(`/admin/usuarios/baja/${id}`);
        return data;
    }
};

export default administrador;