import { Usuario, UsuarioRol } from "../models/associations.js"
import { Op } from "sequelize"
import bcrypt from "bcrypt"
import roleService from "../services/roleService.js"

const getUsuarios = async (req, res) => {
  try {
    console.log("[v0] getUsuarios called with query:", req.query)

    const { search, rol, activo, limit = 100, orderBy = 'apellido', orderDir = 'ASC' } = req.query
    const whereClause = {}

    // Filtro de búsqueda
    if (search) {
      whereClause[Op.or] = [
        { nombre: { [Op.like]: `%${search}%` } },
        { apellido: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { dni: { [Op.like]: `%${search}%` } },
      ]
    }

    // Filtro por rol
    if (rol) {
      whereClause.rol = rol
    }

    // Filtro por estado activo/inactivo
    if (activo !== undefined && activo !== '') {
      whereClause.activo = activo === 'true' || activo === true
    }

    // Determinar orden
    const validOrderFields = ['nombre', 'apellido', 'dni', 'email', 'rol', 'created_at']
    const validOrderDirs = ['ASC', 'DESC']
    const orderField = validOrderFields.includes(orderBy) ? orderBy : 'apellido'
    const orderDirection = validOrderDirs.includes(orderDir.toUpperCase()) ? orderDir.toUpperCase() : 'ASC'

    const usuarios = await Usuario.findAll({
      where: whereClause,
      attributes: ["id_usuarios", "nombre", "apellido", "email", "dni", "rol", "activo", "avatar", "created_at"],
      include: [{
        model: UsuarioRol,
        as: "roles",
        where: { activo: true },
        required: false,
        attributes: ["rol"],
      }],
      limit: Number.parseInt(limit),
      order: [[orderField, orderDirection]],
    })

    console.log("[v0] Found usuarios:", usuarios.length)

    // Map usuarios to include roles array
    const usuariosWithRoles = usuarios.map(usuario => {
      const usuarioData = usuario.toJSON()
      // Incluir el rol principal del campo 'rol' de la tabla usuarios
      const rolPrincipal = usuarioData.rol
      // Incluir los roles adicionales de la tabla usuario_roles
      const rolesAdicionales = usuario.roles?.map(r => r.rol) || []
      // Combinar ambos y eliminar duplicados
      const todosLosRoles = [rolPrincipal, ...rolesAdicionales]
      usuarioData.rolesArray = [...new Set(todosLosRoles)].filter(Boolean)
      return usuarioData
    })

    // Return the array directly to match frontend expectations
    res.json(usuariosWithRoles)
  } catch (error) {
    console.error("[v0] Error in getUsuarios:", error)
    res.status(500).json({
      message: "Error al obtener usuarios",
      error: error.message,
    })
  }
}

const getUsuarioById = async (req, res) => {
  try {
    const { id } = req.params

    const usuario = await Usuario.findByPk(id, {
      attributes: ["id_usuarios", "nombre", "apellido", "email", "dni", "rol", "activo", "avatar"],
    })

    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" })
    }

    res.json(usuario)
  } catch (error) {
    console.error("Error in getUsuarioById:", error)
    res.status(500).json({
      message: "Error al obtener usuario",
      error: error.message,
    })
  }
}

/**
 * Actualiza un usuario
 * ✅ Conectado con frontend
 * ✅ Los usuarios pueden actualizar su propio perfil
 */
const updateUsuario = async (req, res) => {
  try {
    const { id } = req.params
    const { nombre, apellido, email, telefono, dni, rol, activo, contacto_emergencia, telefono_emergencia, experiencia_previa } = req.body

    const usuario = await Usuario.findByPk(id)

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado"
      })
    }

    // Verificar permisos: solo admin puede editar otros usuarios
    // Los usuarios normales solo pueden editar su propio perfil
    if (req.user.id_usuarios !== Number.parseInt(id) && req.user.rol !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "No tienes permiso para editar este usuario"
      })
    }

    // Validar DNI si está presente
    if (dni !== undefined && dni !== null && dni.trim() !== "") {
      // Validar que sea solo números
      if (!/^\d+$/.test(dni)) {
        return res.status(400).json({
          success: false,
          message: "El DNI debe contener solo números"
        })
      }
      // Validar longitud (DNI argentino: 7-8 dígitos)
      if (dni.length < 7 || dni.length > 8) {
        return res.status(400).json({
          success: false,
          message: "El DNI debe tener entre 7 y 8 dígitos"
        })
      }
    }

    // Los usuarios normales no pueden cambiar su rol ni estado activo
    const updateData = {
      nombre: nombre || usuario.nombre,
      apellido: apellido || usuario.apellido,
      email: email || usuario.email,
      telefono: telefono !== undefined ? telefono : usuario.telefono,
      dni: dni !== undefined ? dni : usuario.dni,
      contacto_emergencia: contacto_emergencia !== undefined ? contacto_emergencia : usuario.contacto_emergencia,
      telefono_emergencia: telefono_emergencia !== undefined ? telefono_emergencia : usuario.telefono_emergencia,
      experiencia_previa: experiencia_previa !== undefined ? experiencia_previa : usuario.experiencia_previa,
    }

    // Solo admin puede actualizar rol y estado activo
    if (req.user.rol === 'admin') {
      updateData.rol = rol || usuario.rol
      updateData.activo = activo !== undefined ? activo : usuario.activo
    }

    // Actualizar usuario
    await usuario.update(updateData)

    // Si se actualizó el rol, sincronizar con la tabla usuario_roles
    if (req.user.rol === 'admin' && rol && rol !== usuario.rol) {
      try {
        await roleService.assignRole(
          id,
          rol,
          req.user.id_usuarios,
          `Rol principal actualizado a '${rol}' desde panel de administración`
        )
        console.log(`[USUARIOS] ✅ Rol '${rol}' sincronizado en usuario_roles para usuario ${id}`)
      } catch (error) {
        console.error(`[USUARIOS] ⚠️  Error sincronizando rol en usuario_roles:`, error.message)
        // No fallar la petición si la sincronización falla
      }
    }

    res.json({
      success: true,
      message: "Usuario actualizado exitosamente",
      data: { usuario }
    })

  } catch (error) {
    console.error("Error actualizando usuario:", error)

    // Mejorar mensajes de error según el tipo de error
    if (error.name === 'SequelizeValidationError') {
      // Agrupar errores por campo y tomar solo el primero de cada campo
      const erroresPorCampo = {}
      error.errors?.forEach(e => {
        if (!erroresPorCampo[e.path]) {
          // Traducir nombres de campos al español
          const campoTraducido = {
            'nombre': 'Nombre',
            'apellido': 'Apellido',
            'email': 'Email',
            'telefono': 'Teléfono',
            'dni': 'DNI'
          }[e.path] || e.path

          erroresPorCampo[e.path] = `${campoTraducido}: ${e.message}`
        }
      })

      const errores = Object.values(erroresPorCampo)

      return res.status(400).json({
        success: false,
        message: errores.length > 0 ? errores.join('\n') : 'Error de validación',
        error: errores.join(', ')
      })
    }

    if (error.name === 'SequelizeUniqueConstraintError') {
      const errores = error.errors?.map(e => {
        const campoTraducido = {
          'email': 'El email',
          'dni': 'El DNI'
        }[e.path] || 'El campo'

        return `${campoTraducido} ya está registrado`
      }) || []

      return res.status(400).json({
        success: false,
        message: errores[0] || "El email o DNI ya está registrado",
        error: errores.join(', ')
      })
    }

    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message
    })
  }
}

/**
 * Sube avatar de usuario
 * ✅ Conectado con frontend
 */
const uploadAvatar = async (req, res) => {
  try {
    const { id } = req.params

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No se subió ningún archivo"
      })
    }

    const usuario = await Usuario.findByPk(id)

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado"
      })
    }

    // Construir URL del avatar
    const avatarUrl = `${req.protocol}://${req.get('host')}/uploads/avatars/${req.file.filename}`

    await usuario.update({
      avatar: avatarUrl
    })

    res.json({
      success: true,
      message: "Avatar actualizado exitosamente",
      data: {
        avatarUrl
      }
    })

  } catch (error) {
    console.error("Error subiendo avatar:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message
    })
  }
}

/**
 * Cambia la contraseña de un usuario
 * ✅ Nuevo endpoint para cambio de contraseña
 */
const changePassword = async (req, res) => {
  try {
    const { id } = req.params
    const { currentPassword, newPassword } = req.body

    // Validaciones
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Se requieren la contraseña actual y la nueva contraseña"
      })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "La nueva contraseña debe tener al menos 6 caracteres"
      })
    }

    // Buscar usuario con contraseña
    const usuario = await Usuario.findByPk(id)

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado"
      })
    }

    // Verificar que el usuario autenticado solo pueda cambiar su propia contraseña
    // (a menos que sea admin)
    if (req.user.id_usuarios !== Number.parseInt(id) && req.user.rol !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "No tienes permiso para cambiar esta contraseña"
      })
    }

    // Verificar contraseña actual
    const isPasswordValid = await bcrypt.compare(currentPassword, usuario.password)

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "La contraseña actual es incorrecta"
      })
    }

    // Hashear nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Actualizar contraseña
    await usuario.update({
      password: hashedPassword
    })

    res.json({
      success: true,
      message: "Contraseña actualizada exitosamente"
    })

  } catch (error) {
    console.error("Error cambiando contraseña:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message
    })
  }
}

export { getUsuarios, getUsuarioById, updateUsuario, uploadAvatar, changePassword }
