import Groq from 'groq-sdk';
import { Viaje, Categoria } from '../models/associations.js';
import auditService from '../services/auditService.js';
import {
  filterBotResponse,
  detectJailbreakAttempt,
  getFallbackResponse,
  validateUserMessage,
} from '../utils/chatbotSecurity.js';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * Procesa un mensaje del chatbot y devuelve una respuesta usando Groq
 */
export const sendMessage = async (req, res) => {
  const startTime = Date.now();
  let botResponse = '';
  let usedFallback = false;

  try {
    const { message, conversationHistory = [] } = req.body;

    // Validación básica del mensaje
    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'El mensaje no puede estar vacío',
      });
    }

    // 1. VALIDAR MENSAJE DEL USUARIO (longitud, caracteres sospechosos)
    const messageValidation = validateUserMessage(message);
    if (!messageValidation.isValid) {
      // Log de intento sospechoso
      await auditService.log({
        id_usuario: req.user?.id_usuarios || 0,
        accion: 'Chatbot - Mensaje rechazado',
        tipo_accion: 'read',
        recurso: 'chatbot',
        ip_address: auditService.getClientIp(req),
        user_agent: req.headers['user-agent'],
        estado: 'warning',
        mensaje: messageValidation.reason,
        detalles: {
          message: message.substring(0, 100),
          reason: messageValidation.reason,
        },
      });

      return res.status(400).json({
        success: false,
        message: messageValidation.reason,
      });
    }

    // 2. DETECTAR INTENTOS DE JAILBREAK
    const jailbreakCheck = detectJailbreakAttempt(message);
    if (jailbreakCheck.isSuspicious) {
      // Log de intento de jailbreak
      await auditService.log({
        id_usuario: req.user?.id_usuarios || 0,
        accion: 'Chatbot - Intento de jailbreak detectado',
        tipo_accion: 'read',
        recurso: 'chatbot',
        ip_address: auditService.getClientIp(req),
        user_agent: req.headers['user-agent'],
        estado: 'warning',
        mensaje: `Detectado intento de manipulación del prompt (riesgo: ${jailbreakCheck.riskLevel})`,
        detalles: {
          message: message.substring(0, 200),
          matches: jailbreakCheck.matches,
          riskLevel: jailbreakCheck.riskLevel,
          matchCount: jailbreakCheck.matchCount,
        },
      });

      // Si el riesgo es alto, rechazar el mensaje
      if (jailbreakCheck.riskLevel === 'high') {
        return res.status(400).json({
          success: false,
          message: 'Tu mensaje contiene patrones no permitidos. Por favor, reformula tu pregunta.',
        });
      }
    }

    // Obtener información de viajes disponibles para el contexto
    const viajes = await Viaje.findAll({
      where: { activo: true },
      include: [{ model: Categoria, as: 'categoria' }],
      attributes: ['titulo', 'descripcion_corta', 'dificultad', 'duracion_dias', 'precio_base', 'destino'],
      limit: 10,
    });

    // Construir resumen de viajes para el contexto
    const viajesInfo = viajes.map(v =>
      `- ${v.titulo} (${v.destino}): ${v.dificultad}, ${v.duracion_dias} días, desde $${v.precio_base}`
    ).join('\n');

    // Contexto del sistema para el chatbot de TrekkingAR
    const systemContext = `Eres un asistente virtual amigable y profesional de TrekkingAR, una empresa de turismo de aventura especializada en trekkings y excursiones de montaña en Argentina.

INFORMACIÓN DE VIAJES DISPONIBLES:
${viajesInfo}

INFORMACIÓN DE CONTACTO:
- Email: info@trekkingar.com
- Teléfono: +54 294 442-8765
- WhatsApp: +54 9 294 442-8765 (disponible 24/7)
- Ubicación: San Carlos de Bariloche, Río Negro, Argentina

HORARIOS DE ATENCIÓN:
- Lunes a Viernes: 9:00 - 18:00
- Sábados: 9:00 - 13:00
- Domingos: Cerrado

Tu objetivo es ayudar a los clientes con:
- Información sobre viajes y trekkings disponibles
- Detalles sobre dificultad, duración y precios
- Proceso de reserva y políticas de cancelación
- Recomendaciones de viajes según el nivel de experiencia
- Información general sobre la empresa

Debes:
- Ser amable, profesional y entusiasta
- Usar lenguaje claro y accesible
- Proporcionar información precisa basada en los datos disponibles
- Si necesitan información detallada o hacer una reserva, guíalos al catálogo del sitio web
- Mantener las respuestas concisas pero informativas

NO debes:
- Inventar viajes o información que no está en los datos disponibles
- Hacer promesas sobre disponibilidad de cupos sin verificar
- Procesar pagos o reservas directamente (guiar al usuario al sistema de reservas)
- Compartir información sensible de usuarios, contraseñas o datos internos`;

    // Construir el array de mensajes para Groq
    const messages = [
      {
        role: 'system',
        content: systemContext,
      },
      ...conversationHistory.map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content,
      })),
      {
        role: 'user',
        content: message,
      },
    ];

    // 3. LLAMAR A LA API DE GROQ CON FALLBACK
    try {
      const chatCompletion = await groq.chat.completions.create({
        messages,
        model: process.env.LLAMA_MODEL || 'llama-3.1-8b-instant',
        temperature: 0.7,
        max_tokens: 500,
        top_p: 1,
      });

      botResponse = chatCompletion.choices[0]?.message?.content ||
        getFallbackResponse(message, 'api_error');

      // Si no hay respuesta válida, usar fallback
      if (!botResponse || botResponse.trim() === '') {
        botResponse = getFallbackResponse(message, 'api_error');
        usedFallback = true;
      }

    } catch (apiError) {
      console.error('[Chatbot] Error en API de Groq:', apiError.message);

      // 4. FALLBACK: Si la API falla, usar respuesta predefinida
      botResponse = getFallbackResponse(message, 'api_error');
      usedFallback = true;

      // Log del error de API
      await auditService.log({
        id_usuario: req.user?.id_usuarios || 0,
        accion: 'Chatbot - Error de API (fallback usado)',
        tipo_accion: 'read',
        recurso: 'chatbot',
        ip_address: auditService.getClientIp(req),
        user_agent: req.headers['user-agent'],
        estado: 'warning',
        mensaje: `Error en Groq API: ${apiError.message}`,
        detalles: {
          error: apiError.message,
          usedFallback: true,
          message: message.substring(0, 100),
        },
      });
    }

    // 5. CONTENT FILTERING: Validar la respuesta antes de enviarla
    const filterResult = filterBotResponse(botResponse, message);

    if (!filterResult.isValid || filterResult.warnings.length > 0) {
      // Log de respuesta filtrada
      await auditService.log({
        id_usuario: req.user?.id_usuarios || 0,
        accion: 'Chatbot - Respuesta filtrada',
        tipo_accion: 'read',
        recurso: 'chatbot',
        ip_address: auditService.getClientIp(req),
        user_agent: req.headers['user-agent'],
        estado: 'warning',
        mensaje: 'Respuesta del bot contenía información sensible o sospechosa',
        detalles: {
          warnings: filterResult.warnings,
          originalLength: botResponse.length,
          filteredLength: filterResult.filteredResponse.length,
          userMessage: message.substring(0, 100),
        },
      });

      // Usar la respuesta filtrada
      botResponse = filterResult.filteredResponse;
    }

    // 6. LOG DE CONVERSACIÓN EXITOSA (solo si no hubo problemas graves)
    const responseTime = Date.now() - startTime;
    await auditService.log({
      id_usuario: req.user?.id_usuarios || 0,
      accion: 'Chatbot - Conversación',
      tipo_accion: 'read',
      recurso: 'chatbot',
      ip_address: auditService.getClientIp(req),
      user_agent: req.headers['user-agent'],
      estado: 'success',
      mensaje: `Respuesta generada en ${responseTime}ms${usedFallback ? ' (fallback)' : ''}`,
      detalles: {
        userMessage: message.substring(0, 100),
        responseLength: botResponse.length,
        responseTime,
        usedFallback,
        hadWarnings: filterResult.warnings.length > 0,
        jailbreakRisk: jailbreakCheck.isSuspicious ? jailbreakCheck.riskLevel : 'none',
      },
    });

    res.json({
      success: true,
      data: {
        response: botResponse,
      },
    });

  } catch (error) {
    console.error('[Chatbot] Error general:', error);

    // Log del error crítico
    await auditService.log({
      id_usuario: req.user?.id_usuarios || 0,
      accion: 'Chatbot - Error crítico',
      tipo_accion: 'read',
      recurso: 'chatbot',
      ip_address: auditService.getClientIp(req),
      user_agent: req.headers['user-agent'],
      estado: 'failure',
      mensaje: `Error no manejado: ${error.message}`,
      detalles: {
        error: error.message,
        stack: error.stack?.substring(0, 500),
      },
    });

    // Error específico de Groq API
    if (error.status === 401) {
      return res.json({
        success: true,
        data: {
          response: getFallbackResponse(req.body?.message || '', 'api_error'),
        },
      });
    }

    // Para cualquier otro error, devolver fallback en lugar de error 500
    res.json({
      success: true,
      data: {
        response: getFallbackResponse(req.body?.message || '', 'api_error'),
      },
    });
  }
};
