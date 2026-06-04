import apiClient from './apiClient';

const administrador = {

    // CREACIÓN DE USUARIOS   LUEGO ACTUALIZARLO CUANDO EMA HAGA PUSH.
    crearUsuario: async (usuarioData) => {
        const { data } = await apiClient.post('/usuarios/alta', usuarioData);
        return data;
    },

    obtenerUsuarios: async () => {
        const { data } = await apiClient.get('/admin/usuarios');
        return data;
    }
};

export default administrador;