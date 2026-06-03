/** 
 * SERVICIO DE API - ENVÍOS
 * 
 * Contiene todas las llamadas a la API relacionadas con envíos.
 * Actúa como una capa de abstracción limpia sobre las respuestas en bruto de axios.
 * 
 * Ejemplo de uso:
 *    import { envios } from '@/api';
 *    const enviosList = await envios.getAll();
 *    const nuevoEnvio = await envios.create(payload);
**/

import apiClient from './apiClient';   // ← Updated import

const envios = {
  // Obtener métricas y estadísticas de envíos
  getMetricas: async () => {
    const { data } = await apiClient.get('/envios/metricas');
    return data;
  },

  // Obtener todos los envíos (con filtros opcionales)
  getAll: async (params) => {
    const { data } = await apiClient.get('/ordenes/get', { params });
    return data;
  },

  getAllSupervisor: async (params) => {
    const { data } = await apiClient.get('/supervisor/ordenes', { params });
    return data;
  },

  // Crear un nuevo envío
  create: async (payload) => {
    const { data } = await apiClient.post('/ordenes/crear', payload);
    return data;
  },

  // Crear un nuevo envío pero con respuesta completa
  createWithResponse: async (payload) => {
    return await apiClient.post('/ordenes/crear', payload);
  },

  // Editar un envío pendiente a confirmar
  editarEnvio: async (id, payload) => {
    const { data } = await apiClient.put(`/ordenes/${id}/editar`, payload);
    return data;
  },

  // Confirmar un envío
  confirmarEnvio: async (id) => {
    const { data } = await apiClient.put(`/supervisor/ordenes/${id}/confirmar`);
    return data;
  },

  // Rechazar un envío
  rechazarEnvio: async (id, payload) => {
    const { data } = await apiClient.put(`/supervisor/ordenes/${id}/rechazar`, payload);
    return data;
  },

  //Confirmar inicio de viaje
  confirmarInicioViaje: async (id, payload) => {
    const {data} = await apiClient.put(`/supervisor/ordenes/${id}/aprobar-inicio`, payload);
    return data;
  },

  //Rechazar inicio de viaje
  rechazarInicioViaje: async (id, payload) => {
    const {data} = await apiClient.put(`/supervisor/ordenes/${id}/rechazar-inicio`, payload);
    return data;
  },

  confirmarEntrega: async (id, payload) => {
    const {data} = await apiClient.put(`/supervisor/ordenes/${id}/confirmar-entrega`, payload);
    return data;
  },

  rechazarEntrega: async (id, payload) => {
    const {data} = await apiClient.put(`/supervisor/ordenes/${id}/rechazar-entrega`, payload);
    return data;
  },

  confirmarEntregaJefe: async (id, payload) => {
    const {data} = await apiClient.put(`/jefe-estacion/orden/${id}/reportar-entrega`, payload);
    return data;
  },

  //POR AHI FALTA QUE EL JEFE DE ESTACION RECHACE A ENTREGA.

  // Obtener un envío por su ID
  getById: async (id) => {
    const { data } = await apiClient.get(`/ordenes/${id}`);
    return data; // devuelve solo losdatos
  },

  //Obtener un envío por su Remito
  getOrdenByRemito: async (remito) => {
    const { data } = await apiClient.get(`/ordenes/remito/${remito}`);
    return data;
  },

  //Obtener el historial del envio (auditoria de estados)
  getHistorialEstado: async (remito) => {
    const { data } = await apiClient.get(`/auditoria/${remito}`);
    return data;
  }, 

  //Confirmar y rechazar incidencia
  gestionarIncidencia: async (remito, payload) => {
    const { data } = await apiClient.put(`/supervisor/ordenes/remito/${remito}/gestion-incidencia`, payload);
    return data;
  },

};

export default envios;