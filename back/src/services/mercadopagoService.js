import { MercadoPagoConfig, Preference, Payment, MerchantOrder } from 'mercadopago';
import Pago from '../models/Pago.js';
import Compra from '../models/Compra.js';
import Reserva from '../models/Reserva.js';
import FechaViaje from '../models/FechaViaje.js';
import Viaje from '../models/Viaje.js';
import Usuario from '../models/Usuario.js';
import emailService from './emailService.js';

// Detectar tipo de credenciales (test o producción)
const accessToken = process.env.MP_ACCESS_TOKEN;
const isTestMode = accessToken?.startsWith('TEST-');

console.log('='.repeat(60));
console.log('🔐 CONFIGURACIÓN DE MERCADO PAGO');
console.log('='.repeat(60));
console.log(`Modo: ${isTestMode ? '🧪 PRUEBAS (TEST)' : '🚀 PRODUCCIÓN'}`);
console.log(`Access Token: ${accessToken?.substring(0, 20)}...`);
console.log(`Public Key: ${process.env.MP_PUBLIC_KEY?.substring(0, 20)}...`);
console.log('='.repeat(60));

if (isTestMode) {
  console.log('⚠️  IMPORTANTE: Estás usando credenciales de PRUEBA');
  console.log('📝 Para probar pagos, debes usar:');
  console.log('   - Usuarios de prueba creados en tu cuenta de MercadoPago');
  console.log('   - Tarjetas de prueba de MercadoPago');
  console.log('   🔗 https://www.mercadopago.com.ar/developers/es/docs/checkout-bricks/additional-content/test-cards');
  console.log('='.repeat(60));
}

// Configuración del cliente de Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: accessToken,
  options: {
    timeout: 5000,
    idempotencyKey: 'abc'
  }
});

const preference = new Preference(client);
const payment = new Payment(client);
const merchantOrder = new MerchantOrder(client);

/**
 * Crea una preferencia de pago en Mercado Pago
 * @param {Object} compraData - Datos de la compra
 * @param {number} compraData.id_compra - ID de la compra
 * @param {string} compraData.numero_compra - Número de compra
 * @param {number} compraData.total_compra - Total a pagar
 * @param {Array} compraData.items - Items de la compra
 * @param {Object} compraData.payer - Datos del pagador
 * @returns {Promise<Object>} Preferencia creada con init_point
 */



async function crearPreferencia(compraData) {
  try {
    const { id_compra, numero_compra, total_compra, items, payer } = compraData;

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error('No hay items en la compra');
    }

    // Helper único
    function parsePriceToNumber(value) {
      if (value == null) return 0;
      if (typeof value === 'number') return value;

      const s = String(value).trim();

      // Caso 1: tiene coma (ej "1.234,56" o "1234,56")
      // asumimos coma = decimal, puntos = miles
      if (s.includes(',')) {
        // quitar espacios y puntos de miles, convertir coma a punto decimal
        const cleaned = s.replace(/\s/g, '').replace(/\./g, '').replace(',', '.');
        const n = parseFloat(cleaned);
        return Number.isFinite(n) ? n : 0;
      }

      // Caso 2: NO tiene coma, pero tiene puntos.
      // Puede ser:
      //  - "400000.00" -> punto es decimal (mantenerlo)
      //  - "1.000.000" -> puntos son separadores de miles (eliminar)
      // Distinguimos por la longitud del segmento después del último punto:
      if (s.includes('.')) {
        const parts = s.split('.');
        const last = parts[parts.length - 1];
        // si la última parte tiene exactamente 2 dígitos, muy probablemente es decimal
        if (last.length === 2) {
          const n = parseFloat(s.replace(/\s/g, ''));
          return Number.isFinite(n) ? n : 0;
        } else {
          // puntos son miles -> removerlos
          const cleaned = s.replace(/\s/g, '').replace(/\./g, '');
          const n = parseFloat(cleaned);
          return Number.isFinite(n) ? n : 0;
        }
      }

      // Caso 3: solo dígitos (ej "400000" o con espacios)
      const n = parseFloat(s.replace(/\s/g, ''));
      return Number.isFinite(n) ? n : 0;
    }

    // items recibidos del front -> ids de fechas
    const fechaIds = items.map(i => Number(i.id_fecha_viaje)).filter(Boolean);
    if (fechaIds.length === 0) throw new Error('No se recibieron id_fechas_viaje válidos');

    // Traer precios reales desde la BD e incluir el nombre del viaje
    const fechas = await FechaViaje.findAll({
      where: { id_fechas_viaje: fechaIds },
      attributes: ['id_fechas_viaje', 'id_viaje', 'fecha_inicio', 'precio_fecha']
    });

    // obtener id_viaje únicos
    const viajeIds = [...new Set(fechas.map(f => f.id_viaje).filter(Boolean))];

    // traer viajes (trae todas las columnas; en la BD el nombre está en v.titulo)
    const viajes = await Viaje.findAll({
      where: { id_viaje: viajeIds }
    });

    // mapear viajes por id usando la columna 'titulo'
    const mapaViajes = {};
    viajes.forEach(v => {
      const nombre = v.titulo ?? v.nombre ?? v.name ?? null; // v.titulo es el campo real en tu DB
      mapaViajes[v.id_viaje] = nombre;
    });

    // Mapear por id_fechas_viaje, incluyendo nombre_viaje si existe
    const mapaFechas = {};
    fechas.forEach(f => {
      mapaFechas[f.id_fechas_viaje] = {
        id_viaje: f.id_viaje,
        fecha_inicio: f.fecha_inicio,
        precio_fecha: parsePriceToNumber(f.precio_fecha),
        nombre_viaje: mapaViajes[f.id_viaje] || null
      };
    });

    // Reconstruir items usando precio y nombre desde BD
    const mpItems = items.map(item => {
      const idFecha = Number(item.id_fecha_viaje);
      const entrada = mapaFechas[idFecha];

      if (!entrada) {
        throw new Error(`Fecha de viaje no encontrada en BD: ${idFecha}`);
      }

      const qty = Number(item.cantidad) || 1;
      const unitPrice = entrada.precio_fecha;
      const subtotalCorrecto = unitPrice * qty;

      // Title: primero el nombre real del viaje desde la BD; si no existe, usamos item.titulo; si tampoco, fallback con id+fecha
      const fechaStr = entrada.fecha_inicio ? new Date(entrada.fecha_inicio).toLocaleDateString('es-AR') : '';
      const title = entrada.nombre_viaje
        ? `${entrada.nombre_viaje} - ${fechaStr}`
        : (item.titulo && item.titulo !== 'undefined')
          ? item.titulo
          : `Viaje ${entrada.id_viaje} - ${fechaStr}`;

      return {
        id: String(idFecha),
        title,
        description: item.descripcion ?? `Reserva para ${qty} persona(s)`,
        category_id: 'travel',
        quantity: qty,
        unit_price: unitPrice,
        currency_id: 'ARS',
        _subtotal_calculado: subtotalCorrecto
      };
    });


    // Validación: suma de items vs total_compra
    const computedTotal = mpItems.reduce((s, i) => s + (Number(i.quantity) * Number(i.unit_price || 0)), 0);
    console.log('DEBUG mpItems:', JSON.stringify(mpItems, null, 2));
    console.log('DEBUG computedTotal:', computedTotal, 'expected total_compra:', total_compra);

    if (Math.abs(computedTotal - Number(total_compra || 0)) > 1) {
      console.warn('⚠️ Discrepancia detectada entre total calculado y total_compra', { computedTotal, total_compra });
      // Política aquí: usar computedTotal como fuente de verdad y actualizar total_compra
      // Alternativa: throw new Error(...) para bloquear la preferencia y forzar revisión
      // En este ejemplo, actualizo total_compra a computedTotal para crear la preferencia correcta
    }

    // URLs de retorno — si usás frontend público (ngrok o deploy), descomentá back_urls y auto_return
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
console.log('🌐 FRONTEND_URL:', frontendUrl);

// backUrls siempre los armamos, pero sólo enviamos auto_return si la URL es https pública
const backUrls = {
  success: `${frontendUrl}/pago/success`,
  failure: `${frontendUrl}/pago/failure`,
  pending: `${frontendUrl}/pago/pending`
};

// Validar si podemos usar auto_return: requiere URL pública HTTPS (ngrok https o dominio)
const canAutoReturn = frontendUrl.startsWith('https://') && !frontendUrl.includes('localhost');

if (!canAutoReturn) {
  console.warn('⚠️ auto_return DESACTIVADO: FRONTEND_URL no público/HTTPS. Para redirección automática usa ngrok HTTPS o dominio público.');
}
// Datos del pagador
const payerData = {
      name: payer?.nombre || 'Comprador',
      surname: payer?.apellido || '',
      email: payer?.email || ''
    };

    if (payer?.telefono) {
      payerData.phone = { area_code: '', number: payer.telefono };
    }
    if (payer?.dni) {
      payerData.identification = { type: 'DNI', number: payer.dni };
    }
// Construir preferenceData
const preferenceData = {
  items: mpItems.map(({ _subtotal_calculado, ...keep }) => keep),
  payer: payerData,
  external_reference: numero_compra,
  statement_descriptor: 'TrekkingAR',
  notification_url: `${process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3003}`}/api/pagos/webhook`,
  metadata: { id_compra: id_compra, numero_compra: numero_compra },
  payment_methods: { excluded_payment_types: [], installments: 12 },
  expires: true,
  expiration_date_from: new Date().toISOString(),
  expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
};

// Agregamos back_urls siempre (MP las acepta), pero auto_return solo si canAutoReturn
preferenceData.back_urls = backUrls;
if (canAutoReturn) {
  preferenceData.auto_return = 'approved';
}
    console.log('📦 Preferencia a enviar:', JSON.stringify(preferenceData, null, 2));

    const result = await preference.create({ body: preferenceData });

    console.log('✅ Preferencia de Mercado Pago creada:', { id: result.id, init_point: result.init_point });

    return {
      preference_id: result.id,
      init_point: result.init_point,
      sandbox_init_point: result.sandbox_init_point,
      computed_total: computedTotal // opcional: devuelva total real
    };

  } catch (error) {
    console.error('❌ Error al crear preferencia de Mercado Pago:', error);
    throw new Error(`Error al crear preferencia de pago: ${error.message}`);
  }
}

/**
 * Procesa el webhook de Mercado Pago
 * @param {Object} webhookData - Datos del webhook
 * @returns {Promise<Object>} Resultado del procesamiento
 */
async function procesarWebhook(webhookData) {
  try {
    const { type, data } = webhookData;

    console.log('📥 Procesando webhook tipo:', type, 'ID:', data.id);

    // Procesar según el tipo de webhook
    if (type === 'merchant_order') {
      // MercadoPago envía notificaciones de merchant_order cuando cambia el estado de una orden
      const orderId = data.id;
      console.log('🛒 Procesando merchant_order ID:', orderId);

      // Obtener información de la orden
      const orderInfo = await merchantOrder.get({ merchantOrderId: orderId });

      console.log('📊 Info de la orden:', {
        id: orderInfo.id,
        status: orderInfo.status,
        external_reference: orderInfo.external_reference,
        total_amount: orderInfo.total_amount
      });

      // Si la orden tiene pagos asociados, procesarlos
      if (orderInfo.payments && orderInfo.payments.length > 0) {
        // Tomar el último pago (el más reciente)
        const lastPayment = orderInfo.payments[orderInfo.payments.length - 1];
        console.log('💳 Procesando pago asociado ID:', lastPayment.id);

        // Procesar el pago
        return await procesarPagoInfo(lastPayment.id, orderInfo.external_reference);
      }

      return { success: true, message: 'Merchant order procesada sin pagos asociados' };
    }

    if (type === 'payment') {
      const paymentId = data.id;
      console.log('💳 Procesando pago ID:', paymentId);

      return await procesarPagoInfo(paymentId);
    }

    console.log('ℹ️ Webhook ignorado, tipo:', type);
    return { success: true, message: 'Tipo de webhook no procesado' };

  } catch (error) {
    console.error('❌ Error al procesar webhook:', error);
    throw error;
  }
}

/**
 * Procesa la información de un pago específico
 * @param {string} paymentId - ID del pago
 * @param {string} externalRefOverride - Referencia externa opcional (si viene del merchant_order)
 * @returns {Promise<Object>} Resultado del procesamiento
 */
async function procesarPagoInfo(paymentId, externalRefOverride = null) {
  try {
    // Obtener información del pago desde Mercado Pago
    const paymentInfo = await payment.get({ id: paymentId });

    const {
      id,
      status,
      status_detail,
      external_reference,
      transaction_amount,
      payment_method_id,
      payment_type_id,
      date_approved,
      metadata
    } = paymentInfo;

    // Usar la referencia externa del pago o la que viene del merchant_order
    const numeroCompra = externalRefOverride || external_reference;

    console.log('📊 Info del pago:', {
      id,
      status,
      external_reference: numeroCompra,
      amount: transaction_amount
    });

    // Buscar la compra por número de compra (external_reference)
    const compra = await Compra.findOne({
      where: { numero_compra: numeroCompra }
    });

    if (!compra) {
      console.error('❌ Compra no encontrada:', numeroCompra);
      throw new Error('Compra no encontrada');
    }

    // Mapear estados de Mercado Pago a estados internos
    let estadoPago;
    let estadoCompra;
    let estadoReserva;

    switch (status) {
      case 'approved':
        estadoPago = 'aprobado';
        estadoCompra = 'pagada';
        estadoReserva = 'confirmada';
        break;
      case 'pending':
      case 'in_process':
        estadoPago = 'procesando';
        estadoCompra = 'pendiente';
        estadoReserva = 'pendiente';
        break;
      case 'rejected':
      case 'cancelled':
        estadoPago = 'rechazado';
        estadoCompra = 'cancelada';
        estadoReserva = 'cancelada';
        break;
      case 'refunded':
      case 'charged_back':
        estadoPago = 'reembolsado';
        estadoCompra = 'reembolsada';
        estadoReserva = 'cancelada';
        break;
      default:
        estadoPago = 'pendiente';
        estadoCompra = 'pendiente';
        estadoReserva = 'pendiente';
    }

    // Buscar o crear el registro de pago (evitando violación de FK en id_metodo_pago)
    // NOTA: mantenemos la variable pagoRecord porque se utiliza más abajo
    let pagoRecord = await Pago.findOne({
      where: { id_compra: compra.id_compras }
    });

    const sequelize = Pago.sequelize;
    const codigoMp = (payment_method_id && payment_method_id.toString()) || 'mercadopago';

    // Primero intentar buscar por nombre exacto o por descripción que contenga "mercado"
    const [metodoRows] = await sequelize.query(
      `SELECT id_metodo_pago FROM metodos_pago
       WHERE LOWER(nombre) = LOWER(?) 
          OR LOWER(descripcion) LIKE LOWER(?)
       LIMIT 1;`,
      { replacements: [codigoMp, '%mercado%'] }
    );

    let idMetodoPago;
    if (metodoRows && metodoRows.length > 0) {
      idMetodoPago = metodoRows[0].id_metodo_pago;
      console.log('🔎 Método de pago encontrado en BD id_metodo_pago:', idMetodoPago);
    } else {
      console.log('➕ Método de pago no encontrado, creando registro por defecto (Mercado Pago).');

      const insertSql = `
        INSERT INTO metodos_pago
          (nombre, descripcion, activo, configuracion_json, comision_porcentaje, fecha_creacion)
        VALUES (?, ?, ?, ?, ?, NOW())
      `;

      const replacements = [
        'mercadopago',
        'Mercado Pago - Todos los medios de pago',
        1,
        null,
        0.00
      ];

      const [insertResult] = await sequelize.query(insertSql, { replacements });

      // Intentar obtener insertId (cambia según driver SQL)
      if (insertResult && (insertResult.insertId || insertResult.insert_id || (Array.isArray(insertResult) && insertResult[0]?.insertId))) {
        idMetodoPago = insertResult.insertId || insertResult.insert_id || insertResult[0].insertId;
      } else {
        // Si no devolvió insertId, hacemos SELECT para obtener el id real
        const [rowsAfterInsert] = await sequelize.query(
          `SELECT id_metodo_pago FROM metodos_pago WHERE nombre = ? LIMIT 1;`,
          { replacements: ['mercadopago'] }
        );
        if (rowsAfterInsert && rowsAfterInsert.length > 0) {
          idMetodoPago = rowsAfterInsert[0].id_metodo_pago;
        }
      }

      if (!idMetodoPago) {
        console.warn('⚠️ No se pudo obtener id del método de pago insertado. Usando id por defecto 8.');
        idMetodoPago = 8;
      }

      console.log('✅ Método de pago creado/obtenido con id_metodo_pago:', idMetodoPago);
    }

    if (pagoRecord) {
      // Actualizar pago existente
      await pagoRecord.update({
        estado_pago: estadoPago,
        referencia_externa: id.toString(),
        fecha_pago: date_approved || new Date(),
        monto: transaction_amount
      });
    } else {
      // Crear nuevo registro de pago usando idMetodoPago resuelto
      pagoRecord = await Pago.create({
        id_compra: compra.id_compras,
        id_metodo_pago: idMetodoPago,
        monto: transaction_amount,
        estado_pago: estadoPago,
        referencia_externa: id.toString(),
        fecha_pago: date_approved || new Date()
      });
    }

    // Actualizar estado de la compra
    await compra.update({ estado_compra: estadoCompra });

    // Actualizar estado de las reservas asociadas
    await Reserva.update(
      { estado_reserva: estadoReserva },
      { where: { id_compra: compra.id_compras } }
    );

    console.log('✅ Pago procesado exitosamente:', {
      pago_id: pagoRecord.id_pago,
      estado: estadoPago,
      compra_id: compra.id_compras,
      numero_compra: numeroCompra
    });

    // Enviar email de confirmación si el pago fue aprobado
    if (status === 'approved') {
      try {
        console.log('📧 Enviando email de confirmación de pago...');

        // Obtener datos del usuario
        const usuario = await Usuario.findByPk(compra.id_usuario);

        if (!usuario) {
          console.warn('⚠️ Usuario no encontrado para enviar email de confirmación');
        } else {
          // Obtener reservas con información de viajes
          const reservas = await Reserva.findAll({
            where: { id_compra: compra.id_compras },
            include: [
              {
                model: FechaViaje,
                as: 'fecha_viaje',
                include: [
                  {
                    model: Viaje,
                    as: 'viaje'
                  }
                ]
              }
            ]
          });

          // Formatear datos de reservas para el email
          const reservasFormateadas = reservas.map(reserva => ({
            viaje_nombre: reserva.fecha_viaje?.viaje?.titulo || 'Viaje de aventura',
            fecha_viaje: reserva.fecha_viaje?.fecha_inicio,
            cantidad_personas: reserva.cantidad_personas,
            estado: reserva.estado_reserva
          }));

          // Enviar email de confirmación
          await emailService.sendPaymentConfirmationEmail({
            usuario: {
              nombre: usuario.nombre,
              apellido: usuario.apellido,
              email: usuario.email
            },
            compra: {
              numero_compra: compra.numero_compra,
              total_compra: compra.total_compra,
              fecha_compra: compra.fecha_compra
            },
            pago: {
              monto: pagoRecord.monto,
              fecha_pago: pagoRecord.fecha_pago,
              referencia_externa: pagoRecord.referencia_externa
            },
            reservas: reservasFormateadas
          });

          console.log('✅ Email de confirmación de pago enviado exitosamente');
        }
      } catch (emailError) {
        console.error('❌ Error al enviar email de confirmación (no crítico):', emailError);
        // No lanzamos el error porque el pago ya fue procesado correctamente
        // El email es una notificación adicional, no debe bloquear el flujo
      }
    }

    return {
      success: true,
      pago_id: pagoRecord.id_pago,
      estado: estadoPago,
      compra_id: compra.id_compras
    };

  } catch (error) {
    console.error('❌ Error al procesar pago:', error);
    throw error;
  }
}

/**
 * Obtiene información de un pago
 * @param {string} paymentId - ID del pago en Mercado Pago
 * @returns {Promise<Object>} Información del pago
 */
async function obtenerPago(paymentId) {
  try {
    const paymentInfo = await payment.get({ id: paymentId });
    return paymentInfo;
  } catch (error) {
    console.error('❌ Error al obtener pago:', error);
    throw new Error(`Error al obtener información del pago: ${error.message}`);
  }
}

/**
 * Verifica si las credenciales de MP están configuradas
 * @returns {boolean}
 */
function verificarCredenciales() {
  const accessToken = process.env.MP_ACCESS_TOKEN;
  const publicKey = process.env.MP_PUBLIC_KEY;

  if (!accessToken || accessToken === 'TEST-YOUR-ACCESS-TOKEN-HERE') {
    console.warn('⚠️ Access Token de Mercado Pago no configurado');
    return false;
  }

  if (!publicKey || publicKey === 'TEST-YOUR-PUBLIC-KEY-HERE') {
    console.warn('⚠️ Public Key de Mercado Pago no configurado');
    return false;
  }

  return true;
}

export {
  crearPreferencia,
  procesarWebhook,
  obtenerPago,
  verificarCredenciales
};
