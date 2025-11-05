/**
 * Carrito Controller
 * 
 * Controlador para manejo del carrito de compras.
 * Permite agregar, actualizar, eliminar items y hacer checkout.
 */

import { validationResult } from "express-validator";
import { Carrito, CarritoItem, FechaViaje, Viaje, Categoria } from "../models/associations.js";

/**
 * Obtiene el carrito activo del usuario autenticado
 */
export const getCarrito = async (req, res) => {
  try {
    const userId = req.user.id_usuarios;

    // Buscar carrito del usuario (solo puede tener uno)
    let carrito = await Carrito.findOne({
      where: {
        id_usuario: userId
      },
      include: [
        {
          model: CarritoItem,
          as: 'items',
          include: [
            {
              model: FechaViaje,
              as: 'fechaViaje',
              include: [
                {
                  model: Viaje,
                  as: 'viaje',
                  include: [
                    {
                      model: Categoria,
                      as: 'categoria'
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    });

    // Si no existe carrito, crear uno nuevo
    if (!carrito) {
      carrito = await Carrito.create({
        id_usuario: userId
      });
    }

    // Calcular totales
    const items = carrito.items || [];
    const subtotal = items.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);
    const totalItems = items.reduce((sum, item) => sum + item.cantidad, 0);

    res.json({
      success: true,
      data: {
        carrito: {
          id: carrito.id_carrito,
          items: items,
          subtotal: subtotal,
          totalItems: totalItems,
          createdAt: carrito.fecha_creacion,
          updatedAt: carrito.fecha_actualizacion
        }
      }
    });

  } catch (error) {
    console.error('Error obteniendo carrito:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Agrega un item al carrito
 */
export const addItem = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Datos inválidos',
        errors: errors.array()
      });
    }

    const { fechaViajeId, cantidad } = req.body;
    const userId = req.user.id_usuarios;

    // Verificar que la fecha de viaje existe y está disponible
    const fechaViaje = await FechaViaje.findByPk(fechaViajeId, {
      include: [
        {
          model: Viaje,
          as: 'viaje'
        }
      ]
    });

    if (!fechaViaje) {
      return res.status(404).json({
        success: false,
        message: 'Fecha de viaje no encontrada'
      });
    }

    if (fechaViaje.estado_fecha !== 'disponible') {
      return res.status(400).json({
        success: false,
        message: 'Esta fecha de viaje no está disponible'
      });
    }

    // Calcular cupos realmente disponibles teniendo en cuenta items en carritos
    const itemsEnCarritos = await CarritoItem.sum('cantidad', {
      where: { fechaViajeId: fechaViajeId }
    }) || 0;

    const cuposRealesDisponibles = fechaViaje.cupos_totales - fechaViaje.cupos_ocupados - itemsEnCarritos;

    // Verificar cupos disponibles
    if (cuposRealesDisponibles < cantidad) {
      return res.status(400).json({
        success: false,
        message: `Solo hay ${Math.max(0, cuposRealesDisponibles)} cupos disponibles`
      });
    }

    // Buscar o crear carrito del usuario
    let carrito = await Carrito.findOne({
      where: {
        id_usuario: userId
      }
    });

    if (!carrito) {
      carrito = await Carrito.create({
        id_usuario: userId
      });
    }

    // Verificar si ya existe un item para esta fecha de viaje
    let carritoItem = await CarritoItem.findOne({
      where: {
        carritoId: carrito.id_carrito,
        fechaViajeId: fechaViajeId
      }
    });

    const precioUnitario = fechaViaje.precio_fecha || fechaViaje.viaje.precio_base;

    if (carritoItem) {
      // Actualizar cantidad existente
      const nuevaCantidad = carritoItem.cantidad + cantidad;

      // Recalcular cupos disponibles excluyendo la cantidad actual de este item
      const itemsEnCarritosSinEste = itemsEnCarritos - carritoItem.cantidad;
      const cuposRealesParaActualizar = fechaViaje.cupos_totales - fechaViaje.cupos_ocupados - itemsEnCarritosSinEste;

      // Verificar cupos nuevamente
      if (cuposRealesParaActualizar < nuevaCantidad) {
        return res.status(400).json({
          success: false,
          message: `No hay suficientes cupos. Disponibles: ${Math.max(0, cuposRealesParaActualizar)}, solicitados: ${nuevaCantidad}`
        });
      }

      carritoItem.cantidad = nuevaCantidad;
      carritoItem.subtotal = nuevaCantidad * precioUnitario;
      await carritoItem.save();
    } else {
      // Crear nuevo item
      carritoItem = await CarritoItem.create({
        carritoId: carrito.id_carrito,
        fechaViajeId: fechaViajeId,
        cantidad: cantidad,
        precio_unitario: precioUnitario,
        subtotal: cantidad * precioUnitario
      });
    }

    // Obtener el item completo con relaciones
    const itemCompleto = await CarritoItem.findByPk(carritoItem.id, {
      include: [
        {
          model: FechaViaje,
          as: 'fechaViaje',
          include: [
            {
              model: Viaje,
              as: 'viaje',
              include: [
                {
                  model: Categoria,
                  as: 'categoria'
                }
              ]
            }
          ]
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Item agregado al carrito',
      data: {
        item: itemCompleto
      }
    });

  } catch (error) {
    console.error('Error agregando item al carrito:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Actualiza la cantidad de un item en el carrito
 */
export const updateItem = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Datos inválidos',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { cantidad } = req.body;
    const userId = req.user.id_usuarios;

    // Buscar el item del carrito
    const carritoItem = await CarritoItem.findByPk(id, {
      include: [
        {
          model: Carrito,
          as: 'carrito',
          where: {
            id_usuario: userId
          }
        },
        {
          model: FechaViaje,
          as: 'fechaViaje'
        }
      ]
    });

    if (!carritoItem) {
      return res.status(404).json({
        success: false,
        message: 'Item no encontrado en el carrito'
      });
    }

    // Calcular cupos realmente disponibles teniendo en cuenta items en carritos
    const itemsEnCarritos = await CarritoItem.sum('cantidad', {
      where: { fechaViajeId: carritoItem.fechaViaje.id_fechas_viaje }
    }) || 0;

    // Restar la cantidad actual de este item para calcular cupos disponibles
    const itemsEnCarritosSinEste = itemsEnCarritos - carritoItem.cantidad;
    const cuposRealesDisponibles = carritoItem.fechaViaje.cupos_totales -
                                    carritoItem.fechaViaje.cupos_ocupados -
                                    itemsEnCarritosSinEste;

    // Verificar cupos disponibles
    if (cuposRealesDisponibles < cantidad) {
      return res.status(400).json({
        success: false,
        message: `Solo hay ${Math.max(0, cuposRealesDisponibles)} cupos disponibles`
      });
    }

    // Actualizar item
    carritoItem.cantidad = cantidad;
    carritoItem.subtotal = cantidad * carritoItem.precio_unitario;
    await carritoItem.save();

    res.json({
      success: true,
      message: 'Item actualizado',
      data: {
        item: carritoItem
      }
    });

  } catch (error) {
    console.error('Error actualizando item del carrito:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Elimina un item del carrito
 */
export const removeItem = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id_usuarios;

    // Buscar el item del carrito
    const carritoItem = await CarritoItem.findByPk(id, {
      include: [
        {
          model: Carrito,
          as: 'carrito',
          where: {
            id_usuario: userId
          }
        }
      ]
    });

    if (!carritoItem) {
      return res.status(404).json({
        success: false,
        message: 'Item no encontrado en el carrito'
      });
    }

    // Eliminar item
    await carritoItem.destroy();

    res.json({
      success: true,
      message: 'Item eliminado del carrito'
    });

  } catch (error) {
    console.error('Error eliminando item del carrito:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Vacía todo el carrito del usuario
 */
export const clearCarrito = async (req, res) => {
  try {
    const userId = req.user.id_usuarios;

    // Buscar carrito del usuario
    const carrito = await Carrito.findOne({
      where: {
        id_usuario: userId
      }
    });

    if (!carrito) {
      return res.json({
        success: true,
        message: 'Carrito vacío'
      });
    }

    // Eliminar todos los items del carrito
    await CarritoItem.destroy({
      where: { carritoId: carrito.id_carrito }
    });

    res.json({
      success: true,
      message: 'Carrito vaciado exitosamente'
    });

  } catch (error) {
    console.error('Error vaciando carrito:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Procesa el checkout del carrito (placeholder)
 */
export const checkout = async (req, res) => {
  try {
    const userId = req.user.id_usuarios;

    // Buscar carrito del usuario
    const carrito = await Carrito.findOne({
      where: {
        id_usuario: userId
      },
      include: [
        {
          model: CarritoItem,
          as: 'items',
          include: [
            {
              model: FechaViaje,
              as: 'fechaViaje',
              include: [
                {
                  model: Viaje,
                  as: 'viaje'
                }
              ]
            }
          ]
        }
      ]
    });

    if (!carrito || !carrito.items || carrito.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'El carrito está vacío'
      });
    }

    // Calcular totales
    const subtotal = carrito.items.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);
    const totalItems = carrito.items.reduce((sum, item) => sum + item.cantidad, 0);

    // TODO: Aquí se implementaría la lógica de checkout real:
    // - Crear orden/reserva
    // - Procesar pago
    // - Actualizar cupos
    // - Enviar confirmación por email
    // - Vaciar carrito o marcar items como procesados

    // Por ahora, eliminamos todos los items del carrito
    await CarritoItem.destroy({
      where: { carritoId: carrito.id_carrito }
    });

    res.json({
      success: true,
      message: 'Checkout procesado exitosamente',
      data: {
        orderId: `ORDER-${Date.now()}`, // Placeholder
        subtotal: subtotal,
        totalItems: totalItems,
        items: carrito.items
      }
    });

  } catch (error) {
    console.error('Error procesando checkout:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};