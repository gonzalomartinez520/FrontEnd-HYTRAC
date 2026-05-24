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

import ConfirmarIncidencias from '../pages/ConfirmarIncidencias';
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

  // Cancelar un envio por incidencia
  cancelarEnvio: async (id) => {
    const { data } = await apiClient.put(`/ordenes/${id}/cancelar`)
    return data;
  },

  // Confirmar un envío
  confirmarEnvio: async (id) => {
    const { data } = await apiClient.put(`/supervisor/ordenes/${id}/confirmar`);
    return data;
  },

  // Rechazar un envío
  rechazarEnvio: async (id) => {
    const { data } = await apiClient.put(`/supervisor/ordenes/${id}/rechazar`);
    return data;
  },

  //Confirmar cambio de estado
  confirmarEstadoNuevo: async (id) => {
    const {data} = await apiClient.put(`/supervisor/ordenes/${id}/aprobar-inicio`)
    return data;
  },

  //Rechazar cambio de estado

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

  // Obtener el historial de un envío por su id
  // Devuelve siempre un array para evitar errores al hacer .map() o similar
  getHistorial: async (id) => {
    try {
      const { data } = await apiClient.get(`/ordenes/${id}/historial`);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.warn(`No se pudo obtener historial del envío ${id}`);
      return [];
    }
  },

  //Confirmar y rechazar incidencia
  gestionarIncidencia: async (remito, payload) => {
    const { data } = await apiClient.put(`/ordenes/remito/${remito}/cancelar`, payload);
    return data;
  },

};

export default envios;