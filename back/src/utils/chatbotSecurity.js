/**
 * Utilidades de seguridad para el chatbot
 * Incluye content filtering y detección de intentos de jailbreak
 */

/**
 * Patrones para detectar información sensible en respuestas del bot
 */
const SENSITIVE_PATTERNS = {
  // Emails (más permisivo para emails legítimos de la empresa)
  email: /\b[A-Za-z0-9._%+-]+@(?!trekkingar\.com)[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/gi,

  // Números de tarjeta de crédito (16 dígitos)
  creditCard: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,

  // Contraseñas (palabra "password" o "contraseña" seguida de caracteres)
  password: /(password|contraseña|clave|pwd)[\s:=]+[\w!@#$%^&*()]+/gi,

  // Tokens o API keys (cadenas alfanuméricas largas)
  token: /\b[A-Za-z0-9_-]{32,}\b/g,

  // Números de seguridad social o DNI completos (8 dígitos argentinos)
  dni: /\b(DNI|dni|documento)[\s:]+\d{8}\b/gi,

  // IPs privadas o internas
  privateIp: /\b(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.)\d{1,3}\.\d{1,3}\b/g,
};

/**
 * Palabras clave que indican intento de jailbreak del prompt
 */
const JAILBREAK_KEYWORDS = [
  'ignore previous',
  'ignore all previous',
  'forget everything',
  'new instructions',
  'act as',
  'pretend you are',
  'you are now',
  'system:',
  'from now on',
  'disregard',
  'override',
  'sudo',
  'admin mode',
  'developer mode',
  'god mode',
  'jailbreak',
  'prompt injection',
];

/**
 * Respuestas predefinidas para casos comunes (fallback)
 */
const FALLBACK_RESPONSES = {
  greeting: '¡Hola! Soy el asistente virtual de TrekkingAR. ¿En qué puedo ayudarte hoy? Puedo informarte sobre nuestros viajes, precios, disponibilidad y más.',

  trips: 'Ofrecemos una variedad de trekkings y excursiones de montaña en Argentina. Puedes ver nuestro catálogo completo en la sección de Viajes del sitio web, o decime qué tipo de aventura te interesa y te puedo recomendar opciones.',

  booking: 'Para realizar una reserva, primero elige el viaje que te interesa en nuestro catálogo. Luego podrás ver las fechas disponibles y completar tu reserva de forma segura en nuestro sistema.',

  contact: 'Puedes contactarnos por:\n- Email: info@trekkingar.com\n- Teléfono/WhatsApp: +54 9 294 442-8765 (disponible 24/7)\n- Ubicación: San Carlos de Bariloche, Río Negro, Argentina\n\nNuestro horario de atención es:\n- Lunes a Viernes: 9:00 - 18:00\n- Sábados: 9:00 - 13:00',

  prices: 'Los precios de nuestros viajes varían según la duración, dificultad y servicios incluidos. Puedes ver los precios detallados en el catálogo de viajes. ¿Te gustaría saber sobre algún viaje en particular?',

  difficulty: 'Clasificamos nuestros viajes en 4 niveles de dificultad:\n- Fácil: Para principiantes, sin experiencia previa necesaria\n- Moderado: Requiere estado físico básico\n- Difícil: Para personas con experiencia y buen estado físico\n- Extremo: Solo para expertos con entrenamiento avanzado',

  policies: 'Nuestras políticas de cancelación dependen del tiempo de anticipación:\n- Más de 30 días: Reembolso completo\n- 15-30 días: 75% de reembolso\n- 7-15 días: 50% de reembolso\n- Menos de 7 días: Sin reembolso\n\nPara más detalles, consulta nuestros términos y condiciones.',

  error: 'Lo siento, estoy teniendo problemas técnicos en este momento. Por favor, intenta de nuevo en unos minutos o contáctanos directamente por WhatsApp al +54 9 294 442-8765.',

  default: 'Puedo ayudarte con información sobre nuestros viajes, precios, reservas y políticas. ¿Qué te gustaría saber?',
};

/**
 * Filtra y valida la respuesta del bot antes de enviarla al usuario
 * @param {string} response - Respuesta del bot
 * @param {string} userMessage - Mensaje original del usuario (para contexto)
 * @returns {Object} - { isValid: boolean, filteredResponse: string, warnings: Array }
 */
export function filterBotResponse(response, userMessage = '') {
  const warnings = [];
  let filteredResponse = response;
  let isValid = true;

  // 1. Detectar información sensible
  for (const [type, pattern] of Object.entries(SENSITIVE_PATTERNS)) {
    const matches = response.match(pattern);
    if (matches && matches.length > 0) {
      warnings.push({
        type: 'sensitive_data',
        category: type,
        matches: matches.length,
      });

      // Reemplazar información sensible con [INFORMACIÓN ELIMINADA]
      filteredResponse = filteredResponse.replace(pattern, '[INFORMACIÓN ELIMINADA POR SEGURIDAD]');
      isValid = false;
    }
  }

  // 2. Detectar si el bot está inventando información no provista
  // Palabras clave que indican que el bot puede estar alucinando
  const hallucinationKeywords = [
    'según mis registros',
    'en mi base de datos',
    'tengo acceso a',
    'puedo ver que',
    'confirmé que',
  ];

  for (const keyword of hallucinationKeywords) {
    if (filteredResponse.toLowerCase().includes(keyword)) {
      warnings.push({
        type: 'possible_hallucination',
        keyword,
      });
    }
  }

  // 3. Detectar si la respuesta es demasiado corta o genérica (posible error)
  if (filteredResponse.trim().length < 10) {
    warnings.push({
      type: 'suspicious_length',
      length: filteredResponse.length,
    });
  }

  // 4. Detectar si hay URLs sospechosas (no de trekkingar.com)
  const urlPattern = /https?:\/\/(?!.*trekkingar\.com)[^\s]+/gi;
  const suspiciousUrls = filteredResponse.match(urlPattern);
  if (suspiciousUrls && suspiciousUrls.length > 0) {
    warnings.push({
      type: 'suspicious_url',
      urls: suspiciousUrls,
    });
    // Eliminar URLs sospechosas
    filteredResponse = filteredResponse.replace(urlPattern, '[ENLACE ELIMINADO]');
  }

  return {
    isValid,
    filteredResponse,
    warnings,
  };
}

/**
 * Detecta intentos de jailbreak o prompt injection en el mensaje del usuario
 * @param {string} message - Mensaje del usuario
 * @returns {Object} - { isSuspicious: boolean, matches: Array, riskLevel: string }
 */
export function detectJailbreakAttempt(message) {
  const messageLower = message.toLowerCase();
  const matches = [];

  for (const keyword of JAILBREAK_KEYWORDS) {
    if (messageLower.includes(keyword.toLowerCase())) {
      matches.push(keyword);
    }
  }

  // Detectar si hay múltiples saltos de línea (intento de separar instrucciones)
  const newlineCount = (message.match(/\n/g) || []).length;
  if (newlineCount > 5) {
    matches.push('excessive_newlines');
  }

  // Detectar si hay múltiples menciones a "system", "assistant", "user" (roles)
  const roleCount = (messageLower.match(/\b(system|assistant|user|role)\b/g) || []).length;
  if (roleCount > 3) {
    matches.push('role_manipulation_attempt');
  }

  // Calcular nivel de riesgo
  let riskLevel = 'low';
  if (matches.length >= 3) {
    riskLevel = 'high';
  } else if (matches.length >= 1) {
    riskLevel = 'medium';
  }

  return {
    isSuspicious: matches.length > 0,
    matches,
    riskLevel,
    matchCount: matches.length,
  };
}

/**
 * Obtiene una respuesta de fallback apropiada según el contexto
 * @param {string} userMessage - Mensaje del usuario
 * @param {string} errorType - Tipo de error que causó el fallback
 * @returns {string} - Respuesta de fallback
 */
export function getFallbackResponse(userMessage = '', errorType = 'default') {
  const messageLower = userMessage.toLowerCase();

  // Si es un error de API, devolver respuesta de error
  if (errorType === 'api_error') {
    return FALLBACK_RESPONSES.error;
  }

  // Detectar intención del usuario basado en palabras clave
  if (messageLower.match(/\b(hola|hello|hi|buenos|buenas)\b/)) {
    return FALLBACK_RESPONSES.greeting;
  }

  if (messageLower.match(/\b(viaje|trek|excursi[oó]n|aventura)\b/)) {
    return FALLBACK_RESPONSES.trips;
  }

  if (messageLower.match(/\b(reserv[ar]|compr[ar]|adquirir|comprar)\b/)) {
    return FALLBACK_RESPONSES.booking;
  }

  if (messageLower.match(/\b(contacto|tel[eé]fono|email|correo|ubicaci[oó]n|direcci[oó]n)\b/)) {
    return FALLBACK_RESPONSES.contact;
  }

  if (messageLower.match(/\b(precio|costo|cuanto|tarifa)\b/)) {
    return FALLBACK_RESPONSES.prices;
  }

  if (messageLower.match(/\b(dificultad|nivel|f[aá]cil|dif[ií]cil)\b/)) {
    return FALLBACK_RESPONSES.difficulty;
  }

  if (messageLower.match(/\b(cancelaci[oó]n|reembolso|devoluci[oó]n|pol[ií]tica)\b/)) {
    return FALLBACK_RESPONSES.policies;
  }

  // Respuesta por defecto
  return FALLBACK_RESPONSES.default;
}

/**
 * Valida que el mensaje del usuario no sea malicioso
 * @param {string} message - Mensaje del usuario
 * @returns {Object} - { isValid: boolean, reason: string }
 */
export function validateUserMessage(message) {
  if (!message || typeof message !== 'string') {
    return { isValid: false, reason: 'Mensaje inválido' };
  }

  // Límite de caracteres (evitar ataques de DOS)
  if (message.length > 1000) {
    return { isValid: false, reason: 'Mensaje demasiado largo (máx 1000 caracteres)' };
  }

  // Detectar caracteres sospechosos (inyección)
  const suspiciousChars = /[<>{}[\]\\]/g;
  if (suspiciousChars.test(message)) {
    return { isValid: false, reason: 'Mensaje contiene caracteres no permitidos' };
  }

  return { isValid: true };
}

export default {
  filterBotResponse,
  detectJailbreakAttempt,
  getFallbackResponse,
  validateUserMessage,
  FALLBACK_RESPONSES,
};
