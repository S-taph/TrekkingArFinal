import { validationResult } from "express-validator"
import { Op } from "sequelize"
import Reserva from "../models/Reserva.js"
import Compra from "../models/Compra.js"
import Usuario from "../models/Usuario.js"
import FechaViaje from "../models/FechaViaje.js"
import Viaje from "../models/Viaje.js"
import sequelize from "../config/database.js"

// Función para generar número de reserva único
const generateReservaNumber = () => {
  const timestamp = Date.now().toString()
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0")
  return `RES-${timestamp.slice(-6)}${random}`
}

export const createReserva = async (req, res) => {
  const transaction = await sequelize.transaction()

  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      await transaction.rollback()
      return res.status(400).json({
        success: false,
        message: "Datos inválidos",
        errors: errors.array(),
      })
    }

    const { id_fecha_viaje, cantidad_personas, observaciones_reserva } = req.body
    const id_usuario = req.user.id_usuarios

    // Verificar que la fecha del viaje existe y está disponible
    // Usar lock para evitar race conditions
    const fechaViaje = await FechaViaje.findByPk(id_fecha_viaje, {
      include: [
        {
          model: Viaje,
          as: "viaje",
          attributes: ["precio_base", "titulo", "maximo_participantes"],
        },
      ],
      lock: transaction.LOCK.UPDATE,
      transaction,
    })

    if (!fechaViaje) {
      await transaction.rollback()
      return res.status(404).json({
        success: false,
        message: "Fecha de viaje no encontrada",
      })
    }

    // Verificar estado de la fecha
    if (fechaViaje.estado_fecha === "cancelado") {
      await transaction.rollback()
      return res.status(400).json({
        success: false,
        message: "Esta fecha de viaje ha sido cancelada",
      })
    }

    if (fechaViaje.estado_fecha === "completo") {
      await transaction.rollback()
      return res.status(400).json({
        success: false,
        message: "Esta fecha de viaje está completa. No hay cupos disponibles",
      })
    }

    // Verificar cupos disponibles
    const cuposDisponibles = fechaViaje.cupos_totales - fechaViaje.cupos_ocupados
    if (cuposDisponibles < cantidad_personas) {
      await transaction.rollback()
      return res.status(400).json({
        success: false,
        message: `No hay cupos suficientes. Disponibles: ${cuposDisponibles}`,
      })
    }

    // Verificar que no exceda el máximo de participantes del viaje
    if (fechaViaje.viaje.maximo_participantes) {
      const nuevosCuposOcupados = fechaViaje.cupos_ocupados + cantidad_personas
      if (nuevosCuposOcupados > fechaViaje.viaje.maximo_participantes) {
        await transaction.rollback()
        return res.status(400).json({
          success: false,
          message: `Esta reserva excedería el máximo de participantes permitidos (${fechaViaje.viaje.maximo_participantes})`,
        })
      }
    }

    // Obtener el precio: usar precio_fecha si existe, sino precio_base del viaje
    const precio_unitario = fechaViaje.precio_fecha || fechaViaje.viaje.precio_base
    const subtotal_reserva = precio_unitario * cantidad_personas

    // Crear compra primero
    const compra = await Compra.create(
      {
        numero_compra: `COMP-${Date.now()}`,
        id_usuario,
        total_compra: subtotal_reserva,
        estado_compra: "pendiente",
      },
      { transaction },
    )

    // Crear la reserva
    const reserva = await Reserva.create(
      {
        numero_reserva: generateReservaNumber(),
        id_compra: compra.id_compras,
        id_usuario,
        id_fecha_viaje,
        cantidad_personas,
        precio_unitario,
        subtotal_reserva,
        estado_reserva: "pendiente",
        observaciones_reserva,
      },
      { transaction },
    )

    // Actualizar cupos ocupados
    const nuevosCuposOcupados = fechaViaje.cupos_ocupados + cantidad_personas
    await fechaViaje.update(
      {
        cupos_ocupados: nuevosCuposOcupados,
      },
      { transaction },
    )

    // Si se llenaron todos los cupos, marcar como completo
    if (nuevosCuposOcupados >= fechaViaje.cupos_totales) {
      await fechaViaje.update(
        {
          estado_fecha: "completo",
        },
        { transaction },
      )
      console.log(`[Reservas] Fecha de viaje ${id_fecha_viaje} marcada como completa`)
    }

    await transaction.commit()
    console.log(`[Reservas] Reserva creada exitosamente. Cupos ocupados: ${nuevosCuposOcupados}/${fechaViaje.cupos_totales}`)

    // Obtener reserva completa con relaciones
    const reservaCompleta = await Reserva.findByPk(reserva.id_reserva, {
      include: [
        {
          model: Usuario,
          as: "usuario",
          attributes: ["id_usuarios", "nombre", "apellido", "email", "avatar"],
        },
        {
          model: Compra,
          as: "compra",
          attributes: ["id_compras", "numero_compra", "total_compra", "estado_compra"],
        },
      ],
    })

    res.status(201).json({
      success: true,
      message: "Reserva creada exitosamente",
      data: { reserva: reservaCompleta },
    })
  } catch (error) {
    await transaction.rollback()
    console.error("Error al crear reserva:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}

export const getReservasByUser = async (req, res) => {
  try {
    const id_usuario = req.user.id_usuarios
    const { estado, page = 1, limit = 10 } = req.query

    const whereClause = { id_usuario }
    if (estado) whereClause.estado_reserva = estado

    const offset = (page - 1) * limit

    const { count, rows: reservas } = await Reserva.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Compra,
          as: "compra",
          attributes: ["id_compras", "numero_compra", "total_compra", "estado_compra"],
        },
        {
          model: FechaViaje,
          as: "fecha_viaje",
          include: [
            {
              model: Viaje,
              as: "viaje",
              attributes: ["id_viaje", "titulo", "descripcion_corta", "imagen_principal_url", "duracion_dias", "dificultad"],
            },
          ],
        },
      ],
      limit: Number.parseInt(limit),
      offset: Number.parseInt(offset),
      order: [["fecha_reserva", "DESC"]], // las más recientes primero
    })

    res.json({
      success: true,
      data: {
        reservas,
        pagination: {
          currentPage: Number.parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: Number.parseInt(limit),
        },
      },
    })
  } catch (error) {
    console.error("Error al obtener reservas del usuario:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}

export const getAllReservas = async (req, res) => {
  try {
    const { estado, fecha_desde, fecha_hasta, page = 1, limit = 10 } = req.query

    const whereClause = {}
    if (estado) whereClause.estado_reserva = estado

    // Filtros por fecha
    if (fecha_desde || fecha_hasta) {
      whereClause.fecha_reserva = {}
      if (fecha_desde) whereClause.fecha_reserva[Op.gte] = new Date(fecha_desde)
      if (fecha_hasta) whereClause.fecha_reserva[Op.lte] = new Date(fecha_hasta)
    }

    const offset = (page - 1) * limit

    const { count, rows: reservas } = await Reserva.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Usuario,
          as: "usuario",
          attributes: ["id_usuarios", "nombre", "apellido", "email", "telefono", "avatar"],
        },
        {
          model: Compra,
          as: "compra",
          attributes: ["id_compras", "numero_compra", "total_compra", "estado_compra"],
        },
        {
          model: FechaViaje,
          as: "fecha_viaje",
          include: [
            {
              model: Viaje,
              as: "viaje",
              attributes: ["id_viaje", "titulo", "descripcion_corta", "duracion_dias", "dificultad"],
            },
          ],
        },
      ],
      limit: Number.parseInt(limit),
      offset: Number.parseInt(offset),
      order: [["fecha_reserva", "DESC"]],
    })

    res.json({
      success: true,
      data: {
        reservas,
        pagination: {
          currentPage: Number.parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: Number.parseInt(limit),
        },
      },
    })
  } catch (error) {
    console.error("Error al obtener todas las reservas:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}

export const updateReservaStatus = async (req, res) => {
  const transaction = await sequelize.transaction()

  try {
    const { id } = req.params
    const { estado_reserva, observaciones_reserva } = req.body

    const reserva = await Reserva.findByPk(id, {
      include: [
        {
          model: FechaViaje,
          as: "fecha_viaje",
        },
      ],
      transaction,
    })

    if (!reserva) {
      await transaction.rollback()
      return res.status(404).json({
        success: false,
        message: "Reserva no encontrada",
      })
    }

    // Validar transiciones de estado válidas
    const estadosValidos = ["pendiente", "confirmada", "en_progreso", "completada", "cancelada"]
    if (!estadosValidos.includes(estado_reserva)) {
      await transaction.rollback()
      return res.status(400).json({
        success: false,
        message: "Estado de reserva inválido",
      })
    }

    const estadoAnterior = reserva.estado_reserva

    // Actualizar reserva
    await reserva.update({
      estado_reserva,
      ...(observaciones_reserva && { observaciones_reserva }),
    }, { transaction })

    // Ajustar cupos según cambios de estado
    // Solo si cambia de/a cancelada, porque los otros estados mantienen los cupos ocupados
    const fechaViaje = await FechaViaje.findByPk(reserva.id_fecha_viaje, {
      lock: transaction.LOCK.UPDATE,
      transaction,
    })

    if (!fechaViaje) {
      await transaction.rollback()
      return res.status(404).json({
        success: false,
        message: "Fecha de viaje no encontrada",
      })
    }

    // Si cambia DE cancelada A otro estado -> ocupar cupos
    if (estadoAnterior === "cancelada" && estado_reserva !== "cancelada") {
      const nuevosCuposOcupados = fechaViaje.cupos_ocupados + reserva.cantidad_personas
      await fechaViaje.update(
        { cupos_ocupados: nuevosCuposOcupados },
        { transaction }
      )
      console.log(`[Reservas] Cupos ocupados aumentados: ${nuevosCuposOcupados}/${fechaViaje.cupos_totales}`)
    }

    // Si cambia A cancelada DESDE otro estado -> liberar cupos
    if (estadoAnterior !== "cancelada" && estado_reserva === "cancelada") {
      const nuevosCuposOcupados = Math.max(0, fechaViaje.cupos_ocupados - reserva.cantidad_personas)
      await fechaViaje.update(
        { cupos_ocupados: nuevosCuposOcupados },
        { transaction }
      )

      // Si estaba completo y ahora hay cupos, marcar como disponible
      if (fechaViaje.estado_fecha === "completo" && nuevosCuposOcupados < fechaViaje.cupos_totales) {
        await fechaViaje.update(
          { estado_fecha: "disponible" },
          { transaction }
        )
      }

      console.log(`[Reservas] Cupos liberados: ${nuevosCuposOcupados}/${fechaViaje.cupos_totales}`)
    }

    await transaction.commit()

    const reservaActualizada = await Reserva.findByPk(id, {
      include: [
        {
          model: Usuario,
          as: "usuario",
          attributes: ["id_usuarios", "nombre", "apellido", "email", "avatar"],
        },
        {
          model: Compra,
          as: "compra",
          attributes: ["id_compras", "numero_compra", "estado_compra"],
        },
      ],
    })

    res.json({
      success: true,
      message: "Estado de reserva actualizado exitosamente",
      data: { reserva: reservaActualizada },
    })
  } catch (error) {
    await transaction.rollback()
    console.error("Error al actualizar estado de reserva:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}

export const cancelReserva = async (req, res) => {
  const transaction = await sequelize.transaction()

  try {
    const { id } = req.params
    const id_usuario = req.user.id_usuarios

    const reserva = await Reserva.findOne({
      where: {
        id_reserva: id,
        id_usuario, // Solo el usuario propietario puede cancelar
      },
      include: [
        {
          model: Compra,
          as: "compra",
        },
      ],
      transaction,
    })

    if (!reserva) {
      await transaction.rollback()
      return res.status(404).json({
        success: false,
        message: "Reserva no encontrada o no tienes permisos para cancelarla",
      })
    }

    if (reserva.estado_reserva === "cancelada") {
      await transaction.rollback()
      return res.status(400).json({
        success: false,
        message: "La reserva ya está cancelada",
      })
    }

    if (reserva.estado_reserva === "completada") {
      await transaction.rollback()
      return res.status(400).json({
        success: false,
        message: "No se puede cancelar una reserva completada",
      })
    }

    // Obtener fecha del viaje con lock
    const fechaViaje = await FechaViaje.findByPk(reserva.id_fecha_viaje, {
      lock: transaction.LOCK.UPDATE,
      transaction,
    })

    if (!fechaViaje) {
      await transaction.rollback()
      return res.status(404).json({
        success: false,
        message: "Fecha de viaje no encontrada",
      })
    }

    // Actualizar reserva y compra
    await reserva.update({ estado_reserva: "cancelada" }, { transaction })
    await reserva.compra.update({ estado_compra: "cancelada" }, { transaction })

    // Liberar cupos ocupados
    const nuevosCuposOcupados = Math.max(0, fechaViaje.cupos_ocupados - reserva.cantidad_personas)
    await fechaViaje.update(
      {
        cupos_ocupados: nuevosCuposOcupados,
      },
      { transaction },
    )

    // Si el estado era "completo" y ahora hay cupos disponibles, cambiar a "disponible"
    if (fechaViaje.estado_fecha === "completo" && nuevosCuposOcupados < fechaViaje.cupos_totales) {
      await fechaViaje.update(
        {
          estado_fecha: "disponible",
        },
        { transaction },
      )
      console.log(`[Reservas] Fecha de viaje ${reserva.id_fecha_viaje} marcada como disponible`)
    }

    await transaction.commit()
    console.log(`[Reservas] Reserva cancelada. Cupos liberados: ${reserva.cantidad_personas}. Cupos ocupados: ${nuevosCuposOcupados}/${fechaViaje.cupos_totales}`)

    res.json({
      success: true,
      message: "Reserva cancelada exitosamente",
    })
  } catch (error) {
    await transaction.rollback()
    console.error("Error al cancelar reserva:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}

/**
 * Sincroniza los cupos_ocupados de todas las fechas de viaje
 * basándose en las reservas no canceladas
 * ADMIN ONLY - para corregir inconsistencias
 */
export const syncCuposOcupados = async (req, res) => {
  const transaction = await sequelize.transaction()

  try {
    // Obtener todas las fechas de viaje
    const fechasViaje = await FechaViaje.findAll({ transaction })

    let actualizaciones = 0
    const resultados = []

    for (const fechaViaje of fechasViaje) {
      // Calcular cupos ocupados basados en reservas NO canceladas
      const reservasActivas = await Reserva.findAll({
        where: {
          id_fecha_viaje: fechaViaje.id_fechas_viaje,
          estado_reserva: {
            [Op.ne]: "cancelada", // Diferente de cancelada
          },
        },
        transaction,
      })

      const cuposCalculados = reservasActivas.reduce(
        (sum, reserva) => sum + reserva.cantidad_personas,
        0
      )

      // Si hay diferencia, actualizar
      if (fechaViaje.cupos_ocupados !== cuposCalculados) {
        await fechaViaje.update(
          { cupos_ocupados: cuposCalculados },
          { transaction }
        )

        resultados.push({
          id_fecha_viaje: fechaViaje.id_fechas_viaje,
          cupos_anteriores: fechaViaje.cupos_ocupados,
          cupos_nuevos: cuposCalculados,
          diferencia: cuposCalculados - fechaViaje.cupos_ocupados,
        })

        actualizaciones++

        console.log(
          `[Sync] Fecha ${fechaViaje.id_fechas_viaje}: ${fechaViaje.cupos_ocupados} -> ${cuposCalculados}`
        )
      }
    }

    await transaction.commit()

    res.json({
      success: true,
      message: `Sincronización completada. ${actualizaciones} fechas actualizadas`,
      data: {
        fechas_procesadas: fechasViaje.length,
        fechas_actualizadas: actualizaciones,
        detalles: resultados,
      },
    })
  } catch (error) {
    await transaction.rollback()
    console.error("Error sincronizando cupos:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}

/**
 * Obtener diagnóstico detallado de cupos para una fecha específica
 * Muestra todas las reservas no canceladas y calcula el sobrecupo
 */
export const diagnosticoCupos = async (req, res) => {
  try {
    const { idFechaViaje } = req.params

    // Obtener la fecha de viaje con su viaje
    const fechaViaje = await FechaViaje.findByPk(idFechaViaje, {
      include: [
        {
          model: Viaje,
          as: "viaje",
          attributes: ["titulo"],
        },
      ],
    })

    if (!fechaViaje) {
      return res.status(404).json({
        success: false,
        message: "Fecha de viaje no encontrada",
      })
    }

    // Obtener todas las reservas NO canceladas para esta fecha
    const reservasActivas = await Reserva.findAll({
      where: {
        id_fecha_viaje: idFechaViaje,
        estado_reserva: {
          [Op.ne]: "cancelada",
        },
      },
      include: [
        {
          model: Usuario,
          as: "usuario",
          attributes: ["email", "nombre", "apellido", "avatar"],
        },
      ],
      order: [["fecha_reserva", "ASC"]],
    })

    // Calcular totales
    const totalPersonas = reservasActivas.reduce(
      (sum, reserva) => sum + reserva.cantidad_personas,
      0
    )

    // Formatear reservas para el diagnóstico
    const reservasDetalle = reservasActivas.map((reserva) => ({
      id_reserva: reserva.id_reserva,
      numero_reserva: reserva.numero_reserva,
      cantidad_personas: reserva.cantidad_personas,
      estado_reserva: reserva.estado_reserva,
      fecha_reserva: reserva.fecha_reserva,
      cliente_email: reserva.usuario?.email || "Sin email",
      cliente_nombre:
        `${reserva.usuario?.nombre || ""} ${reserva.usuario?.apellido || ""}`.trim() ||
        "Sin nombre",
    }))

    res.json({
      success: true,
      data: {
        id_fecha_viaje: fechaViaje.id_fechas_viaje,
        viaje_titulo: fechaViaje.viaje?.titulo || "Sin título",
        fecha_inicio: fechaViaje.fecha_inicio,
        fecha_fin: fechaViaje.fecha_fin,
        cupos_totales: fechaViaje.cupos_totales,
        cupos_ocupados: fechaViaje.cupos_ocupados,
        cupos_disponibles: fechaViaje.cupos_disponibles,
        total_reservas: reservasActivas.length,
        total_personas: totalPersonas,
        sobrecupo: Math.max(0, totalPersonas - fechaViaje.cupos_totales),
        reservas: reservasDetalle,
      },
    })
  } catch (error) {
    console.error("Error en diagnóstico de cupos:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}

/**
 * RESETEAR TODAS LAS RESERVAS
 * ⚠️ CUIDADO: Elimina todas las reservas, compras y items de carrito
 * Solo para desarrollo o limpieza completa del sistema
 * ADMIN ONLY
 */
export const resetAllReservas = async (req, res) => {
  const transaction = await sequelize.transaction()

  try {
    // Importar modelos necesarios
    const CarritoItem = (await import("../models/CarritoItem.js")).default
    const Carrito = (await import("../models/Carrito.js")).default
    const Pago = (await import("../models/Pago.js")).default

    // 1. Contar antes de eliminar
    const countReservas = await Reserva.count({ transaction })
    const countCompras = await Compra.count({ transaction })
    const countPagos = await Pago.count({ transaction })
    const countCarritoItems = await CarritoItem.count({ transaction })
    const countCarritos = await Carrito.count({ transaction })

    // 2. Eliminar PAGOS PRIMERO (referencian a compras)
    await Pago.destroy({
      where: {},
      truncate: false,
      transaction,
    })

    // 3. Eliminar RESERVAS (referencian a compras)
    await Reserva.destroy({
      where: {},
      truncate: false,
      transaction,
    })

    // 4. Eliminar COMPRAS (ya no tienen dependencias)
    await Compra.destroy({
      where: {},
      truncate: false,
      transaction,
    })

    // 5. Eliminar ITEMS DE CARRITO (referencian a carritos)
    await CarritoItem.destroy({
      where: {},
      truncate: false,
      transaction,
    })

    // 6. Eliminar CARRITOS (ya no tienen items)
    await Carrito.destroy({
      where: {},
      truncate: false,
      transaction,
    })

    // 7. Resetear cupos_ocupados de todas las fechas a 0
    const fechasViaje = await FechaViaje.findAll({ transaction })
    await FechaViaje.update(
      { cupos_ocupados: 0 },
      { where: {}, transaction }
    )

    await transaction.commit()

    console.log("⚠️  [RESET] Todas las reservas han sido eliminadas")
    console.log(`   - Pagos eliminados: ${countPagos}`)
    console.log(`   - Reservas eliminadas: ${countReservas}`)
    console.log(`   - Compras eliminadas: ${countCompras}`)
    console.log(`   - Items de carrito eliminados: ${countCarritoItems}`)
    console.log(`   - Carritos eliminados: ${countCarritos}`)
    console.log(`   - Fechas reseteadas: ${fechasViaje.length}`)

    res.json({
      success: true,
      message: "Todas las reservas han sido eliminadas exitosamente",
      data: {
        pagos_eliminados: countPagos,
        reservas_eliminadas: countReservas,
        compras_eliminadas: countCompras,
        items_carrito_eliminados: countCarritoItems,
        carritos_eliminados: countCarritos,
        fechas_reseteadas: fechasViaje.length,
      },
    })
  } catch (error) {
    await transaction.rollback()
    console.error("Error reseteando reservas:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}

// TODO: agregar endpoint para obtener reserva por ID
// TODO: implementar sistema de reembolsos
// TODO: agregar validación de fechas de cancelación
