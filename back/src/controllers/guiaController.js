import { validationResult } from "express-validator"
import { Op } from "sequelize"
import Guia from "../models/Guia.js"
import Usuario from "../models/Usuario.js"
import GuiaViaje from "../models/GuiaViaje.js"
import FechaViaje from "../models/FechaViaje.js"
import Viaje from "../models/Viaje.js"
import roleService from "../services/roleService.js"

export const getAllGuias = async (req, res) => {
  try {
    console.log("[v0] === INICIANDO getAllGuias ===")
    console.log("[v0] Parámetros recibidos:", req.query)

    const { disponible, activo, especialidad, search, page = 1, limit = 10 } = req.query

    const whereClause = {}

    if (disponible !== undefined && disponible !== "") {
      whereClause.disponible = disponible === "true"
    }
    if (activo !== undefined && activo !== "") {
      whereClause.activo = activo === "true"
    }

    if (especialidad) {
      whereClause.especialidades = { [Op.like]: `%${especialidad}%` }
    }

    console.log("[v0] Where clause construido:", whereClause)

    let includeClause = []

    try {
      // Test if associations are working
      const testGuia = await Guia.findOne({
        include: [
          {
            model: Usuario,
            as: "usuario",
            attributes: ["id_usuarios", "nombre", "apellido", "email", "telefono", "avatar"],
          },
        ],
        limit: 1,
      })

      console.log("[v0] Test association successful, using full include")

      includeClause = [
        {
          model: Usuario,
          as: "usuario",
          attributes: ["id_usuarios", "nombre", "apellido", "email", "telefono", "avatar"],
          where: search
            ? {
                [Op.or]: [{ nombre: { [Op.like]: `%${search}%` } }, { apellido: { [Op.like]: `%${search}%` } }],
              }
            : undefined,
        },
      ]
    } catch (assocError) {
      console.log("[v0] Association test failed, using simple query:", assocError.message)
      includeClause = []
    }

    const offset = (page - 1) * limit

    console.log("[v0] Ejecutando consulta con include:", includeClause.length > 0 ? "SI" : "NO")

    const { count, rows: guias } = await Guia.findAndCountAll({
      where: whereClause,
      include: includeClause,
      limit: Number.parseInt(limit),
      offset: Number.parseInt(offset),
      order: [["calificacion_promedio", "DESC"]],
    })

    console.log("[v0] Consulta exitosa. Guías encontrados:", count)
    console.log(
      "[v0] Primeros guías (sample):",
      guias.slice(0, 2).map((g) => ({
        id: g.id_guia,
        matricula: g.matricula,
        usuario: g.usuario ? `${g.usuario.nombre} ${g.usuario.apellido}` : "Sin usuario",
      })),
    )

    res.json({
      success: true,
      data: {
        guias,
        pagination: {
          currentPage: Number.parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: Number.parseInt(limit),
        },
      },
    })
  } catch (error) {
    console.error("[v0] Error completo en getAllGuias:", error)
    console.error("[v0] Stack trace:", error.stack)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    })
  }
}

export const getGuiaById = async (req, res) => {
  try {
    const { id } = req.params

    const guia = await Guia.findByPk(id, {
      include: [
        {
          model: Usuario,
          as: "usuario",
          attributes: ["id_usuarios", "nombre", "apellido", "email", "telefono", "avatar"],
        },
        {
          model: GuiaViaje,
          as: "asignaciones",
          include: [
            {
              model: FechaViaje,
              as: "fechaViaje",
              include: [
                {
                  model: Viaje,
                  as: "viaje",
                  attributes: ["id_viaje", "titulo", "dificultad"],
                },
              ],
            },
          ],
        },
      ],
    })

    if (!guia) {
      return res.status(404).json({
        success: false,
        message: "Guía no encontrado",
      })
    }

    res.json({
      success: true,
      data: { guia },
    })
  } catch (error) {
    console.error("Error al obtener guía:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}

export const createGuia = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Datos de entrada inválidos",
        errors: errors.array(),
      })
    }

    const guiaData = req.body

    console.log("[v0] Datos recibidos para crear guía:", guiaData)

    // Verificar que el usuario existe
    const usuario = await Usuario.findByPk(guiaData.id_usuario)
    if (!usuario) {
      console.log("[v0] Usuario no encontrado:", guiaData.id_usuario)
      return res.status(400).json({
        success: false,
        message: "Usuario no encontrado",
      })
    }

    console.log("[v0] Usuario encontrado:", { id: usuario.id_usuarios, rol: usuario.rol })

    // Verificar que no existe ya un perfil de guía para este usuario
    const guiaExistente = await Guia.findOne({
      where: { id_usuario: guiaData.id_usuario },
    })

    if (guiaExistente) {
      console.log("[v0] Ya existe guía para usuario:", guiaData.id_usuario)
      return res.status(400).json({
        success: false,
        message: "Ya existe un perfil de guía para este usuario",
      })
    }

    // Usar roleService.promoteToGuia para sincronizar roles automáticamente
    console.log("[v0] Promoviendo usuario a guía con roleService")

    const adminId = req.user?.id_usuarios || null
    await roleService.promoteToGuia(
      guiaData.id_usuario,
      {
        matricula: guiaData.matricula,
        certificaciones: guiaData.certificaciones || null,
        especialidades: guiaData.especialidades || null,
        anos_experiencia: guiaData.anos_experiencia || null,
        idiomas: guiaData.idiomas || "Español",
        tarifa_por_dia: guiaData.tarifa_por_dia || null,
        disponible: guiaData.disponible !== undefined ? guiaData.disponible : true,
        activo: guiaData.activo !== undefined ? guiaData.activo : true,
        calificacion_promedio: guiaData.calificacion_promedio || 0.0,
        numero_resenas: guiaData.numero_resenas || 0,
      },
      adminId,
      "Guía creado desde el panel de administración"
    )

    console.log("[v0] Guía creado y rol sincronizado exitosamente")

    // Obtener el guía completo recién creado
    const guia = await Guia.findOne({
      where: { id_usuario: guiaData.id_usuario },
      include: [
        {
          model: Usuario,
          as: "usuario",
          attributes: ["id_usuarios", "nombre", "apellido", "email"],
        },
      ],
    })

    res.status(201).json({
      success: true,
      message: "Perfil de guía creado exitosamente y rol sincronizado",
      data: { guia },
    })
  } catch (error) {
    console.error("[v0] Error al crear guía:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    })
  }
}

export const updateGuia = async (req, res) => {
  try {
    // Validaciones
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Datos de entrada inválidos",
        errors: errors.array(),
      })
    }

    const { id } = req.params

    // Buscar guía por PK
    const guia = await Guia.findByPk(id)
    if (!guia) {
      return res.status(404).json({
        success: false,
        message: "Guía no encontrado",
      })
    }

    // Actualizar solo lo que viene en req.body
    await guia.update(req.body)

    return res.json({
      success: true,
      message: "Guía actualizado correctamente",
      data: guia,
    })
  } catch (error) {
    console.error("Error en updateGuia:", error)
    return res.status(500).json({
      success: false,
      message: "Error al actualizar guía",
      error: error.message,
    })
  }
}

export const asignarGuiaAViaje = async (req, res) => {
  try {
    const { id_guia, id_fecha_viaje, rol_guia = "principal", tarifa_acordada, observaciones } = req.body

    // Verificar que el guía existe
    const guia = await Guia.findByPk(id_guia)
    if (!guia) {
      return res.status(404).json({
        success: false,
        message: "Guía no encontrado",
      })
    }

    // Verificar que la fecha del viaje existe
    const fechaViaje = await FechaViaje.findByPk(id_fecha_viaje)
    if (!fechaViaje) {
      return res.status(404).json({
        success: false,
        message: "Fecha de viaje no encontrada",
      })
    }

    // Verificar que no esté ya asignado
    const asignacionExistente = await GuiaViaje.findOne({
      where: {
        id_guia,
        id_fecha_viaje,
      },
    })

    if (asignacionExistente) {
      return res.status(400).json({
        success: false,
        message: "El guía ya está asignado a esta fecha de viaje",
      })
    }

    const asignacion = await GuiaViaje.create({
      id_guia,
      id_fecha_viaje,
      rol_guia,
      tarifa_acordada,
      observaciones,
    })

    const asignacionCompleta = await GuiaViaje.findByPk(asignacion.id_guia_viaje, {
      include: [
        {
          model: Guia,
          as: "guia",
          include: [
            {
              model: Usuario,
              as: "usuario",
              attributes: ["nombre", "apellido", "email"],
            },
          ],
        },
        {
          model: FechaViaje,
          as: "fechaViaje",
          include: [
            {
              model: Viaje,
              as: "viaje",
              attributes: ["titulo", "dificultad"],
            },
          ],
        },
      ],
    })

    res.status(201).json({
      success: true,
      message: "Guía asignado exitosamente",
      data: { asignacion: asignacionCompleta },
    })
  } catch (error) {
    console.error("Error al asignar guía:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}

// Obtener guías asignados a una fecha de viaje específica
export const getGuiasByFechaViaje = async (req, res) => {
  try {
    const { fechaId } = req.params

    // Verificar que la fecha existe
    const fechaViaje = await FechaViaje.findByPk(fechaId)
    if (!fechaViaje) {
      return res.status(404).json({
        success: false,
        message: "Fecha de viaje no encontrada",
      })
    }

    // Obtener todas las asignaciones de guías para esta fecha
    const asignaciones = await GuiaViaje.findAll({
      where: { id_fecha_viaje: fechaId },
      include: [
        {
          model: Guia,
          as: "guia",
          include: [
            {
              model: Usuario,
              as: "usuario",
              attributes: ["id_usuarios", "nombre", "apellido", "email", "telefono", "avatar"],
            },
          ],
        },
      ],
      order: [["fecha_asignacion", "DESC"]],
    })

    res.json({
      success: true,
      data: { asignaciones },
    })
  } catch (error) {
    console.error("Error al obtener guías de fecha:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    })
  }
}

// Actualizar una asignación de guía existente
export const updateGuiaAssignment = async (req, res) => {
  try {
    const { id } = req.params
    const { rol_guia, tarifa_acordada, estado_asignacion, observaciones } = req.body

    const asignacion = await GuiaViaje.findByPk(id)
    if (!asignacion) {
      return res.status(404).json({
        success: false,
        message: "Asignación no encontrada",
      })
    }

    // Actualizar solo los campos proporcionados
    const updateData = {}
    if (rol_guia !== undefined) updateData.rol_guia = rol_guia
    if (tarifa_acordada !== undefined) updateData.tarifa_acordada = tarifa_acordada
    if (estado_asignacion !== undefined) updateData.estado_asignacion = estado_asignacion
    if (observaciones !== undefined) updateData.observaciones = observaciones

    await asignacion.update(updateData)

    // Obtener la asignación actualizada con todas las relaciones
    const asignacionActualizada = await GuiaViaje.findByPk(id, {
      include: [
        {
          model: Guia,
          as: "guia",
          include: [
            {
              model: Usuario,
              as: "usuario",
              attributes: ["nombre", "apellido", "email"],
            },
          ],
        },
        {
          model: FechaViaje,
          as: "fechaViaje",
        },
      ],
    })

    res.json({
      success: true,
      message: "Asignación actualizada exitosamente",
      data: { asignacion: asignacionActualizada },
    })
  } catch (error) {
    console.error("Error al actualizar asignación:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    })
  }
}

// Eliminar una asignación de guía
export const removeGuiaAssignment = async (req, res) => {
  try {
    const { id } = req.params

    const asignacion = await GuiaViaje.findByPk(id)
    if (!asignacion) {
      return res.status(404).json({
        success: false,
        message: "Asignación no encontrada",
      })
    }

    await asignacion.destroy()

    res.json({
      success: true,
      message: "Asignación eliminada exitosamente",
    })
  } catch (error) {
    console.error("Error al eliminar asignación:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    })
  }
}

export const debugAllGuias = async (req, res) => {
  try {
    console.log("[v0] Debug: Obteniendo todos los guías sin filtros")

    const guias = await Guia.findAll({
      include: [
        {
          model: Usuario,
          as: "usuario",
          attributes: ["id_usuarios", "nombre", "apellido", "email", "telefono", "rol", "avatar"],
        },
      ],
      order: [["id_guia", "ASC"]],
    })

    console.log(`[v0] Debug: Encontrados ${guias.length} guías en total`)

    const usuarios = await Usuario.findAll({
      attributes: ["id_usuarios", "nombre", "apellido", "email", "rol", "avatar"],
      order: [["id_usuarios", "ASC"]],
    })

    console.log(`[v0] Debug: Encontrados ${usuarios.length} usuarios en total`)

    const usuariosGuia = usuarios.filter((u) => u.rol === "guia")
    const usuariosGuiaSinPerfil = usuariosGuia.filter((u) => !guias.some((g) => g.id_usuario === u.id_usuarios))

    console.log(`[v0] Debug: Usuarios con rol guía: ${usuariosGuia.length}`)
    console.log(`[v0] Debug: Usuarios guía sin perfil: ${usuariosGuiaSinPerfil.length}`)

    res.json({
      success: true,
      debug: true,
      data: {
        totalGuias: guias.length,
        totalUsuarios: usuarios.length,
        usuariosConRolGuia: usuariosGuia.length,
        usuariosGuiaSinPerfil: usuariosGuiaSinPerfil.length,
        guias: guias,
        usuarios: usuarios,
        usuariosGuia: usuariosGuia,
        usuariosGuiaSinPerfil: usuariosGuiaSinPerfil,
      },
    })
  } catch (error) {
    console.error("[v0] Error en debug:", error)
    res.status(500).json({
      success: false,
      message: "Error en debug",
      error: error.message,
    })
  }
}
