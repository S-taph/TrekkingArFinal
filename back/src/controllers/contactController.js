/**
 * Contact Controller
 *
 * Controlador consolidado para manejo de mensajes de contacto y notificaciones.
 * Incluye envío de emails y notificaciones en tiempo real vía Socket.IO.
 *
 * Usa AdminNotificacion para notificaciones y emailService para emails.
 */

import { validationResult } from "express-validator";
import { MensajeContacto, Usuario } from "../models/associations.js";
import AdminNotificacion from "../models/AdminNotificacion.js";
import emailService from "../services/emailService.js";

/**
 * Envía un mensaje de contacto
 */
export const sendContactMessage = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Datos inválidos',
        errors: errors.array()
      });
    }

    const { nombre, email, asunto, mensaje } = req.body;

    // Crear mensaje de contacto
    const mensajeContacto = await MensajeContacto.create({
      nombre,
      email,
      asunto,
      mensaje,
      estado: 'nuevo'
    });

    // Crear notificación para administradores usando AdminNotificacion
    const notificacion = await AdminNotificacion.create({
      tipo: 'contact_form',
      mensaje: `${nombre} (${email}): ${asunto}`,
      leido: false,
      from_email: email,
      to_admin: true,
      meta: {
        contactoId: mensajeContacto.id,
        nombre: nombre,
        asunto: asunto
      }
    });

    // Enviar email a administradores
    try {
      const emailResult = await emailService.sendContactNotificationToAdmins(mensajeContacto);
      console.log('[Contact] ✅ Notification email sent to admins successfully');
      console.log('[Contact] Email result:', emailResult);
    } catch (emailError) {
      console.error('[Contact] ❌ CRITICAL: Error sending notification email to admins:', emailError);
      console.error('[Contact] Email error details:', {
        contactoId: mensajeContacto.id,
        from: email,
        asunto,
        errorMessage: emailError.message,
        errorStack: emailError.stack
      });
      // No fallar la operación si el email falla
    }

    // Enviar email de confirmación al usuario
    try {
      const confirmationResult = await emailService.sendContactConfirmationToUser(mensajeContacto);
      console.log('[Contact] ✅ Confirmation email sent to user successfully');
      console.log('[Contact] Confirmation email result:', confirmationResult);
    } catch (emailError) {
      console.error('[Contact] ❌ Error sending confirmation email to user:', emailError);
      console.error('[Contact] Confirmation email error details:', {
        contactoId: mensajeContacto.id,
        to: email,
        errorMessage: emailError.message,
        errorStack: emailError.stack
      });
      // No fallar la operación si el email falla
    }

    // Emitir evento Socket.IO para notificaciones en tiempo real
    if (req.io) {
      const adminNamespace = req.io.of('/admin');
      adminNamespace.to('admin').emit('new:notification', {
        id: notificacion.id,
        tipo: notificacion.tipo,
        mensaje: notificacion.mensaje,
        from_email: notificacion.from_email,
        createdAt: notificacion.createdAt,
        meta: notificacion.meta
      });
    }

    res.status(201).json({
      success: true,
      message: 'Mensaje enviado exitosamente',
      data: {
        mensajeId: mensajeContacto.id
      }
    });

  } catch (error) {
    console.error('Error enviando mensaje de contacto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Obtiene todas las notificaciones (solo administradores)
 */
export const getNotificaciones = async (req, res) => {
  try {
    const { leido, tipo, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    // Construir filtros
    const where = {};

    if (leido !== undefined) {
      where.leido = leido === 'true';
    }

    if (tipo) {
      where.tipo = tipo;
    }

    // Obtener notificaciones con paginación
    const { count, rows: notificaciones } = await AdminNotificacion.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Contar notificaciones no leídas
    const notificacionesNoLeidas = await AdminNotificacion.count({
      where: {
        leido: false
      }
    });

    res.json({
      success: true,
      data: {
        notificaciones,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        },
        notificacionesNoLeidas
      }
    });

  } catch (error) {
    console.error('Error obteniendo notificaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Marca una notificación como leída
 */
export const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notificacion = await AdminNotificacion.findByPk(id);

    if (!notificacion) {
      return res.status(404).json({
        success: false,
        message: 'Notificación no encontrada'
      });
    }

    // Actualizar notificación
    await notificacion.update({
      leido: true
    });

    // Emitir evento Socket.IO
    if (req.io) {
      const adminNamespace = req.io.of('/admin');
      adminNamespace.to('admin').emit('notification:read', {
        id: notificacion.id,
        leido: true
      });
    }

    res.json({
      success: true,
      message: 'Notificación marcada como leída',
      data: {
        notificacion
      }
    });

  } catch (error) {
    console.error('Error marcando notificación como leída:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Responde a un mensaje de contacto
 */
export const replyToContact = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Datos inválidos',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { respuesta } = req.body;
    const adminId = req.user.id_usuarios;

    // Buscar la notificación
    const notificacion = await AdminNotificacion.findByPk(id);

    if (!notificacion) {
      return res.status(404).json({
        success: false,
        message: 'Notificación no encontrada'
      });
    }

    if (notificacion.tipo !== 'contact_form') {
      return res.status(400).json({
        success: false,
        message: 'Esta notificación no es un mensaje de contacto'
      });
    }

    // Buscar el mensaje de contacto original
    const mensajeId = notificacion.meta?.contactoId;
    if (!mensajeId) {
      return res.status(400).json({
        success: false,
        message: 'No se encontró el mensaje de contacto original'
      });
    }

    const mensajeContacto = await MensajeContacto.findByPk(mensajeId);

    if (!mensajeContacto) {
      return res.status(404).json({
        success: false,
        message: 'Mensaje de contacto no encontrado'
      });
    }

    // Obtener nombre del admin
    const admin = await Usuario.findByPk(adminId, {
      attributes: ['nombre', 'apellido']
    });
    const adminName = admin ? `${admin.nombre} ${admin.apellido}`.trim() : 'Admin';

    // Actualizar mensaje de contacto
    await mensajeContacto.update({
      estado: 'respondido',
      respuesta: respuesta,
      respondido_por: adminId,
      fecha_respuesta: new Date()
    });

    // Marcar notificación como leída
    await notificacion.update({
      leido: true
    });

    // Enviar email de respuesta al usuario
    try {
      await emailService.sendContactReplyToUser(mensajeContacto, respuesta, adminName);
    } catch (emailError) {
      console.error('Error enviando email de respuesta:', emailError);
      // No fallar la operación si el email falla
    }

    // Emitir evento Socket.IO
    if (req.io) {
      const adminNamespace = req.io.of('/admin');
      adminNamespace.to('admin').emit('notification:replied', {
        id: notificacion.id,
        mensajeId: mensajeContacto.id,
        estado: 'respondido'
      });
    }

    res.json({
      success: true,
      message: 'Respuesta enviada exitosamente',
      data: {
        mensajeContacto,
        notificacion
      }
    });

  } catch (error) {
    console.error('Error respondiendo a mensaje de contacto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Obtiene mensajes de contacto (solo administradores)
 */
export const getMensajesContacto = async (req, res) => {
  try {
    const { estado, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    // Construir filtros
    const where = {};
    if (estado) {
      where.estado = estado;
    }

    // Obtener mensajes con paginación
    const { count, rows: mensajes } = await MensajeContacto.findAndCountAll({
      where,
      order: [['fecha_creacion', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        {
          model: Usuario,
          as: 'adminRespondio',
          attributes: ['id_usuarios', 'nombre', 'apellido', 'email']
        }
      ]
    });

    res.json({
      success: true,
      data: {
        mensajes,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error obteniendo mensajes de contacto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};
