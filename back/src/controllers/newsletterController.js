import { Op } from 'sequelize'
import Suscriptor from '../models/Suscriptor.js'
import { generateToken } from '../utils/tokenUtils.js'
import emailService from '../services/emailService.js'

/**
 * Suscribir un email al newsletter
 * POST /api/newsletter/subscribe
 */
export const subscribe = async (req, res) => {
  try {
    const { email, nombre, origen = 'web' } = req.body

    // Validaciones
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'El email es requerido'
      })
    }

    // Verificar si el email ya está suscrito
    let suscriptor = await Suscriptor.findOne({ where: { email } })

    if (suscriptor) {
      if (suscriptor.activo) {
        return res.status(400).json({
          success: false,
          message: 'Este email ya está suscrito a nuestro newsletter'
        })
      } else {
        // Reactivar suscripción
        suscriptor.activo = true
        suscriptor.fecha_suscripcion = new Date()
        suscriptor.fecha_desuscripcion = null
        suscriptor.token_desuscripcion = generateToken()
        await suscriptor.save()

        return res.status(200).json({
          success: true,
          message: '¡Bienvenido de nuevo! Tu suscripción ha sido reactivada'
        })
      }
    }

    // Crear nueva suscripción
    const token = generateToken()
    suscriptor = await Suscriptor.create({
      email,
      nombre,
      origen,
      activo: true,
      token_desuscripcion: token,
      fecha_suscripcion: new Date()
    })

    // Enviar email de confirmación
    try {
      await emailService.sendNewsletterConfirmationEmail(suscriptor)
    } catch (emailError) {
      console.error('Error enviando email de confirmación:', emailError)
      // No falla la suscripción si el email no se envía
    }

    res.status(201).json({
      success: true,
      message: '¡Gracias por suscribirte! Recibirás nuestras novedades en tu email',
      data: {
        email: suscriptor.email,
        fecha_suscripcion: suscriptor.fecha_suscripcion
      }
    })
  } catch (error) {
    console.error('Error en subscribe:', error)
    res.status(500).json({
      success: false,
      message: 'Error al procesar la suscripción',
      error: error.message
    })
  }
}

/**
 * Desuscribir un email del newsletter
 * GET /api/newsletter/unsubscribe/:token
 */
export const unsubscribe = async (req, res) => {
  try {
    const { token } = req.params

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token de desuscripción no válido'
      })
    }

    const suscriptor = await Suscriptor.findOne({
      where: { token_desuscripcion: token }
    })

    if (!suscriptor) {
      return res.status(404).json({
        success: false,
        message: 'Suscripción no encontrada'
      })
    }

    if (!suscriptor.activo) {
      return res.status(400).json({
        success: false,
        message: 'Este email ya está desuscrito'
      })
    }

    // Desactivar suscripción
    suscriptor.activo = false
    suscriptor.fecha_desuscripcion = new Date()
    await suscriptor.save()

    res.status(200).json({
      success: true,
      message: 'Te has desuscrito exitosamente de nuestro newsletter'
    })
  } catch (error) {
    console.error('Error en unsubscribe:', error)
    res.status(500).json({
      success: false,
      message: 'Error al procesar la desuscripción',
      error: error.message
    })
  }
}

/**
 * Obtener lista de suscriptores (solo admin)
 * GET /api/newsletter/suscriptores
 */
export const getSuscriptores = async (req, res) => {
  try {
    const { activo, origen, page = 1, limit = 50 } = req.query

    const where = {}
    if (activo !== undefined) {
      where.activo = activo === 'true'
    }
    if (origen) {
      where.origen = origen
    }

    const offset = (page - 1) * limit

    const { count, rows: suscriptores } = await Suscriptor.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['fecha_suscripcion', 'DESC']],
      attributes: [
        'id_suscriptor',
        'email',
        'nombre',
        'activo',
        'origen',
        'fecha_suscripcion',
        'fecha_desuscripcion'
      ]
    })

    res.status(200).json({
      success: true,
      data: suscriptores,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit),
        limit: parseInt(limit)
      }
    })
  } catch (error) {
    console.error('Error en getSuscriptores:', error)
    res.status(500).json({
      success: false,
      message: 'Error al obtener suscriptores',
      error: error.message
    })
  }
}

/**
 * Obtener estadísticas de suscriptores (solo admin)
 * GET /api/newsletter/stats
 */
export const getStats = async (req, res) => {
  try {
    const totalSuscriptores = await Suscriptor.count()
    const suscriptoresActivos = await Suscriptor.count({ where: { activo: true } })
    const suscriptoresInactivos = await Suscriptor.count({ where: { activo: false } })

    // Suscripciones por origen
    const porOrigen = await Suscriptor.findAll({
      attributes: [
        'origen',
        [Suscriptor.sequelize.fn('COUNT', Suscriptor.sequelize.col('id_suscriptor')), 'total']
      ],
      group: ['origen'],
      where: { activo: true }
    })

    // Suscripciones del último mes
    const unMesAtras = new Date()
    unMesAtras.setMonth(unMesAtras.getMonth() - 1)

    const nuevasSuscripciones = await Suscriptor.count({
      where: {
        fecha_suscripcion: {
          [Op.gte]: unMesAtras
        }
      }
    })

    res.status(200).json({
      success: true,
      data: {
        total: totalSuscriptores,
        activos: suscriptoresActivos,
        inactivos: suscriptoresInactivos,
        porOrigen: porOrigen.map(item => ({
          origen: item.origen,
          total: parseInt(item.dataValues.total)
        })),
        nuevasUltimoMes: nuevasSuscripciones
      }
    })
  } catch (error) {
    console.error('Error en getStats:', error)
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message
    })
  }
}
