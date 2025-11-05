import { validationResult } from "express-validator"
import sequelize from "../config/database.js"
import Pago from "../models/Pago.js"
import Compra from "../models/Compra.js"
import Reserva from "../models/Reserva.js"
import Usuario from "../models/Usuario.js"
import FechaViaje from "../models/FechaViaje.js"
import Viaje from "../models/Viaje.js"
import MetodoPago from "../models/MetodoPago.js"
import { crearPreferencia, procesarWebhook as procesarWebhookMP, verificarCredenciales } from "../services/mercadopagoService.js"

// Tarjetas de prueba aceptadas
const TARJETAS_PRUEBA = {
  "4111111111111111": { tipo: "visa", descripcion: "Visa - Aprobada" },
  "5555555555554444": { tipo: "mastercard", descripcion: "Mastercard - Aprobada" },
  "378282246310005": { tipo: "amex", descripcion: "American Express - Aprobada" },
  "4000000000000002": { tipo: "visa", descripcion: "Visa - Rechazada por fondos insuficientes" },
  "4000000000000069": { tipo: "visa", descripcion: "Visa - Tarjeta vencida" },
}

/**
 * Simula el procesamiento de un pago con tarjeta
 */
const procesarPagoTarjeta = async (cardData) => {
  // Validar que sea una tarjeta de prueba válida
  const tarjetaInfo = TARJETAS_PRUEBA[cardData.numero]

  if (!tarjetaInfo) {
    return {
      success: false,
      error: "Tarjeta no válida. Use una tarjeta de prueba.",
      codigo_error: "INVALID_CARD",
    }
  }

  // Simular validaciones
  if (cardData.numero === "4000000000000002") {
    return {
      success: false,
      error: "Fondos insuficientes",
      codigo_error: "INSUFFICIENT_FUNDS",
    }
  }

  if (cardData.numero === "4000000000000069") {
    return {
      success: false,
      error: "Tarjeta vencida",
      codigo_error: "EXPIRED_CARD",
    }
  }

  // Simular procesamiento exitoso
  await new Promise((resolve) => setTimeout(resolve, 1500)) // Simular delay de procesamiento

  return {
    success: true,
    transaction_id: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    authorization_code: Math.random().toString(36).substr(2, 6).toUpperCase(),
    tipo_tarjeta: tarjetaInfo.tipo,
  }
}

/**
 * Procesar pago y confirmar reserva
 */
export const procesarPago = async (req, res) => {
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

    const { id_compra, metodo_pago, card_data } = req.body
    const id_usuario = req.user.id_usuarios

    // Verificar que la compra existe y pertenece al usuario
    const compra = await Compra.findOne({
      where: {
        id_compras: id_compra,
        id_usuario,
        estado_compra: "pendiente",
      },
    })

    if (!compra) {
      await transaction.rollback()
      return res.status(404).json({
        success: false,
        message: "Compra no encontrada o ya fue procesada",
      })
    }

    // Obtener el método de pago
    let metodoPago = await MetodoPago.findOne({
      where: { nombre: metodo_pago, activo: true },
    })

    // Si no existe, crear método de pago por defecto
    if (!metodoPago) {
      metodoPago = await MetodoPago.create(
        {
          nombre: metodo_pago,
          descripcion: `Pago con ${metodo_pago}`,
          activo: true,
        },
        { transaction },
      )
    }

    let pagoResult
    let estadoPago = "pendiente"
    let referenciaExterna = null

    // Procesar según el método de pago
    if (metodo_pago === "tarjeta" && card_data) {
      pagoResult = await procesarPagoTarjeta(card_data)

      if (!pagoResult.success) {
        await transaction.rollback()
        return res.status(400).json({
          success: false,
          message: pagoResult.error,
          codigo_error: pagoResult.codigo_error,
        })
      }

      estadoPago = "aprobado"
      referenciaExterna = pagoResult.transaction_id
    } else if (metodo_pago === "pagar_despues") {
      estadoPago = "pendiente"
      referenciaExterna = `PENDING-${Date.now()}`
    }

    // Crear registro de pago
    const pago = await Pago.create(
      {
        id_compra: compra.id_compras,
        id_metodo_pago: metodoPago.id_metodo_pago,
        monto: compra.total_compra,
        estado_pago: estadoPago,
        referencia_externa: referenciaExterna,
        fecha_pago: estadoPago === "aprobado" ? new Date() : null,
      },
      { transaction },
    )

    // Actualizar estado de la compra
    await compra.update(
      {
        estado_compra: estadoPago === "aprobado" ? "pagada" : "pendiente",
      },
      { transaction },
    )

    // Si el pago fue aprobado, confirmar todas las reservas asociadas
    if (estadoPago === "aprobado") {
      await Reserva.update(
        { estado_reserva: "confirmada" },
        {
          where: { id_compra: compra.id_compras },
          transaction,
        },
      )
    }

    await transaction.commit()

    // Obtener datos completos para la respuesta
    const pagoCompleto = await Pago.findByPk(pago.id_pago, {
      include: [
        {
          model: Compra,
          as: "compra",
          include: [
            {
              model: Reserva,
              as: "reservas",
              include: [
                {
                  model: FechaViaje,
                  as: "fecha_viaje",
                  include: [
                    {
                      model: Viaje,
                      as: "viaje",
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          model: MetodoPago,
          as: "metodo_pago",
        },
      ],
    })

    // Enviar notificación a administradores (simulado)
    if (estadoPago === "aprobado") {
      console.log("=".repeat(60))
      console.log("📧 NOTIFICACIÓN A ADMINISTRADORES")
      console.log("=".repeat(60))
      console.log(`✅ Nueva reserva confirmada`)
      console.log(`Compra: ${compra.numero_compra}`)
      console.log(`Usuario: ${req.user.nombre} ${req.user.apellido}`)
      console.log(`Email: ${req.user.email}`)
      console.log(`Monto: $${compra.total_compra}`)
      console.log(`Método de pago: ${metodo_pago}`)
      console.log(`Referencia: ${referenciaExterna}`)
      console.log(`Fecha: ${new Date().toLocaleString()}`)
      console.log("=".repeat(60))
    }

    res.status(200).json({
      success: true,
      message:
        estadoPago === "aprobado"
          ? "Pago procesado exitosamente. Reserva confirmada."
          : "Solicitud de pago registrada. Pendiente de confirmación.",
      data: {
        pago: pagoCompleto,
        authorization_code: pagoResult?.authorization_code,
      },
    })
  } catch (error) {
    await transaction.rollback()
    console.error("=".repeat(60))
    console.error("❌ ERROR AL PROCESAR PAGO")
    console.error("=".repeat(60))
    console.error("Error message:", error.message)
    console.error("Error stack:", error.stack)
    console.error("Request body:", JSON.stringify(req.body, null, 2))
    console.error("User:", req.user?.email)
    console.error("=".repeat(60))
    res.status(500).json({
      success: false,
      message: "Error al procesar el pago",
      error: error.message,
    })
  }
}

/**
 * Obtener historial de pagos del usuario
 */
export const obtenerPagosUsuario = async (req, res) => {
  try {
    const id_usuario = req.user.id_usuarios
    const { page = 1, limit = 10 } = req.query

    const offset = (page - 1) * limit

    const { count, rows: pagos } = await Pago.findAndCountAll({
      include: [
        {
          model: Compra,
          as: "compra",
          where: { id_usuario },
          include: [
            {
              model: Reserva,
              as: "reservas",
            },
          ],
        },
        {
          model: MetodoPago,
          as: "metodo_pago",
        },
      ],
      limit: Number.parseInt(limit),
      offset: Number.parseInt(offset),
      order: [["fecha_creacion", "DESC"]],
    })

    res.json({
      success: true,
      data: {
        pagos,
        pagination: {
          currentPage: Number.parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: Number.parseInt(limit),
        },
      },
    })
  } catch (error) {
    console.error("Error al obtener pagos:", error)
    res.status(500).json({
      success: false,
      message: "Error al obtener historial de pagos",
    })
  }
}

/**
 * Obtener información de tarjetas de prueba (solo para desarrollo)
 */
export const obtenerTarjetasPrueba = async (req, res) => {
  res.json({
    success: true,
    message: "Tarjetas de prueba disponibles",
    data: {
      tarjetas: Object.entries(TARJETAS_PRUEBA).map(([numero, info]) => ({
        numero,
        tipo: info.tipo,
        descripcion: info.descripcion,
      })),
      instrucciones: {
        numero: "Use uno de los números de tarjeta de prueba",
        nombre: "Cualquier nombre es válido",
        vencimiento: "Use una fecha futura (ej: 12/25)",
        cvv: "Cualquier CVV de 3 o 4 dígitos (ej: 123)",
      },
    },
  })
}

/**
 * Crear preferencia de pago en Mercado Pago
 */
export const crearPreferenciaMercadoPago = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Datos inválidos",
        errors: errors.array(),
      })
    }

    const { id_compra } = req.body
    const id_usuario = req.user.id_usuarios

    // Verificar credenciales de Mercado Pago
    if (!verificarCredenciales()) {
      return res.status(500).json({
        success: false,
        message: "Mercado Pago no está configurado correctamente",
      })
    }

    // Verificar que la compra existe y pertenece al usuario
    const compra = await Compra.findOne({
      where: {
        id_compras: id_compra,
        id_usuario,
        estado_compra: "pendiente",
      },
      include: [
        {
          model: Reserva,
          as: "reservas",
          include: [
            {
              model: FechaViaje,
              as: "fecha_viaje",
              include: [
                {
                  model: Viaje,
                  as: "viaje",
                },
              ],
            },
          ],
        },
      ],
    })

    if (!compra) {
      return res.status(404).json({
        success: false,
        message: "Compra no encontrada o ya fue procesada",
      })
    }

    // Preparar datos del usuario
    const usuario = await Usuario.findByPk(id_usuario)

    const payer = {
      nombre: usuario.nombre,
      apellido: usuario.apellido || "",
      email: usuario.email,
      telefono: usuario.telefono || "",
      dni: usuario.dni || "",
    }

    // Preparar items de la compra
    const items = compra.reservas.map((reserva) => ({
      id_fecha_viaje: reserva.id_fecha_viaje,
      nombre_viaje: reserva.fecha_viaje.viaje.nombre,
      titulo: `${reserva.fecha_viaje.viaje.nombre} - ${new Date(reserva.fecha_viaje.fecha_inicio).toLocaleDateString()}`,
      descripcion: `Reserva para ${reserva.cantidad_personas} persona(s)`,
      cantidad: 1,
      subtotal: parseFloat(reserva.subtotal_reserva),
    }))

    // Crear preferencia en Mercado Pago
    const preferencia = await crearPreferencia({
      id_compra: compra.id_compras,
      numero_compra: compra.numero_compra,
      total_compra: parseFloat(compra.total_compra),
      items,
      payer,
    })

    res.status(200).json({
      success: true,
      message: "Preferencia de pago creada exitosamente",
      data: {
        preference_id: preferencia.preference_id,
        init_point: preferencia.init_point,
        sandbox_init_point: preferencia.sandbox_init_point,
      },
    })
  } catch (error) {
    console.error("=".repeat(60))
    console.error("❌ ERROR AL CREAR PREFERENCIA DE MERCADO PAGO")
    console.error("=".repeat(60))
    console.error("Error message:", error.message)
    console.error("Error stack:", error.stack)
    console.error("=".repeat(60))
    res.status(500).json({
      success: false,
      message: "Error al crear preferencia de pago",
      error: error.message,
    })
  }
}

/**
 * Webhook para recibir notificaciones de Mercado Pago
 */
export const webhookMercadoPago = async (req, res) => {
  try {
    console.log("🔔 Webhook recibido de Mercado Pago")
    console.log("Query params:", req.query)
    console.log("Body:", req.body)

    // Mercado Pago envía notificaciones con query params
    const { topic, id } = req.query

    // También puede venir en el body
    const webhookData = {
      type: topic || req.body.type,
      data: {
        id: id || req.body.data?.id,
      },
    }

    // Responder inmediatamente a Mercado Pago (200 OK)
    res.status(200).send("OK")

    // Procesar el webhook en segundo plano
    if (webhookData.type && webhookData.data.id) {
      procesarWebhookMP(webhookData)
        .then((result) => {
          console.log("✅ Webhook procesado:", result)
        })
        .catch((error) => {
          console.error("❌ Error al procesar webhook:", error)
        })
    }
  } catch (error) {
    console.error("❌ Error en webhook de Mercado Pago:", error)
    // Aún así responder 200 para evitar reintentos innecesarios
    res.status(200).send("OK")
  }
}

/**
 * Obtener configuración pública de Mercado Pago (Public Key)
 */
export const obtenerConfigMercadoPago = async (req, res) => {
  try {
    const publicKey = process.env.MP_PUBLIC_KEY

    if (!publicKey || publicKey === 'TEST-YOUR-PUBLIC-KEY-HERE') {
      return res.status(500).json({
        success: false,
        message: "Mercado Pago no está configurado",
      })
    }

    res.json({
      success: true,
      data: {
        publicKey,
      },
    })
  } catch (error) {
    console.error("Error al obtener config de Mercado Pago:", error)
    res.status(500).json({
      success: false,
      message: "Error al obtener configuración",
    })
  }
}
