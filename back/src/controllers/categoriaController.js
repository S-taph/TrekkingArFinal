import { validationResult } from "express-validator"
import Categoria from "../models/Categoria.js"
import Viaje from "../models/Viaje.js"

export const getAllCategorias = async (req, res) => {
  try {
    console.log("🔍 Obteniendo categorías...")
    console.log("📥 Query params recibidos:", req.query)

    const { activa, incluir_viajes } = req.query

    const whereClause = {}

    // Fix para MySQL - convierte boolean a número
    // Solo aplicar filtro si se proporciona explícitamente
    if (activa !== undefined && activa !== null && activa !== '') {
      whereClause.activa = activa === "true" || activa === true || activa === "1" || activa === 1 ? 1 : 0
    }

    console.log("📋 Filtros aplicados:", whereClause)

    const includeOptions = []

    // Si se solicita incluir viajes
    if (incluir_viajes === "true" || incluir_viajes === true) {
      includeOptions.push({
        model: Viaje,
        as: "viajes",
        where: { activo: true },
        required: false,
        attributes: ["id_viaje", "titulo", "precio_base", "imagen_principal_url", "dificultad"],
      })
    }

    const categorias = await Categoria.findAll({
      where: whereClause,
      include: includeOptions.length > 0 ? includeOptions : undefined,
      order: [
        ["orden_visualizacion", "ASC"],
        ["nombre", "ASC"],
      ],
    })

    console.log("✅ Categorías encontradas:", categorias.length)

    res.json({
      success: true,
      data: { categorias },
    })
  } catch (error) {
    console.error("❌ Error al obtener categorías:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    })
  }
}

export const getCategoriaById = async (req, res) => {
  try {
    const { id } = req.params

    const categoria = await Categoria.findByPk(id, {
      include: [
        {
          model: Viaje,
          as: "viajes",
          where: { activo: true },
          required: false,
          attributes: ["id_viaje", "titulo", "precio_base", "imagen_principal_url", "dificultad"],
        },
      ],
    })

    if (!categoria) {
      return res.status(404).json({
        success: false,
        message: "Categoría no encontrada",
      })
    }

    res.json({
      success: true,
      data: { categoria },
    })
  } catch (error) {
    console.error("Error al obtener categoría:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}

export const createCategoria = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Datos inválidos",
        errors: errors.array(),
      })
    }

    const { nombre, descripcion, activa = true, orden_visualizacion } = req.body

    // Verificar si la categoría ya existe
    const categoriaExistente = await Categoria.findOne({ where: { nombre } })
    if (categoriaExistente) {
      return res.status(400).json({
        success: false,
        message: `La categoría '${nombre}' ya existe`,
      })
    }

    // Crear nueva categoría
    const categoria = await Categoria.create({
      nombre,
      descripcion,
      activa,
      orden_visualizacion,
      fecha_creacion: new Date()
    })

    res.status(201).json({
      success: true,
      message: "Categoría creada exitosamente",
      data: { categoria },
    })
  } catch (error) {
    console.error("Error al crear categoría:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}


export const updateCategoria = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Datos inválidos",
        errors: errors.array(),
      })
    }

    const { id } = req.params
    const categoria = await Categoria.findByPk(id)

    if (!categoria) {
      return res.status(404).json({
        success: false,
        message: "Categoría no encontrada",
      })
    }

    await categoria.update(req.body)

    res.json({
      success: true,
      message: "Categoría actualizada exitosamente",
      data: { categoria },
    })
  } catch (error) {
    console.error("Error al actualizar categoría:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}

export const deleteCategoria = async (req, res) => {
  try {
    const { id } = req.params

    const categoria = await Categoria.findByPk(id)
    if (!categoria) {
      return res.status(404).json({
        success: false,
        message: "Categoría no encontrada",
      })
    }

    // Verificar si tiene viajes asociados antes de eliminar
    const viajesAsociados = await Viaje.count({
      where: { id_categoria: id, activo: true },
    })

    if (viajesAsociados > 0) {
      return res.status(400).json({
        success: false,
        message: "No se puede eliminar la categoría porque tiene viajes asociados",
      })
    }

    // Soft delete - marcar como inactiva
    await categoria.update({ activa: false })

    res.json({
      success: true,
      message: "Categoría desactivada exitosamente",
    })
  } catch (error) {
    console.error("Error al eliminar categoría:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}
