import roleService from "../services/roleService.js"
import auditService from "../services/auditService.js"

/**
 * Obtiene los roles de un usuario
 */
export const getUserRoles = async (req, res) => {
  try {
    const { id_usuario } = req.params

    const rolesInfo = await roleService.getUserRolesInfo(parseInt(id_usuario))

    res.json({
      success: true,
      data: rolesInfo,
    })
  } catch (error) {
    console.error("Error obteniendo roles del usuario:", error)
    res.status(500).json({
      success: false,
      message: "Error al obtener roles del usuario",
      error: error.message,
    })
  }
}

/**
 * Asigna un rol a un usuario (solo admin)
 */
export const assignRole = async (req, res) => {
  try {
    const { id_usuario } = req.params
    const { rol, observaciones } = req.body

    if (!rol || !["cliente", "admin", "guia"].includes(rol)) {
      return res.status(400).json({
        success: false,
        message: "Rol inválido. Debe ser: cliente, admin o guia",
      })
    }

    const resultado = await roleService.assignRole(
      parseInt(id_usuario),
      rol,
      req.user.id_usuarios,
      observaciones,
    )

    // Auditar la asignación
    await auditService.logCreate(req.user, req, "usuario_roles", resultado.id_usuario_rol, {
      id_usuario,
      rol,
      asignado_por: req.user.email,
    })

    res.json({
      success: true,
      message: `Rol '${rol}' asignado exitosamente`,
      data: resultado,
    })
  } catch (error) {
    console.error("Error asignando rol:", error)
    res.status(500).json({
      success: false,
      message: "Error al asignar rol",
      error: error.message,
    })
  }
}

/**
 * Remueve un rol de un usuario (solo admin)
 */
export const removeRole = async (req, res) => {
  try {
    const { id_usuario } = req.params
    const { rol } = req.body

    if (!rol || !["cliente", "admin", "guia"].includes(rol)) {
      return res.status(400).json({
        success: false,
        message: "Rol inválido. Debe ser: cliente, admin o guia",
      })
    }

    const resultado = await roleService.removeRole(parseInt(id_usuario), rol)

    if (!resultado) {
      return res.status(404).json({
        success: false,
        message: `El usuario no tiene el rol '${rol}'`,
      })
    }

    // Auditar la remoción
    await auditService.logDelete(req.user, req, "usuario_roles", id_usuario, {
      id_usuario,
      rol,
      removido_por: req.user.email,
    })

    res.json({
      success: true,
      message: `Rol '${rol}' removido exitosamente`,
    })
  } catch (error) {
    console.error("Error removiendo rol:", error)
    res.status(500).json({
      success: false,
      message: "Error al remover rol",
      error: error.message,
    })
  }
}

/**
 * Promueve un usuario a guía
 */
export const promoteToGuia = async (req, res) => {
  try {
    const { id_usuario } = req.params
    const guiaData = req.body

    // Validar datos requeridos
    if (!guiaData.matricula) {
      return res.status(400).json({
        success: false,
        message: "La matrícula es requerida para crear un guía",
      })
    }

    const resultado = await roleService.promoteToGuia(
      parseInt(id_usuario),
      guiaData,
      req.user.id_usuarios,
    )

    // Auditar la promoción
    await auditService.logCreate(req.user, req, "guias", resultado.perfil.id_guia, {
      id_usuario,
      matricula: guiaData.matricula,
      promovido_por: req.user.email,
    })

    res.json({
      success: true,
      message: "Usuario promovido a guía exitosamente",
      data: resultado,
    })
  } catch (error) {
    console.error("Error promoviendo a guía:", error)
    res.status(500).json({
      success: false,
      message: "Error al promover a guía",
      error: error.message,
    })
  }
}

/**
 * Promueve un usuario a administrador
 */
export const promoteToAdmin = async (req, res) => {
  try {
    const { id_usuario } = req.params
    const adminData = req.body

    const resultado = await roleService.promoteToAdmin(
      parseInt(id_usuario),
      adminData,
      req.user.id_usuarios,
    )

    // Auditar la promoción
    await auditService.logCreate(req.user, req, "administradores", resultado.perfil.id_administrador, {
      id_usuario,
      nivel: adminData?.nivel || "admin",
      promovido_por: req.user.email,
    })

    res.json({
      success: true,
      message: "Usuario promovido a administrador exitosamente",
      data: resultado,
    })
  } catch (error) {
    console.error("Error promoviendo a admin:", error)
    res.status(500).json({
      success: false,
      message: "Error al promover a administrador",
      error: error.message,
    })
  }
}
