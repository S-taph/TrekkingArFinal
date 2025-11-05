import UsuarioRol from "../models/UsuarioRol.js"
import Usuario from "../models/Usuario.js"
import Guia from "../models/Guia.js"
import Administrador from "../models/Administrador.js"

/**
 * Servicio para gestionar roles de usuarios
 * Permite asignar múltiples roles a un mismo usuario
 */
class RoleService {
  /**
   * Asigna un rol a un usuario
   * @param {number} id_usuario - ID del usuario
   * @param {string} rol - Rol a asignar (cliente, admin, guia)
   * @param {number} asignado_por - ID del admin que asigna el rol
   * @param {string} observaciones - Observaciones opcionales
   * @returns {Promise<UsuarioRol>}
   */
  async assignRole(id_usuario, rol, asignado_por = null, observaciones = null) {
    try {
      // Verificar si el usuario ya tiene el rol
      const existingRole = await UsuarioRol.findOne({
        where: {
          id_usuario,
          rol,
        },
      })

      if (existingRole) {
        // Si existe pero está inactivo, reactivarlo
        if (!existingRole.activo) {
          await existingRole.update({ activo: true })
          console.log(`[ROLES] ✅ Rol '${rol}' reactivado para usuario ${id_usuario}`)
          return existingRole
        }
        console.log(`[ROLES] ⚠️  Usuario ${id_usuario} ya tiene el rol '${rol}'`)
        return existingRole
      }

      // Crear nuevo rol
      const nuevoRol = await UsuarioRol.create({
        id_usuario,
        rol,
        activo: true,
        asignado_por,
        observaciones,
      })

      console.log(`[ROLES] ✅ Rol '${rol}' asignado a usuario ${id_usuario}`)
      return nuevoRol
    } catch (error) {
      console.error(`[ROLES] ❌ Error asignando rol '${rol}' a usuario ${id_usuario}:`, error)
      throw error
    }
  }

  /**
   * Remueve un rol de un usuario (lo marca como inactivo)
   * @param {number} id_usuario - ID del usuario
   * @param {string} rol - Rol a remover
   * @returns {Promise<boolean>}
   */
  async removeRole(id_usuario, rol) {
    try {
      const roleRecord = await UsuarioRol.findOne({
        where: {
          id_usuario,
          rol,
        },
      })

      if (!roleRecord) {
        console.log(`[ROLES] ⚠️  Usuario ${id_usuario} no tiene el rol '${rol}'`)
        return false
      }

      await roleRecord.update({ activo: false })
      console.log(`[ROLES] ✅ Rol '${rol}' removido de usuario ${id_usuario}`)
      return true
    } catch (error) {
      console.error(`[ROLES] ❌ Error removiendo rol '${rol}' de usuario ${id_usuario}:`, error)
      throw error
    }
  }

  /**
   * Obtiene todos los roles activos de un usuario
   * @param {number} id_usuario - ID del usuario
   * @returns {Promise<Array<string>>}
   */
  async getUserRoles(id_usuario) {
    const roles = await UsuarioRol.findAll({
      where: {
        id_usuario,
        activo: true,
      },
      attributes: ["rol"],
    })

    return roles.map((r) => r.rol)
  }

  /**
   * Verifica si un usuario tiene un rol específico
   * @param {number} id_usuario - ID del usuario
   * @param {string} rol - Rol a verificar
   * @returns {Promise<boolean>}
   */
  async hasRole(id_usuario, rol) {
    const count = await UsuarioRol.count({
      where: {
        id_usuario,
        rol,
        activo: true,
      },
    })

    return count > 0
  }

  /**
   * Verifica si un usuario tiene alguno de los roles especificados
   * @param {number} id_usuario - ID del usuario
   * @param {Array<string>} roles - Array de roles a verificar
   * @returns {Promise<boolean>}
   */
  async hasAnyRole(id_usuario, roles) {
    const count = await UsuarioRol.count({
      where: {
        id_usuario,
        rol: roles,
        activo: true,
      },
    })

    return count > 0
  }

  /**
   * Configura los roles iniciales de un usuario al registrarse
   * Por defecto todos los usuarios tienen rol 'cliente'
   * @param {number} id_usuario - ID del usuario
   * @param {string} rolInicial - Rol inicial (opcional, default: 'cliente')
   * @returns {Promise<UsuarioRol>}
   */
  async setupInitialRoles(id_usuario, rolInicial = "cliente") {
    return await this.assignRole(id_usuario, rolInicial, null, "Rol asignado al registrarse")
  }

  /**
   * Migra un usuario del sistema antiguo (campo 'rol') al nuevo sistema (tabla usuario_roles)
   * @param {number} id_usuario - ID del usuario
   * @param {string} rolAntiguo - Rol del campo 'rol' de la tabla usuarios
   * @returns {Promise<UsuarioRol>}
   */
  async migrateUserRole(id_usuario, rolAntiguo) {
    try {
      // Verificar si ya existe en el nuevo sistema
      const existingRoles = await this.getUserRoles(id_usuario)

      if (existingRoles.length > 0) {
        console.log(
          `[ROLES] ⚠️  Usuario ${id_usuario} ya tiene roles en el nuevo sistema:`,
          existingRoles,
        )
        return null
      }

      // Asignar el rol antiguo
      await this.assignRole(id_usuario, rolAntiguo, null, "Migrado del sistema antiguo")

      console.log(`[ROLES] ✅ Usuario ${id_usuario} migrado con rol '${rolAntiguo}'`)
      return true
    } catch (error) {
      console.error(`[ROLES] ❌ Error migrando usuario ${id_usuario}:`, error)
      throw error
    }
  }

  /**
   * Convierte un usuario en guía (asigna rol guia y crea perfil de guía)
   * @param {number} id_usuario - ID del usuario
   * @param {Object} guiaData - Datos del perfil de guía
   * @param {number} asignado_por - ID del admin que hace la asignación
   * @returns {Promise<Object>} {rol, perfil}
   */
  async promoteToGuia(id_usuario, guiaData, asignado_por) {
    try {
      // Asignar rol de guía
      const rol = await this.assignRole(id_usuario, "guia", asignado_por, "Promovido a guía")

      // Verificar si ya tiene perfil de guía
      const existingGuia = await Guia.findOne({
        where: { id_usuario },
      })

      if (existingGuia) {
        console.log(`[ROLES] ⚠️  Usuario ${id_usuario} ya tiene perfil de guía`)
        return { rol, perfil: existingGuia }
      }

      // Crear perfil de guía
      const perfil = await Guia.create({
        id_usuario,
        ...guiaData,
      })

      console.log(`[ROLES] ✅ Usuario ${id_usuario} promovido a guía`)
      return { rol, perfil }
    } catch (error) {
      console.error(`[ROLES] ❌ Error promoviendo usuario ${id_usuario} a guía:`, error)
      throw error
    }
  }

  /**
   * Convierte un usuario en administrador (asigna rol admin y crea perfil de admin)
   * @param {number} id_usuario - ID del usuario
   * @param {Object} adminData - Datos del perfil de administrador
   * @param {number} asignado_por - ID del admin que hace la asignación
   * @returns {Promise<Object>} {rol, perfil}
   */
  async promoteToAdmin(id_usuario, adminData, asignado_por) {
    try {
      // Asignar rol de admin
      const rol = await this.assignRole(
        id_usuario,
        "admin",
        asignado_por,
        "Promovido a administrador",
      )

      // Verificar si ya tiene perfil de admin
      const existingAdmin = await Administrador.findOne({
        where: { id_usuario },
      })

      if (existingAdmin) {
        console.log(`[ROLES] ⚠️  Usuario ${id_usuario} ya tiene perfil de administrador`)
        return { rol, perfil: existingAdmin }
      }

      // Crear perfil de administrador
      const perfil = await Administrador.create({
        id_usuario,
        nivel: adminData?.nivel || "admin",
        observaciones: adminData?.observaciones || "Promovido a administrador",
      })

      console.log(`[ROLES] ✅ Usuario ${id_usuario} promovido a administrador`)
      return { rol, perfil }
    } catch (error) {
      console.error(`[ROLES] ❌ Error promoviendo usuario ${id_usuario} a admin:`, error)
      throw error
    }
  }

  /**
   * Obtiene el rol principal de un usuario (para retrocompatibilidad)
   * Prioridad: admin > guia > cliente
   * @param {number} id_usuario - ID del usuario
   * @returns {Promise<string>}
   */
  async getPrimaryRole(id_usuario) {
    const roles = await this.getUserRoles(id_usuario)

    if (roles.includes("admin")) return "admin"
    if (roles.includes("guia")) return "guia"
    return "cliente"
  }

  /**
   * Obtiene información completa de los roles de un usuario
   * Incluye perfiles de guía y administrador si los tiene
   * @param {number} id_usuario - ID del usuario
   * @returns {Promise<Object>}
   */
  async getUserRolesInfo(id_usuario) {
    const usuario = await Usuario.findByPk(id_usuario, {
      include: [
        { model: UsuarioRol, as: "roles", where: { activo: true }, required: false },
        { model: Guia, as: "perfilGuia", required: false },
        { model: Administrador, as: "perfilAdmin", required: false },
      ],
    })

    if (!usuario) {
      throw new Error(`Usuario ${id_usuario} no encontrado`)
    }

    const rolesActivos = usuario.roles?.map((r) => r.rol) || []

    return {
      id_usuario: usuario.id_usuarios,
      email: usuario.email,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      roles: rolesActivos,
      primaryRole: await this.getPrimaryRole(id_usuario),
      isAdmin: rolesActivos.includes("admin"),
      isGuia: rolesActivos.includes("guia"),
      isCliente: rolesActivos.includes("cliente"),
      perfilGuia: usuario.perfilGuia,
      perfilAdmin: usuario.perfilAdmin,
    }
  }
}

export default new RoleService()
