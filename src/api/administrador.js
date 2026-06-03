import apiClient from './apiClient';

const administrador = {

    // CREACIÓN DE USUARIOS   ROLES: OPERADOR, SUPERVISOR Y JEFE DE ESTACIÓN
    crearUsuario: async (usuarioData) => {
        const { data } = await apiClient.post('/usuarios/alta', usuarioData);
        return data;
    }
};

export default administrador;