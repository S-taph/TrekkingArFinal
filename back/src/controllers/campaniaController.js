import Campania from '../models/Campania.js'
import Suscriptor from '../models/Suscriptor.js'
import CampaniaSuscriptor from '../models/CampaniaSuscriptor.js'
import emailService from '../services/emailService.js'

/**
 * Obtener todas las campañas
 * GET /api/campanias
 */
export const getCampanias = async (req, res) => {
  try {
    const { activa, enviada, page = 1, limit = 20 } = req.query

    const where = {}
    if (activa !== undefined) {
      where.activa = activa === 'true'
    }
    if (enviada !== undefined) {
      where.enviada = enviada === 'true'
    }

    const offset = (page - 1) * limit

    const { count, rows: campanias } = await Campania.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['fecha_creacion', 'DESC']]
    })

    res.status(200).json({
      success: true,
      data: campanias,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit),
        limit: parseInt(limit)
      }
    })
  } catch (error) {
    console.error('Error en getCampanias:', error)
    res.status(500).json({
      success: false,
      message: 'Error al obtener campañas',
      error: error.message
    })
  }
}

/**
 * Obtener una campaña por ID
 * GET /api/campanias/:id
 */
export const getCampaniaById = async (req, res) => {
  try {
    const { id } = req.params

    const campania = await Campania.findByPk(id)

    if (!campania) {
      return res.status(404).json({
        success: false,
        message: 'Campaña no encontrada'
      })
    }

    res.status(200).json({
      success: true,
      data: campania
    })
  } catch (error) {
    console.error('Error en getCampaniaById:', error)
    res.status(500).json({
      success: false,
      message: 'Error al obtener campaña',
      error: error.message
    })
  }
}

/**
 * Crear una nueva campaña
 * POST /api/campanias
 */
export const createCampania = async (req, res) => {
  try {
    const {
      nombre,
      descripcion,
      asunto,
      cuerpo,
      tipo_campania = 'informativa',
      descuento_porcentaje,
      codigo_descuento,
      fecha_inicio,
      fecha_fin,
      imagen_campania
    } = req.body

    // Validaciones
    if (!nombre || !asunto || !cuerpo) {
      return res.status(400).json({
        success: false,
        message: 'Nombre, asunto y cuerpo son requeridos'
      })
    }

    const campania = await Campania.create({
      nombre,
      descripcion,
      asunto,
      cuerpo,
      tipo_campania,
      descuento_porcentaje,
      codigo_descuento,
      fecha_inicio,
      fecha_fin,
      imagen_campania,
      activa: true,
      enviada: false,
      total_enviados: 0
    })

    res.status(201).json({
      success: true,
      message: 'Campaña creada exitosamente',
      data: campania
    })
  } catch (error) {
    console.error('Error en createCampania:', error)
    res.status(500).json({
      success: false,
      message: 'Error al crear campaña',
      error: error.message
    })
  }
}

/**
 * Actualizar una campaña
 * PUT /api/campanias/:id
 */
export const updateCampania = async (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body

    const campania = await Campania.findByPk(id)

    if (!campania) {
      return res.status(404).json({
        success: false,
        message: 'Campaña no encontrada'
      })
    }

    if (campania.enviada) {
      return res.status(400).json({
        success: false,
        message: 'No se puede editar una campaña que ya fue enviada'
      })
    }

    await campania.update(updates)

    res.status(200).json({
      success: true,
      message: 'Campaña actualizada exitosamente',
      data: campania
    })
  } catch (error) {
    console.error('Error en updateCampania:', error)
    res.status(500).json({
      success: false,
      message: 'Error al actualizar campaña',
      error: error.message
    })
  }
}

/**
 * Eliminar una campaña
 * DELETE /api/campanias/:id
 */
export const deleteCampania = async (req, res) => {
  try {
    const { id } = req.params

    const campania = await Campania.findByPk(id)

    if (!campania) {
      return res.status(404).json({
        success: false,
        message: 'Campaña no encontrada'
      })
    }

    if (campania.enviada) {
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar una campaña que ya fue enviada'
      })
    }

    await campania.destroy()

    res.status(200).json({
      success: true,
      message: 'Campaña eliminada exitosamente'
    })
  } catch (error) {
    console.error('Error en deleteCampania:', error)
    res.status(500).json({
      success: false,
      message: 'Error al eliminar campaña',
      error: error.message
    })
  }
}

/**
 * Enviar campaña a todos los suscriptores activos
 * POST /api/campanias/:id/send
 *
 * Implementa batch processing para evitar saturar Gmail
 */
export const sendCampania = async (req, res) => {
  try {
    const { id } = req.params

    const campania = await Campania.findByPk(id)

    if (!campania) {
      return res.status(404).json({
        success: false,
        message: 'Campaña no encontrada'
      })
    }

    if (campania.enviada) {
      return res.status(400).json({
        success: false,
        message: 'Esta campaña ya fue enviada'
      })
    }

    // Obtener todos los suscriptores activos
    const suscriptores = await Suscriptor.findAll({
      where: { activo: true }
    })

    if (suscriptores.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No hay suscriptores activos para enviar la campaña'
      })
    }

    // Responder inmediatamente al cliente
    res.status(200).json({
      success: true,
      message: `Enviando campaña a ${suscriptores.length} suscriptores. El proceso continuará en segundo plano.`,
      data: {
        total_suscriptores: suscriptores.length
      }
    })

    // Procesar envíos en segundo plano
    processEmailBatch(campania, suscriptores)
  } catch (error) {
    console.error('Error en sendCampania:', error)
    res.status(500).json({
      success: false,
      message: 'Error al enviar campaña',
      error: error.message
    })
  }
}

/**
 * Procesa el envío de emails en batches para evitar rate limiting
 * @param {Object} campania - Campaña a enviar
 * @param {Array} suscriptores - Lista de suscriptores
 */
async function processEmailBatch(campania, suscriptores) {
  const BATCH_SIZE = 50 // Enviar 50 emails por batch
  const DELAY_BETWEEN_BATCHES = 5000 // 5 segundos entre batches

  let enviados = 0
  let errores = 0

  console.log(`📧 Iniciando envío de campaña "${campania.nombre}" a ${suscriptores.length} suscriptores`)

  for (let i = 0; i < suscriptores.length; i += BATCH_SIZE) {
    const batch = suscriptores.slice(i, i + BATCH_SIZE)

    // Procesar batch en paralelo
    const resultados = await Promise.allSettled(
      batch.map(async (suscriptor) => {
        try {
          await emailService.sendNewsletterCampaign(suscriptor, campania)

          // Registrar envío exitoso
          await CampaniaSuscriptor.create({
            id_campania: campania.id_campania,
            id_suscriptor: suscriptor.id_suscriptor,
            entregada: true,
            fecha_entrega: new Date()
          })

          return { success: true, email: suscriptor.email }
        } catch (error) {
          // Registrar error de envío
          await CampaniaSuscriptor.create({
            id_campania: campania.id_campania,
            id_suscriptor: suscriptor.id_suscriptor,
            entregada: false,
            error_envio: error.message
          })

          throw error
        }
      })
    )

    // Contar exitosos y fallidos
    resultados.forEach((resultado) => {
      if (resultado.status === 'fulfilled') {
        enviados++
      } else {
        errores++
        console.error('Error enviando email:', resultado.reason)
      }
    })

    console.log(`📊 Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${enviados} enviados, ${errores} errores`)

    // Esperar antes del siguiente batch (excepto en el último)
    if (i + BATCH_SIZE < suscriptores.length) {
      await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES))
    }
  }

  // Actualizar campaña
  await campania.update({
    enviada: true,
    fecha_envio: new Date(),
    total_enviados: enviados
  })

  console.log(`✅ Campaña "${campania.nombre}" completada: ${enviados} enviados, ${errores} errores`)
}

/**
 * Obtener estadísticas de una campaña
 * GET /api/campanias/:id/stats
 */
export const getCampaniaStats = async (req, res) => {
  try {
    const { id } = req.params

    const campania = await Campania.findByPk(id)

    if (!campania) {
      return res.status(404).json({
        success: false,
        message: 'Campaña no encontrada'
      })
    }

    const stats = await CampaniaSuscriptor.findAll({
      where: { id_campania: id },
      attributes: [
        [CampaniaSuscriptor.sequelize.fn('COUNT', CampaniaSuscriptor.sequelize.col('id_campania_suscriptor')), 'total'],
        [CampaniaSuscriptor.sequelize.fn('SUM', CampaniaSuscriptor.sequelize.literal('CASE WHEN entregada = 1 THEN 1 ELSE 0 END')), 'entregados'],
        [CampaniaSuscriptor.sequelize.fn('SUM', CampaniaSuscriptor.sequelize.literal('CASE WHEN abierta = 1 THEN 1 ELSE 0 END')), 'abiertos'],
        [CampaniaSuscriptor.sequelize.fn('SUM', CampaniaSuscriptor.sequelize.literal('CASE WHEN clickeada = 1 THEN 1 ELSE 0 END')), 'clickeados']
      ],
      raw: true
    })

    const data = stats[0] || { total: 0, entregados: 0, abiertos: 0, clickeados: 0 }

    res.status(200).json({
      success: true,
      data: {
        campania: {
          id: campania.id_campania,
          nombre: campania.nombre,
          enviada: campania.enviada,
          fecha_envio: campania.fecha_envio
        },
        stats: {
          total: parseInt(data.total) || 0,
          entregados: parseInt(data.entregados) || 0,
          abiertos: parseInt(data.abiertos) || 0,
          clickeados: parseInt(data.clickeados) || 0,
          tasa_apertura: data.entregados > 0 ? ((data.abiertos / data.entregados) * 100).toFixed(2) : 0,
          tasa_clicks: data.abiertos > 0 ? ((data.clickeados / data.abiertos) * 100).toFixed(2) : 0
        }
      }
    })
  } catch (error) {
    console.error('Error en getCampaniaStats:', error)
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message
    })
  }
}
