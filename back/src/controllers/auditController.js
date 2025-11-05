import auditService from "../services/auditService.js"
import AuditLog from "../models/AuditLog.js"
import Usuario from "../models/Usuario.js"

/**
 * Obtiene logs de auditoría con filtros opcionales
 */
export const getAuditLogs = async (req, res) => {
  try {
    const {
      tipo_accion,
      recurso,
      estado,
      id_usuario,
      limit = 100,
      offset = 0
    } = req.query

    const where = {}
    if (tipo_accion) where.tipo_accion = tipo_accion
    if (recurso) where.recurso = recurso
    if (estado) where.estado = estado
    if (id_usuario) where.id_usuario = id_usuario

    const logs = await AuditLog.findAndCountAll({
      where,
      include: [
        {
          model: Usuario,
          as: "usuario",
          attributes: ["id_usuarios", "email", "nombre", "apellido", "rol"],
        },
      ],
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    })

    res.json({
      success: true,
      data: {
        logs: logs.rows,
        total: logs.count,
        limit: parseInt(limit),
        offset: parseInt(offset),
      },
    })
  } catch (error) {
    console.error("Error obteniendo logs de auditoría:", error)
    res.status(500).json({
      success: false,
      message: "Error al obtener logs de auditoría",
    })
  }
}

/**
 * Obtiene logs de accesos administrativos
 */
export const getAdminAccessLogs = async (req, res) => {
  try {
    const { limit = 50 } = req.query

    const logs = await AuditLog.findAll({
      where: {
        tipo_accion: ["login", "oauth_login"],
      },
      include: [
        {
          model: Usuario,
          as: "usuario",
          where: {
            rol: "admin",
          },
          attributes: ["id_usuarios", "email", "nombre", "apellido", "rol"],
        },
      ],
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
    })

    res.json({
      success: true,
      data: { logs },
    })
  } catch (error) {
    console.error("Error obteniendo logs de accesos administrativos:", error)
    res.status(500).json({
      success: false,
      message: "Error al obtener logs de accesos administrativos",
    })
  }
}

/**
 * Obtiene estadísticas de auditoría
 */
export const getAuditStats = async (req, res) => {
  try {
    const { Sequelize } = await import("sequelize")

    // Total de acciones por tipo
    const accionesPorTipo = await AuditLog.findAll({
      attributes: [
        "tipo_accion",
        [Sequelize.fn("COUNT", Sequelize.col("id_audit_log")), "total"],
      ],
      group: ["tipo_accion"],
    })

    // Total de acciones por estado
    const accionesPorEstado = await AuditLog.findAll({
      attributes: [
        "estado",
        [Sequelize.fn("COUNT", Sequelize.col("id_audit_log")), "total"],
      ],
      group: ["estado"],
    })

    // Total de accesos administrativos
    const accesosAdmin = await AuditLog.count({
      where: {
        tipo_accion: ["login", "oauth_login"],
      },
      include: [
        {
          model: Usuario,
          as: "usuario",
          where: {
            rol: "admin",
          },
          attributes: [],
        },
      ],
    })

    // Intentos fallidos recientes
    const intentosFallidos = await AuditLog.count({
      where: {
        estado: "failure",
        tipo_accion: "login",
      },
    })

    res.json({
      success: true,
      data: {
        accionesPorTipo,
        accionesPorEstado,
        accesosAdmin,
        intentosFallidos,
      },
    })
  } catch (error) {
    console.error("Error obteniendo estadísticas de auditoría:", error)
    res.status(500).json({
      success: false,
      message: "Error al obtener estadísticas de auditoría",
    })
  }
}

/**
 * Obtiene logs de un usuario específico
 */
export const getUserAuditLogs = async (req, res) => {
  try {
    const { id_usuario } = req.params
    const { limit = 50, offset = 0 } = req.query

    const logs = await AuditLog.findAndCountAll({
      where: { id_usuario },
      include: [
        {
          model: Usuario,
          as: "usuario",
          attributes: ["id_usuarios", "email", "nombre", "apellido", "rol"],
        },
      ],
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    })

    res.json({
      success: true,
      data: {
        logs: logs.rows,
        total: logs.count,
        limit: parseInt(limit),
        offset: parseInt(offset),
      },
    })
  } catch (error) {
    console.error("Error obteniendo logs del usuario:", error)
    res.status(500).json({
      success: false,
      message: "Error al obtener logs del usuario",
    })
  }
}
