/**
 * CLIENTE BASE DE API
 * 
 * Instancia base de Axios que usan todos los módulos de API.
 * Contiene:
 *   - Configuración de URL base
 *   - Headers por defecto
 *   - Interceptors de request y response (auth, errores, etc.)
 * 
 * Todos los demás archivos (envios.js, users.js, etc.) importan desde aquí.
 */

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const getStoredJwt = () => {
  const storedToken = localStorage.getItem('token');

  if (!storedToken) {
    return null;
  }

  try {
    const parsedToken = JSON.parse(storedToken);

    if (typeof parsedToken === 'string') {
      return parsedToken;
    }

    return parsedToken?.token || null;
  } catch {
    return storedToken;
  }
};

// Request Interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = getStoredJwt();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    // You can add global error handling here (e.g. 401 logout)
    return Promise.reject(error);
  }
);

// Aceptar terminos y condiciones
export const usuarios = {
  aceptarTerminos: (legajo) => 
    apiClient.post('/auth/aceptar-terminos', { legajo }).then((r) => r.data),
};

export default apiClient;