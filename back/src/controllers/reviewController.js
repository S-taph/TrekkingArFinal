/**
 * Review Controller
 *
 * Controlador para manejo de reviews (comentarios y valoraciones de viajes)
 */

import { validationResult } from "express-validator";
import { Review, Viaje } from "../models/associations.js";
import { Op } from "sequelize";

/**
 * Obtiene todas las reviews con filtros opcionales
 */
export const getReviews = async (req, res) => {
  try {
    const {
      viajeId,
      activo,
      limit = 10,
      page = 1,
      minRating,
      maxRating
    } = req.query;

    const offset = (page - 1) * limit;

    // Construir filtros
    const where = {};

    // Por defecto, solo mostrar reviews activos
    if (activo !== undefined) {
      where.activo = activo === 'true' || activo === true;
    } else {
      where.activo = true; // Default: solo activos
    }

    if (viajeId) {
      where.id_viaje = parseInt(viajeId);
    }

    if (minRating || maxRating) {
      where.rating = {};
      if (minRating) where.rating[Op.gte] = parseInt(minRating);
      if (maxRating) where.rating[Op.lte] = parseInt(maxRating);
    }

    // Obtener reviews con paginación
    const { count, rows: reviews } = await Review.findAndCountAll({
      where,
      include: [
        {
          model: Viaje,
          as: 'viaje',
          attributes: ['id_viaje', 'titulo'],
          required: false
        }
      ],
      order: [['fecha_creacion', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error obteniendo reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Obtiene una review por ID
 */
export const getReviewById = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findByPk(id, {
      include: [
        {
          model: Viaje,
          as: 'viaje',
          attributes: ['id_viaje', 'titulo', 'descripcion_corta']
        }
      ]
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review no encontrado'
      });
    }

    res.json({
      success: true,
      data: { review }
    });

  } catch (error) {
    console.error('Error obteniendo review:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Crea una nueva review
 */
export const createReview = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array()
      });
    }

    const {
      nombre,
      ubicacion,
      comentario,
      rating,
      id_viaje
    } = req.body;

    // Validar que el viaje existe si se especifica
    if (id_viaje) {
      const viaje = await Viaje.findByPk(id_viaje);
      if (!viaje) {
        return res.status(404).json({
          success: false,
          message: 'Viaje no encontrado'
        });
      }
    }

    const nuevaReview = await Review.create({
      nombre,
      ubicacion: ubicacion || null,
      comentario,
      rating: parseInt(rating),
      id_viaje: id_viaje ? parseInt(id_viaje) : null,
      activo: true
    });

    res.status(201).json({
      success: true,
      message: 'Review creado exitosamente',
      data: { review: nuevaReview }
    });

  } catch (error) {
    console.error('Error creando review:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Actualiza una review existente
 */
export const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array()
      });
    }

    const review = await Review.findByPk(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review no encontrado'
      });
    }

    const {
      nombre,
      ubicacion,
      comentario,
      rating,
      id_viaje,
      activo
    } = req.body;

    // Validar viaje si se especifica
    if (id_viaje) {
      const viaje = await Viaje.findByPk(id_viaje);
      if (!viaje) {
        return res.status(404).json({
          success: false,
          message: 'Viaje no encontrado'
        });
      }
    }

    await review.update({
      nombre: nombre || review.nombre,
      ubicacion: ubicacion !== undefined ? ubicacion : review.ubicacion,
      comentario: comentario || review.comentario,
      rating: rating ? parseInt(rating) : review.rating,
      id_viaje: id_viaje !== undefined ? (id_viaje ? parseInt(id_viaje) : null) : review.id_viaje,
      activo: activo !== undefined ? activo : review.activo
    });

    res.json({
      success: true,
      message: 'Review actualizado exitosamente',
      data: { review }
    });

  } catch (error) {
    console.error('Error actualizando review:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Elimina una review (soft delete)
 */
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findByPk(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review no encontrado'
      });
    }

    // Soft delete: marcar como inactivo
    await review.update({ activo: false });

    res.json({
      success: true,
      message: 'Review eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando review:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Obtiene estadísticas de reviews para un viaje
 */
export const getReviewStats = async (req, res) => {
  try {
    const { viajeId } = req.params;

    const viaje = await Viaje.findByPk(viajeId);
    if (!viaje) {
      return res.status(404).json({
        success: false,
        message: 'Viaje no encontrado'
      });
    }

    const reviews = await Review.findAll({
      where: {
        id_viaje: viajeId,
        activo: true
      }
    });

    const totalReviews = reviews.length;
    const avgRating = totalReviews > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;

    const ratingDistribution = {
      5: reviews.filter(r => r.rating === 5).length,
      4: reviews.filter(r => r.rating === 4).length,
      3: reviews.filter(r => r.rating === 3).length,
      2: reviews.filter(r => r.rating === 2).length,
      1: reviews.filter(r => r.rating === 1).length,
    };

    res.json({
      success: true,
      data: {
        totalReviews,
        avgRating: Math.round(avgRating * 10) / 10,
        ratingDistribution
      }
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};
