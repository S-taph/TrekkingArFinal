import jwt from "jsonwebtoken"
import Usuario from "../models/Usuario.js"
import auditService from "../services/auditService.js"
import roleService from "../services/roleService.js"
import UsuarioRol from "../models/UsuarioRol.js"

export const authenticateToken = async (req, res, next) => {
  try {
    if (process.env.NODE_ENV === "development" && req.headers["x-bypass-auth"] === "true") {
      // Usuario mock de admin para desarrollo
      req.user = {
        id_usuarios: 1,
        rol: "admin", // Retrocompatibilidad
        roles: ["admin", "cliente"], // Nuevo sistema
        nombre: "Admin",
        apellido: "Test",
        email: "admin@test.com",
        activo: true,
      }
      return next()
    }

    // Intentar obtener el token de cookies o del header Authorization
    let token = req.cookies.token

    // Si no hay token en cookies, intentar obtenerlo del header Authorization
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7) // Remover "Bearer " del inicio
      }
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token de acceso requerido",
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const usuario = await Usuario.findByPk(decoded.id, {
      attributes: { exclude: ["password_hash"] },
      include: [
        {
          model: UsuarioRol,
          as: "roles",
          where: { activo: true },
          required: false,
          attributes: ["rol"],
        },
      ],
    })

    if (!usuario || !usuario.activo) {
      return res.status(401).json({
        success: false,
        message: "Token inválido o usuario inactivo",
      })
    }

    // Obtener roles activos
    const rolesActivos = usuario.roles?.map((r) => r.rol) || []

    // Si no tiene roles en el nuevo sistema, migrar desde el campo 'rol'
    if (rolesActivos.length === 0 && usuario.rol) {
      console.log(`[AUTH] Migrando rol para usuario ${usuario.id_usuarios}: ${usuario.rol}`)
      await roleService.migrateUserRole(usuario.id_usuarios, usuario.rol)
      rolesActivos.push(usuario.rol)
    }

    // Determinar rol principal (para retrocompatibilidad)
    let primaryRole = usuario.rol || "cliente"
    if (rolesActivos.includes("admin")) primaryRole = "admin"
    else if (rolesActivos.includes("guia")) primaryRole = "guia"

    // Agregar información de roles al objeto usuario
    req.user = {
      ...usuario.toJSON(),
      roles: rolesActivos, // Array de roles
      rol: primaryRole, // Rol principal (retrocompatibilidad)
    }

    next()
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: "Token inválido",
    })
  }
}

export const requireRole = (rolesRequeridos) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Usuario no autenticado",
      })
    }

    // Verificar si el usuario tiene alguno de los roles requeridos
    const userRoles = req.user.roles || [req.user.rol]
    const hasPermission = rolesRequeridos.some(rol => userRoles.includes(rol))

    if (!hasPermission) {
      // Registrar intento de acceso no autorizado
      await auditService.logUnauthorizedAccess(
        req.user,
        req,
        `${req.method} ${req.path}`
      )

      console.log(
        `[SECURITY] ⚠️  Acceso denegado: ${req.user.email} (roles: ${userRoles.join(', ')}) intentó acceder a ${req.method} ${req.path}`
      )

      return res.status(403).json({
        success: false,
        message: "No tienes permisos para acceder a este recurso",
      })
    }

    // Log de acceso administrativo exitoso
    if (rolesRequeridos.includes('admin') && userRoles.includes('admin')) {
      console.log(
        `[SECURITY] ✅ Admin access: ${req.user.email} - ${req.method} ${req.path}`
      )
    }

    next()
  }
}

export const requireAdmin = requireRole(['admin'])