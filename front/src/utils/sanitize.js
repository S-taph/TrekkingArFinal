import DOMPurify from 'dompurify';

/**
 * Sanitiza HTML para prevenir ataques XSS
 * @param {string} dirty - HTML sin sanitizar
 * @param {object} config - Configuración de DOMPurify (opcional)
 * @returns {string} HTML sanitizado
 */
export const sanitizeHtml = (dirty, config = {}) => {
  if (!dirty) return '';

  const defaultConfig = {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
    ...config
  };

  return DOMPurify.sanitize(dirty, defaultConfig);
};

/**
 * Sanitiza texto plano (elimina todas las etiquetas HTML)
 * @param {string} dirty - Texto con posible HTML
 * @returns {string} Texto sin HTML
 */
export const sanitizeText = (dirty) => {
  if (!dirty) return '';
  return DOMPurify.sanitize(dirty, { ALLOWED_TAGS: [] });
};

/**
 * Hook de React para usar en componentes
 * @param {string} html - HTML a sanitizar
 * @returns {object} Objeto con __html sanitizado para dangerouslySetInnerHTML
 */
export const useSanitizedHtml = (html) => {
  return { __html: sanitizeHtml(html) };
};

export default {
  sanitizeHtml,
  sanitizeText,
  useSanitizedHtml
};
