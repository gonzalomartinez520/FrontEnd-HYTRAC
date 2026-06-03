/**
 * ARCHIVO BARREL (Punto de Exportación Central)
 * 
 * Este archivo sirve como punto de entrada principal para todos los servicios de API.
 * Permite importar de forma limpia como:
 * 
 *    import { envios, auth, users } from '@/api';
 * 
 * En lugar de importar cada archivo por separado.
 * Es un patrón común llamado "barrel export".
 */

export { default as envios } from './envios';
export { default as datos } from './datos';
export { default as administrador } from './administrador';
export { default as apiClient } from './apiClient';   // optional
export {
  default as transportista,
  canNotificarEntrega,
  getOrdenEstado,
  getPrimaryActionLabel,
  isOrdenEnCurso,
  normalizeEstado,
} from './transportista';