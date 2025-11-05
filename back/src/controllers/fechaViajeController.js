/**
 * FechaViaje Controller
 *
 * Controlador para manejo de fechas de salida de viajes.
 * Gestiona múltiples fechas para cada viaje.
 */

import { validationResult } from "express-validator";
import { FechaViaje, Viaje } from "../models/associations.js";

/**
 * Obtiene todas las fechas de un viaje específico
 */
export const getFechasByViaje = async (req, res) => {
  try {
    const { viajeId } = req.params;

    // Verificar que el viaje existe
    const viaje = await Viaje.findByPk(viajeId);
    if (!viaje) {
      return res.status(404).json({
        success: false,
        message: 'Viaje no encontrado'
      });
    }

    // Obtener fechas del viaje ordenadas por fecha de inicio
    const fechas = await FechaViaje.findAll({
      where: { id_viaje: viajeId },
      order: [['fecha_inicio', 'ASC']]
    });

    res.json({
      success: true,
      data: {
        fechas: fechas
      }
    });

  } catch (error) {
    console.error('Error obteniendo fechas del viaje:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Crea una nueva fecha para un viaje
 */
export const createFechaViaje = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array()
      });
    }

    const { viajeId } = req.params;
    const {
      fecha_inicio,
      fecha_fin,
      cupos_disponibles,
      precio_fecha,
      observaciones
    } = req.body;

    // Verificar que el viaje existe
    const viaje = await Viaje.findByPk(viajeId);
    if (!viaje) {
      return res.status(404).json({
        success: false,
        message: 'Viaje no encontrado'
      });
    }

    // Validar que fecha_inicio sea anterior a fecha_fin
    if (new Date(fecha_inicio) >= new Date(fecha_fin)) {
      return res.status(400).json({
        success: false,
        message: 'La fecha de inicio debe ser anterior a la fecha de fin'
      });
    }

    // Crear la fecha de viaje
    const nuevaFecha = await FechaViaje.create({
      id_viaje: viajeId,
      fecha_inicio: fecha_inicio,
      fecha_fin: fecha_fin,
      cupos_disponibles: cupos_disponibles || 10,
      cupos_ocupados: 0,
      precio_fecha: precio_fecha || null,
      estado_fecha: 'disponible',
      observaciones: observaciones || null
    });

    res.status(201).json({
      success: true,
      message: 'Fecha de viaje creada exitosamente',
      data: {
        fecha: nuevaFecha
      }
    });

  } catch (error) {
    console.error('Error creando fecha de viaje:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Actualiza una fecha de viaje existente
 */
export const updateFechaViaje = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array()
      });
    }

    const { viajeId, fechaId } = req.params;
    const {
      fecha_inicio,
      fecha_fin,
      cupos_disponibles,
      precio_fecha,
      estado_fecha,
      observaciones
    } = req.body;

    // Buscar la fecha de viaje
    const fechaViaje = await FechaViaje.findOne({
      where: {
        id_fechas_viaje: fechaId,
        id_viaje: viajeId
      }
    });

    if (!fechaViaje) {
      return res.status(404).json({
        success: false,
        message: 'Fecha de viaje no encontrada'
      });
    }

    // Validar que fecha_inicio sea anterior a fecha_fin si se actualizan
    if (fecha_inicio && fecha_fin && new Date(fecha_inicio) >= new Date(fecha_fin)) {
      return res.status(400).json({
        success: false,
        message: 'La fecha de inicio debe ser anterior a la fecha de fin'
      });
    }

    // Actualizar la fecha
    await fechaViaje.update({
      fecha_inicio: fecha_inicio || fechaViaje.fecha_inicio,
      fecha_fin: fecha_fin || fechaViaje.fecha_fin,
      cupos_disponibles: cupos_disponibles !== undefined ? cupos_disponibles : fechaViaje.cupos_disponibles,
      precio_fecha: precio_fecha !== undefined ? precio_fecha : fechaViaje.precio_fecha,
      estado_fecha: estado_fecha || fechaViaje.estado_fecha,
      observaciones: observaciones !== undefined ? observaciones : fechaViaje.observaciones
    });

    res.json({
      success: true,
      message: 'Fecha de viaje actualizada exitosamente',
      data: {
        fecha: fechaViaje
      }
    });

  } catch (error) {
    console.error('Error actualizando fecha de viaje:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Elimina una fecha de viaje
 */
export const deleteFechaViaje = async (req, res) => {
  try {
    const { viajeId, fechaId } = req.params;

    // Buscar la fecha de viaje
    const fechaViaje = await FechaViaje.findOne({
      where: {
        id_fechas_viaje: fechaId,
        id_viaje: viajeId
      }
    });

    if (!fechaViaje) {
      return res.status(404).json({
        success: false,
        message: 'Fecha de viaje no encontrada'
      });
    }

    // Verificar si hay reservas para esta fecha
    if (fechaViaje.cupos_ocupados > 0) {
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar una fecha con reservas activas. Cancele las reservas primero.'
      });
    }

    // Eliminar la fecha
    await fechaViaje.destroy();

    res.json({
      success: true,
      message: 'Fecha de viaje eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando fecha de viaje:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};
