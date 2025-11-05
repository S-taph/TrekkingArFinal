/**
 * Safe Storage Utility
 *
 * Maneja localStorage de forma segura para que funcione en:
 * - Modo incógnito/privado
 * - Navegadores con localStorage deshabilitado
 * - Entornos con restricciones de seguridad (CSP)
 *
 * En modo incógnito, algunos navegadores (Safari, Firefox) bloquean
 * completamente el acceso a localStorage, lanzando excepciones.
 * Esta utilidad usa un fallback en memoria para estos casos.
 */

// Fallback en memoria cuando localStorage no está disponible
const memoryStorage = new Map();

/**
 * Verifica si localStorage está disponible
 */
const isLocalStorageAvailable = () => {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
};

// Cachear el resultado para no verificarlo constantemente
let localStorageAvailable = null;

const checkStorage = () => {
  if (localStorageAvailable === null) {
    localStorageAvailable = isLocalStorageAvailable();
    if (!localStorageAvailable) {
      console.warn('[SafeStorage] localStorage no disponible (modo incógnito?). Usando almacenamiento en memoria.');
    }
  }
  return localStorageAvailable;
};

/**
 * Obtiene un valor del storage de forma segura
 * @param {string} key - Clave del valor
 * @returns {string|null} Valor almacenado o null
 */
export const safeGetItem = (key) => {
  try {
    if (checkStorage()) {
      return localStorage.getItem(key);
    }
    return memoryStorage.get(key) || null;
  } catch (e) {
    console.error('[SafeStorage] Error al obtener item:', e);
    return memoryStorage.get(key) || null;
  }
};

/**
 * Guarda un valor en el storage de forma segura
 * @param {string} key - Clave del valor
 * @param {string} value - Valor a guardar
 * @returns {boolean} true si se guardó correctamente
 */
export const safeSetItem = (key, value) => {
  try {
    if (checkStorage()) {
      localStorage.setItem(key, value);
      // También guardar en memoria como backup
      memoryStorage.set(key, value);
      return true;
    }
    memoryStorage.set(key, value);
    return true;
  } catch (e) {
    console.error('[SafeStorage] Error al guardar item:', e);
    // Intentar guardar al menos en memoria
    try {
      memoryStorage.set(key, value);
      return true;
    } catch (memError) {
      console.error('[SafeStorage] Error crítico al guardar en memoria:', memError);
      return false;
    }
  }
};

/**
 * Elimina un valor del storage de forma segura
 * @param {string} key - Clave del valor a eliminar
 * @returns {boolean} true si se eliminó correctamente
 */
export const safeRemoveItem = (key) => {
  try {
    if (checkStorage()) {
      localStorage.removeItem(key);
    }
    memoryStorage.delete(key);
    return true;
  } catch (e) {
    console.error('[SafeStorage] Error al eliminar item:', e);
    memoryStorage.delete(key);
    return true;
  }
};

/**
 * Limpia todo el storage de forma segura
 * @returns {boolean} true si se limpió correctamente
 */
export const safeClear = () => {
  try {
    if (checkStorage()) {
      localStorage.clear();
    }
    memoryStorage.clear();
    return true;
  } catch (e) {
    console.error('[SafeStorage] Error al limpiar storage:', e);
    memoryStorage.clear();
    return true;
  }
};

/**
 * Obtiene todas las claves del storage
 * @returns {string[]} Array de claves
 */
export const safeKeys = () => {
  try {
    if (checkStorage()) {
      return Object.keys(localStorage);
    }
    return Array.from(memoryStorage.keys());
  } catch (e) {
    console.error('[SafeStorage] Error al obtener claves:', e);
    return Array.from(memoryStorage.keys());
  }
};

// Export default para compatibilidad
export default {
  getItem: safeGetItem,
  setItem: safeSetItem,
  removeItem: safeRemoveItem,
  clear: safeClear,
  keys: safeKeys,
};
