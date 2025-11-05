import AuditLog from "../models/AuditLog.js"

/**
 * Servicio para registrar auditoría de acciones administrativas y críticas
 */
class AuditService {
  /**
   * Registra una acción en el log de auditoría
   * @param {Object} params - Parámetros de la acción
   * @param {number} params.id_usuario - ID del usuario que realiza la acción
   * @param {string} params.accion - Descripción de la acción
   * @param {string} params.tipo_accion - Tipo de acción (login, logout, create, update, delete, read, oauth_login)
   * @param {string} params.recurso - Recurso afectado (opcional)
   * @param {number} params.id_recurso - ID del recurso afectado (opcional)
   * @param {string} params.ip_address - IP del cliente (opcional)
   * @param {string} params.user_agent - User agent del cliente (opcional)
   * @param {Object} params.detalles - Detalles adicionales (opcional)
   * @param {string} params.estado - Estado de la acción (success, failure, warning)
   * @param {string} params.mensaje - Mensaje descriptivo (opcional)
   * @returns {Promise<AuditLog>}
   */
  async log({
    id_usuario,
    accion,
    tipo_accion,
    recurso = null,
    id_recurso = null,
    ip_address = null,
    user_agent = null,
    detalles = null,
    estado = "success",
    mensaje = null,
  }) {
    try {
      const auditLog = await AuditLog.create({
        id_usuario,
        accion,
        tipo_accion,
        recurso,
        id_recurso,
        ip_address,
        user_agent,
        detalles,
        estado,
        mensaje,
      })

      // Log en consola solo para acciones de admin
      if (tipo_accion === "login" || tipo_accion === "oauth_login") {
        console.log(`[AUDIT] 🔐 ${accion} - Usuario: ${id_usuario} - IP: ${ip_address}`)
      }

      return auditLog
    } catch (error) {
      console.error("[AUDIT] ❌ Error registrando auditoría:", error)
      // No lanzamos el error para no interrumpir el flujo principal
      return null
    }
  }

  /**
   * Registra un login exitoso
   */
  async logLogin(usuario, req, metodo = "tradicional") {
    return this.log({
      id_usuario: usuario.id_usuarios,
      accion: `Login ${metodo} - ${usuario.email} (${usuario.rol})`,
      tipo_accion: metodo === "oauth" ? "oauth_login" : "login",
      ip_address: this.getClientIp(req),
      user_agent: req.headers["user-agent"],
      estado: "success",
      mensaje: `Usuario ${usuario.email} inició sesión exitosamente con ${metodo}`,
      detalles: {
        email: usuario.email,
        rol: usuario.rol,
        metodo,
      },
    })
  }

  /**
   * Registra un intento de login fallido
   */
  async logFailedLogin(email, req, razon = "Credenciales incorrectas") {
    return this.log({
      id_usuario: 0, // Usuario no identificado
      accion: `Login fallido - ${email}`,
      tipo_accion: "login",
      ip_address: this.getClientIp(req),
      user_agent: req.headers["user-agent"],
      estado: "failure",
      mensaje: razon,
      detalles: {
        email,
        razon,
      },
    })
  }

  /**
   * Registra un logout
   */
  async logLogout(usuario, req) {
    return this.log({
      id_usuario: usuario.id_usuarios,
      accion: `Logout - ${usuario.email}`,
      tipo_accion: "logout",
      ip_address: this.getClientIp(req),
      user_agent: req.headers["user-agent"],
      estado: "success",
    })
  }

  /**
   * Registra acceso denegado por permisos insuficientes
   */
  async logUnauthorizedAccess(usuario, req, recurso) {
    return this.log({
      id_usuario: usuario?.id_usuarios || 0,
      accion: `Acceso denegado - ${recurso}`,
      tipo_accion: "read",
      recurso,
      ip_address: this.getClientIp(req),
      user_agent: req.headers["user-agent"],
      estado: "warning",
      mensaje: `Usuario intentó acceder a ${recurso} sin permisos suficientes`,
      detalles: {
        rol: usuario?.rol,
        recurso,
      },
    })
  }

  /**
   * Registra creación de un recurso
   */
  async logCreate(usuario, req, recurso, id_recurso, detalles = null) {
    return this.log({
      id_usuario: usuario.id_usuarios,
      accion: `Crear ${recurso}`,
      tipo_accion: "create",
      recurso,
      id_recurso,
      ip_address: this.getClientIp(req),
      user_agent: req.headers["user-agent"],
      estado: "success",
      detalles,
    })
  }

  /**
   * Registra actualización de un recurso
   */
  async logUpdate(usuario, req, recurso, id_recurso, detalles = null) {
    return this.log({
      id_usuario: usuario.id_usuarios,
      accion: `Actualizar ${recurso}`,
      tipo_accion: "update",
      recurso,
      id_recurso,
      ip_address: this.getClientIp(req),
      user_agent: req.headers["user-agent"],
      estado: "success",
      detalles,
    })
  }

  /**
   * Registra eliminación de un recurso
   */
  async logDelete(usuario, req, recurso, id_recurso, detalles = null) {
    return this.log({
      id_usuario: usuario.id_usuarios,
      accion: `Eliminar ${recurso}`,
      tipo_accion: "delete",
      recurso,
      id_recurso,
      ip_address: this.getClientIp(req),
      user_agent: req.headers["user-agent"],
      estado: "success",
      detalles,
    })
  }

  /**
   * Obtiene la IP del cliente considerando proxies
   */
  getClientIp(req) {
    return (
      req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
      req.headers["x-real-ip"] ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      "unknown"
    )
  }

  /**
   * Obtiene logs de auditoría con filtros
   */
  async getLogs(filters = {}) {
    const where = {}

    if (filters.id_usuario) where.id_usuario = filters.id_usuario
    if (filters.tipo_accion) where.tipo_accion = filters.tipo_accion
    if (filters.recurso) where.recurso = filters.recurso
    if (filters.estado) where.estado = filters.estado

    const logs = await AuditLog.findAll({
      where,
      order: [["created_at", "DESC"]],
      limit: filters.limit || 100,
    })

    return logs
  }

  /**
   * Obtiene logs de accesos administrativos (logins de admin)
   */
  async getAdminAccessLogs(limit = 50) {
    const { Usuario } = await import("../models/associations.js")

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
      limit,
    })

    return logs
  }
}

export default new AuditService()
