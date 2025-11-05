import express from 'express';
import rateLimit from 'express-rate-limit';
import { sendMessage } from '../controllers/chatbotController.js';

const router = express.Router();

/**
 * Rate limiter específico para el chatbot
 * Más estricto que el rate limiter global para prevenir abuso
 *
 * Límites:
 * - 30 mensajes por hora por IP
 * - Esto permite conversaciones naturales pero previene spam
 */
const chatbotLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 30, // 30 mensajes por hora
  message: {
    success: false,
    message: 'Has alcanzado el límite de mensajes por hora. Por favor, intenta de nuevo más tarde o contáctanos directamente por WhatsApp al +54 9 294 442-8765.',
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  // Clave única por IP para rastrear límites por usuario
  keyGenerator: (req) => {
    // Usar IP real considerando proxies
    return (
      req.headers['x-forwarded-for']?.split(',')[0].trim() ||
      req.headers['x-real-ip'] ||
      req.ip ||
      'unknown'
    );
  },
  // Handler personalizado para cuando se alcanza el límite
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Has enviado demasiados mensajes. Por favor, espera un momento antes de continuar.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000), // Segundos hasta reset
    });
  },
  // Saltar rate limit para usuarios autenticados admin (opcional)
  skip: (req) => {
    return req.user?.rol === 'admin';
  },
});

/**
 * POST /api/chatbot
 * Envía un mensaje al chatbot y recibe una respuesta
 *
 * Body:
 * - message: string (requerido) - El mensaje del usuario
 * - conversationHistory: array (opcional) - Historial de conversación
 *
 * Rate Limit: 30 mensajes por hora por IP
 */
router.post('/', chatbotLimiter, sendMessage);

export default router;
