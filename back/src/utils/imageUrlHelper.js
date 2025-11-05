/**
 * Image URL Helper
 *
 * Utilidades para construir URLs completas de imágenes
 */

/**
 * Construye URL completa para una imagen
 * @param {string} imageUrl - URL o nombre de archivo
 * @param {number} viajeId - ID del viaje (opcional)
 * @param {Object} req - Request object para obtener host
 * @returns {string} URL completa de la imagen
 */
export const buildImageUrl = (imageUrl, viajeId, req) => {
  if (!imageUrl) return null;

  // Si ya es una URL completa, retornar tal cual
  if (/^https?:\/\//.test(imageUrl)) {
    return imageUrl;
  }

  // Obtener API_URL del entorno o construir desde request
  const API_URL = process.env.API_URL || `${req.protocol}://${req.get('host')}`;

  // Si comienza con /uploads o uploads/, construir URL completa
  if (imageUrl.startsWith('/uploads') || imageUrl.startsWith('uploads/')) {
    return `${API_URL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
  }

  // Asumir que es solo el nombre de archivo
  if (viajeId) {
    return `${API_URL}/uploads/viajes/${viajeId}/${imageUrl}`;
  }

  // Sin viajeId, asumir que está en uploads root
  return `${API_URL}/uploads/${imageUrl}`;
};

/**
 * Mapea array de imágenes a URLs completas
 * @param {Array} imagenes - Array de strings (URLs o nombres)
 * @param {number} viajeId - ID del viaje
 * @param {Object} req - Request object
 * @returns {Array} Array de URLs completas
 */
export const mapImagenesArray = (imagenes, viajeId, req) => {
  if (!Array.isArray(imagenes)) return [];

  return imagenes
    .map(img => buildImageUrl(img, viajeId, req))
    .filter(Boolean); // Remover nulls
};

/**
 * Procesa imágenes de un objeto viaje
 * @param {Object} viajeData - Datos del viaje
 * @param {Object} req - Request object
 * @returns {Object} Viaje con imágenes procesadas
 */
export const processViajeImages = (viajeData, req) => {
  const viaje = { ...viajeData };

  // Procesar imagen principal
  if (viaje.imagen_principal_url) {
    viaje.imagen_principal_url = buildImageUrl(
      viaje.imagen_principal_url,
      viaje.id_viaje,
      req
    );
  }

  // Procesar array de imágenes (de ImagenViaje association)
  if (viaje.imagenes && Array.isArray(viaje.imagenes)) {
    viaje.imagenes = viaje.imagenes.map(imagen => ({
      ...imagen,
      url: buildImageUrl(imagen.url, viaje.id_viaje, req)
    }));
  }

  // Mapear 'fechas' a 'fechas_disponibles' para compatibilidad con frontend
  if (viaje.fechas && Array.isArray(viaje.fechas)) {
    viaje.fechas_disponibles = viaje.fechas;
  }

  return viaje;
};
