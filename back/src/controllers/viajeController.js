/**
 * Viaje Controller
 * 
 * Controlador para manejo de viajes y sus imágenes.
 * Incluye endpoints para CRUD de viajes y upload de imágenes.
 */

import { validationResult } from "express-validator";
import { Op } from "sequelize";
import sequelize from "../config/database.js";
import { Viaje, FechaViaje, Categoria, Destino, ImagenViaje } from "../models/associations.js";
import { upload, handleMulterError, getFileUrl } from "../config/multer.js";
import { processViajeImages } from "../utils/imageUrlHelper.js";

/**
 * Obtiene estadísticas de precios de viajes activos
 */
export const getPreciosStats = async (req, res) => {
  try {
    const stats = await Viaje.findOne({
      where: { activo: true },
      attributes: [
        [sequelize.fn('MAX', sequelize.col('precio_base')), 'precio_maximo'],
        [sequelize.fn('MIN', sequelize.col('precio_base')), 'precio_minimo']
      ],
      raw: true
    });

    res.json({
      success: true,
      data: {
        precio_maximo: parseFloat(stats.precio_maximo) || 1000000,
        precio_minimo: parseFloat(stats.precio_minimo) || 0
      }
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas de precios:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Obtiene todos los viajes con filtros y paginación
 */
export const getViajes = async (req, res) => {
  try {
    const {
      categoria,
      dificultad,
      search,
      page = 1,
      limit = 12,
      activo,
      destacado,
      precio_min,
      precio_max,
      duracion_min,
      duracion_max,
      mes,
      sortBy = 'fecha_creacion',
      admin = false // Parámetro para indicar si es consulta de admin
    } = req.query;

    const offset = (page - 1) * limit;
    const isAdminQuery = admin === 'true' || admin === true;

    // Construir filtros
    const where = {};
    // Para consultas de admin: solo filtrar por activo si se especifica
    // Para consultas públicas: filtrar por activo=true si no se especifica
    if (activo !== undefined) {
      where.activo = activo === 'true';
    } else if (!isAdminQuery) {
      // Si no es admin y no se especifica activo, mostrar solo activos por defecto
      where.activo = true;
    }

    if (destacado !== undefined) {
      where.destacado = destacado === 'true';
    }

    if (dificultad) {
      where.dificultad = dificultad;
    }

    if (search) {
      where[Op.or] = [
        { titulo: { [Op.like]: `%${search}%` } },
        { descripcion_corta: { [Op.like]: `%${search}%` } }
      ];
    }

    // Filtro de precio
    if (precio_min !== undefined || precio_max !== undefined) {
      where.precio_base = {};
      if (precio_min !== undefined) {
        where.precio_base[Op.gte] = parseFloat(precio_min);
      }
      if (precio_max !== undefined) {
        where.precio_base[Op.lte] = parseFloat(precio_max);
      }
    }

    // Filtro de duración
    if (duracion_min !== undefined || duracion_max !== undefined) {
      where.duracion_dias = {};
      if (duracion_min !== undefined) {
        where.duracion_dias[Op.gte] = parseInt(duracion_min);
      }
      if (duracion_max !== undefined) {
        where.duracion_dias[Op.lte] = parseInt(duracion_max);
      }
    }

    // Construir include para categoría, destino, fechas e imágenes
    // Usando separate:true para fechas e imágenes para evitar problemas con LIMIT y paginación
    const include = [
      {
        model: Categoria,
        as: 'categoria',
        required: false
      },
      {
        model: Destino,
        as: 'destino',
        required: false
      },
      {
        model: FechaViaje,
        as: 'fechas',
        where: {
          estado_fecha: 'disponible',
          fecha_inicio: { [Op.gt]: new Date() } // Solo fechas futuras
        },
        required: false,
        separate: true, // Hacer consulta separada para evitar problemas con LIMIT
        order: [['fecha_inicio', 'ASC']]
      },
      {
        model: ImagenViaje,
        as: 'imagenes',
        required: false,
        separate: true, // Hacer consulta separada para evitar problemas con LIMIT
        order: [['orden', 'ASC']]
      }
    ];

    // Filtro de mes - filtrar viajes que tienen fechas en el mes seleccionado
    if (mes) {
      const mesNum = parseInt(mes);
      include[2].where = {
        ...include[2].where,
        [Op.and]: [
          sequelize.where(sequelize.fn('MONTH', sequelize.col('fecha_inicio')), mesNum)
        ]
      };
    }

    // Filtrar por categoría si se especifica
    if (categoria) {
      include[0].where = { id_categoria: categoria };
    }

    // Determinar orden de resultados
    // Nota: NO incluimos ordenamiento de fechas aquí porque separate:true hace consultas separadas
    let orderClause;
    switch (sortBy) {
      case 'precio_asc':
        orderClause = [['precio_base', 'ASC']];
        break;
      case 'precio_desc':
        orderClause = [['precio_base', 'DESC']];
        break;
      case 'duracion_asc':
        orderClause = [['duracion_dias', 'ASC']];
        break;
      case 'duracion_desc':
        orderClause = [['duracion_dias', 'DESC']];
        break;
      case 'popularidad':
        orderClause = [['destacado', 'DESC'], ['fecha_creacion', 'DESC']];
        break;
      case 'fecha_creacion':
      default:
        orderClause = [['fecha_creacion', 'DESC']];
        break;
    }

    // Obtener viajes con paginación
    const { count, rows: viajes } = await Viaje.findAndCountAll({
      where,
      include,
      order: orderClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      distinct: true,
      subQuery: false
    });

    // Procesar URLs de imágenes, calcular precio más bajo y cupos disponibles
    let viajesConImagenes = await Promise.all(viajes.map(async (viaje) => {
      const viajeData = viaje.toJSON();
      const viajeConImagenes = processViajeImages(viajeData, req);

      // Calcular precio más bajo de las fechas disponibles
      if (viajeConImagenes.fechas && viajeConImagenes.fechas.length > 0) {
        const precios = viajeConImagenes.fechas
          .map(fecha => parseFloat(fecha.precio))
          .filter(precio => !isNaN(precio) && precio > 0);

        viajeConImagenes.precio_mas_bajo = precios.length > 0
          ? Math.min(...precios)
          : viajeConImagenes.precio_base;

        // Calcular cupos disponibles reales para cada fecha (versión optimizada para listado)
        const { Reserva } = await import('../models/associations.js');

        for (let fecha of viajeConImagenes.fechas) {
          const reservasConfirmadas = await Reserva.findAll({
            where: {
              id_fecha_viaje: fecha.id_fechas_viaje,
              estado_reserva: 'confirmada'
            },
            attributes: [
              [sequelize.fn('SUM', sequelize.col('cantidad_personas')), 'total_ocupados']
            ],
            raw: true
          });

          const totalOcupados = parseInt(reservasConfirmadas[0]?.total_ocupados) || 0;
          const cuposDisponiblesReales = Math.max(0, fecha.cupos_disponibles - totalOcupados);

          console.log(`[Viaje] Cupos para fecha ${fecha.id_fechas_viaje}:`, {
            maximoParticipantes: fecha.cupos_disponibles + totalOcupados,
            cuposOcupados: totalOcupados,
            cuposDisponibles: cuposDisponiblesReales,
            fechaInicio: fecha.fecha_inicio
          });

          fecha.cupos_disponibles = cuposDisponiblesReales;
          fecha.cupos_ocupados = totalOcupados;
        }
      } else {
        viajeConImagenes.precio_mas_bajo = viajeConImagenes.precio_base;
      }

      return viajeConImagenes;
    }));

    // Si activo=true (consulta pública) Y NO es admin, filtrar viajes sin fechas futuras disponibles
    // Esto previene mostrar viajes sin fechas disponibles en el frontend público
    // El panel admin necesita ver todos los viajes para poder editarlos y agregar fechas
    let totalCount = count;
    const isActiveQuery = activo === 'true' || activo === true;

    if (isActiveQuery && !isAdminQuery) {
      viajesConImagenes = viajesConImagenes.filter(viaje =>
        viaje.fechas && viaje.fechas.length > 0
      );
      // Ajustar el count para reflejar el filtrado
      totalCount = viajesConImagenes.length;
    }

    res.json({
      success: true,
      data: {
        viajes: viajesConImagenes,
        pagination: {
          total: totalCount,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(totalCount / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error obteniendo viajes:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Obtiene un viaje por ID con todas sus relaciones
 * Calcula dinámicamente los cupos disponibles basándose en reservas confirmadas
 */
export const getViajeById = async (req, res) => {
  try {
    const { id } = req.params;

    const viaje = await Viaje.findByPk(id, {
      include: [
        {
          model: Categoria,
          as: 'categoria'
        },
        {
          model: Destino,
          as: 'destino'
        },
        {
          model: FechaViaje,
          as: 'fechas',
          order: [['fecha_inicio', 'ASC']]
        },
        {
          model: ImagenViaje,
          as: 'imagenes',
          order: [['orden', 'ASC']]
        }
      ]
    });

    if (!viaje) {
      return res.status(404).json({
        success: false,
        message: 'Viaje no encontrado'
      });
    }

    // Procesar URLs de imágenes
    const viajeData = viaje.toJSON();
    const viajeConImagenes = processViajeImages(viajeData, req);

    // Calcular cupos disponibles reales para cada fecha
    if (viajeConImagenes.fechas && viajeConImagenes.fechas.length > 0) {
      // Importar modelo de Reserva dinámicamente para evitar dependencias circulares
      const { Reserva } = await import('../models/associations.js');

      for (let fecha of viajeConImagenes.fechas) {
        // Sumar cantidad de personas de todas las reservas confirmadas para esta fecha
        const reservasConfirmadas = await Reserva.findAll({
          where: {
            id_fecha_viaje: fecha.id_fechas_viaje,
            estado_reserva: 'confirmada'
          },
          attributes: [
            [sequelize.fn('SUM', sequelize.col('cantidad_personas')), 'total_ocupados']
          ],
          raw: true
        });

        const totalOcupados = parseInt(reservasConfirmadas[0]?.total_ocupados) || 0;

        // Calcular cupos disponibles reales
        // cupos_disponibles en el modelo representa el TOTAL de cupos
        const cuposDisponiblesReales = Math.max(0, fecha.cupos_disponibles - totalOcupados);

        // Actualizar el valor en el objeto
        fecha.cupos_disponibles = cuposDisponiblesReales;
        fecha.cupos_totales = fecha.cupos_disponibles + totalOcupados; // Agregar info de cupos totales
        fecha.cupos_ocupados = totalOcupados;

        console.log(`[getViajeById] Fecha ${fecha.id_fechas_viaje}: Total=${fecha.cupos_totales}, Ocupados=${totalOcupados}, Disponibles=${cuposDisponiblesReales}`);
      }
    }

    res.json({
      success: true,
      data: {
        viaje: viajeConImagenes
      }
    });

  } catch (error) {
    console.error('Error obteniendo viaje:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Sube imágenes para un viaje específico
 */
export const uploadImagenes = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el viaje existe
    const viaje = await Viaje.findByPk(id);
    if (!viaje) {
      return res.status(404).json({
        success: false,
        message: 'Viaje no encontrado'
      });
    }

    // Verificar que hay archivos
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No se subieron archivos'
      });
    }

    // Procesar archivos subidos
    const imagenesSubidas = [];
    
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      
      // Generar URL completa del archivo
      const urlCompleta = getFileUrl(req, file.filename, id);

      // Crear registro en la base de datos con URL completa
      const imagenViaje = await ImagenViaje.create({
        id_viaje: parseInt(id),
        url: urlCompleta,
        orden: i + 1,
        descripcion: `Imagen ${i + 1} de ${viaje.titulo}`
      });

      imagenesSubidas.push({
        id: imagenViaje.id_imagen_viaje,
        url: imagenViaje.url,
        orden: imagenViaje.orden,
        descripcion: imagenViaje.descripcion
      });
    }

    res.status(201).json({
      success: true,
      message: `${req.files.length} imagen(es) subida(s) exitosamente`,
      data: {
        imagenes: imagenesSubidas
      }
    });

  } catch (error) {
    console.error('Error subiendo imágenes:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Elimina una imagen de un viaje
 */
export const deleteImagen = async (req, res) => {
  try {
    const { id, imagenId } = req.params;

    console.log(`[deleteImagen] Intentando borrar imagen ${imagenId} del viaje ${id}`);

    // Verificar que el viaje existe
    const viaje = await Viaje.findByPk(id);
    if (!viaje) {
      return res.status(404).json({
        success: false,
        message: 'Viaje no encontrado'
      });
    }

    // Buscar la imagen - FIX: usar id_imagen_viaje en lugar de id
    const imagen = await ImagenViaje.findOne({
      where: {
        id_imagen_viaje: imagenId,
        id_viaje: id
      }
    });

    if (!imagen) {
      console.error(`[deleteImagen] Imagen ${imagenId} no encontrada para viaje ${id}`);
      return res.status(404).json({
        success: false,
        message: 'Imagen no encontrada'
      });
    }

    // Si esta imagen es la principal del viaje, limpiar referencia
    if (viaje.imagen_principal_url === imagen.url) {
      console.log(`[deleteImagen] Limpiando imagen_principal_url del viaje ${id}`);
      await viaje.update({ imagen_principal_url: null });
    }

    // Eliminar archivo físico
    try {
      const fs = await import('fs');
      const path = await import('path');

      // Extraer el nombre del archivo de la URL
      // Si es URL completa: http://localhost:3003/uploads/viajes/file.jpg
      // Si es path relativo: /uploads/viajes/file.jpg
      let fileName = imagen.url;
      if (fileName.includes('/uploads/')) {
        fileName = fileName.split('/uploads/')[1];
      }

      const filePath = path.join(process.cwd(), 'uploads', fileName);
      console.log(`[deleteImagen] Intentando borrar archivo: ${filePath}`);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`[deleteImagen] Archivo físico eliminado: ${filePath}`);
      } else {
        console.warn(`[deleteImagen] Archivo no encontrado en disco: ${filePath}`);
      }
    } catch (fsError) {
      console.error('[deleteImagen] Error al eliminar archivo físico:', fsError);
      // Continuar aunque falle la eliminación del archivo físico
    }

    // Eliminar registro de la base de datos
    await imagen.destroy();
    console.log(`[deleteImagen] Registro de imagen ${imagenId} eliminado de la BD`);

    res.json({
      success: true,
      message: 'Imagen eliminada exitosamente'
    });

  } catch (error) {
    console.error('[deleteImagen] Error eliminando imagen:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

/**
 * Actualiza el orden de las imágenes
 */
export const updateImagenOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { imagenes } = req.body;

    if (!Array.isArray(imagenes)) {
      return res.status(400).json({
        success: false,
        message: 'Las imágenes deben ser un array'
      });
    }

    // Verificar que el viaje existe
    const viaje = await Viaje.findByPk(id);
    if (!viaje) {
      return res.status(404).json({
        success: false,
        message: 'Viaje no encontrado'
      });
    }

    // Actualizar orden de cada imagen
    for (const img of imagenes) {
      await ImagenViaje.update(
        { orden: img.orden },
        {
          where: {
            id: img.id,
            id_viaje: id
          }
        }
      );
    }

    res.json({
      success: true,
      message: 'Orden de imágenes actualizado'
    });

  } catch (error) {
    console.error('Error actualizando orden de imágenes:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Actualiza el punto focal de una imagen
 */
export const updateImageFocusPoint = async (req, res) => {
  try {
    const { id, imagenId } = req.params;
    const { focus_point } = req.body;

    // Validar que se proporcionó el focus_point
    if (!focus_point) {
      return res.status(400).json({
        success: false,
        message: 'El punto focal es requerido'
      });
    }

    // Validar que el focus_point tenga un valor válido
    const validFocusPoints = ['center', 'top', 'bottom', 'left', 'right',
                              'top left', 'top right', 'bottom left', 'bottom right'];
    if (!validFocusPoints.includes(focus_point)) {
      return res.status(400).json({
        success: false,
        message: 'Punto focal inválido'
      });
    }

    // Verificar que el viaje existe
    const viaje = await Viaje.findByPk(id);
    if (!viaje) {
      return res.status(404).json({
        success: false,
        message: 'Viaje no encontrado'
      });
    }

    // Buscar la imagen
    const imagen = await ImagenViaje.findOne({
      where: {
        id_imagen_viaje: imagenId,
        id_viaje: id
      }
    });

    if (!imagen) {
      return res.status(404).json({
        success: false,
        message: 'Imagen no encontrada'
      });
    }

    // Actualizar el punto focal
    await imagen.update({ focus_point });

    res.json({
      success: true,
      message: 'Punto focal actualizado',
      data: {
        imagen: {
          id_imagen_viaje: imagen.id_imagen_viaje,
          url: imagen.url,
          focus_point: imagen.focus_point
        }
      }
    });

  } catch (error) {
    console.error('Error actualizando punto focal:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Crea un nuevo viaje
 * ✅ Conectado con frontend
 */
export const createViaje = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array()
      });
    }

    const {
      titulo,
      descripcion,
      descripcion_corta,
      descripcion_completa,
      destino,
      id_destino,
      duracion_dias,
      dificultad,
      precio_base,
      minimo_participantes,
      maximo_participantes,
      id_categoria,
      incluye,
      no_incluye,
      recomendaciones,
      itinerario,
      activo,
      destacado
    } = req.body;

    // Manejar destino: si se proporciona nombre de destino (nuevo o existente)
    let destinoId = id_destino ? parseInt(id_destino) : null;

    if (destino && !destinoId) {
      // Buscar o crear el destino por nombre
      const [destinoObj, created] = await Destino.findOrCreate({
        where: { nombre: destino.trim() },
        defaults: {
          nombre: destino.trim(),
          provincia: null,
          region: null,
          descripcion: null
        }
      });
      destinoId = destinoObj.id_destino;
      console.log(`[createViaje] Destino ${created ? 'creado' : 'encontrado'}: ${destinoObj.nombre} (ID: ${destinoId})`);
    }

    // El frontend envía strings, no arrays. No hacer JSON.stringify si ya es string
    const nuevoViaje = await Viaje.create({
      titulo,
      descripcion: descripcion_completa || descripcion, // Frontend envía descripcion_completa
      descripcion_corta,
      id_destino: destinoId,
      duracion_dias: parseInt(duracion_dias),
      dificultad,
      precio_base: parseFloat(precio_base),
      minimo_participantes: minimo_participantes ? parseInt(minimo_participantes) : 1,
      maximo_participantes: maximo_participantes ? parseInt(maximo_participantes) : null,
      id_categoria: id_categoria ? parseInt(id_categoria) : null,
      incluye: incluye || null, // Guardar como string directo
      no_incluye: no_incluye || null, // Guardar como string directo
      recomendaciones: recomendaciones || null, // Campo nuevo
      itinerario: itinerario || null,
      activo: activo !== undefined ? activo : true,
      destacado: destacado !== undefined ? destacado : false
    });

    res.status(201).json({
      success: true,
      message: 'Viaje creado exitosamente',
      data: { viaje: nuevoViaje }
    });

  } catch (error) {
    console.error('Error creando viaje:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

/**
 * Actualiza un viaje existente
 * ✅ Conectado con frontend
 */
export const updateViaje = async (req, res) => {
  try {
    const { id } = req.params;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array()
      });
    }

    const viaje = await Viaje.findByPk(id);
    if (!viaje) {
      return res.status(404).json({
        success: false,
        message: 'Viaje no encontrado'
      });
    }

    const {
      titulo,
      descripcion,
      descripcion_corta,
      descripcion_completa,
      destino,
      id_destino,
      duracion_dias,
      dificultad,
      precio_base,
      minimo_participantes,
      maximo_participantes,
      id_categoria,
      incluye,
      no_incluye,
      recomendaciones,
      itinerario,
      activo,
      destacado
    } = req.body;

    console.log('[updateViaje] Datos recibidos:', {
      incluye: incluye ? `${incluye.substring(0, 50)}...` : 'null',
      no_incluye: no_incluye ? `${no_incluye.substring(0, 50)}...` : 'null',
      recomendaciones: recomendaciones ? `${recomendaciones.substring(0, 50)}...` : 'null'
    });

    // Manejar destino: si se proporciona nombre de destino (nuevo o existente)
    let destinoId = id_destino ? parseInt(id_destino) : null;

    if (destino && !destinoId) {
      // Buscar o crear el destino por nombre
      const [destinoObj, created] = await Destino.findOrCreate({
        where: { nombre: destino.trim() },
        defaults: {
          nombre: destino.trim(),
          provincia: null,
          region: null,
          descripcion: null
        }
      });
      destinoId = destinoObj.id_destino;
      console.log(`[updateViaje] Destino ${created ? 'creado' : 'encontrado'}: ${destinoObj.nombre} (ID: ${destinoId})`);
    }

    // Preparar objeto de actualización solo con campos que vengan definidos
    const updateData = {};

    if (titulo !== undefined) updateData.titulo = titulo;
    if (descripcion_completa !== undefined) updateData.descripcion = descripcion_completa; // Frontend envía descripcion_completa
    else if (descripcion !== undefined) updateData.descripcion = descripcion;
    if (descripcion_corta !== undefined) updateData.descripcion_corta = descripcion_corta;
    if (destinoId !== null) updateData.id_destino = destinoId;
    if (duracion_dias !== undefined) updateData.duracion_dias = parseInt(duracion_dias);
    if (dificultad !== undefined) updateData.dificultad = dificultad;
    if (precio_base !== undefined) updateData.precio_base = parseFloat(precio_base);
    if (minimo_participantes !== undefined) updateData.minimo_participantes = parseInt(minimo_participantes);
    if (maximo_participantes !== undefined) updateData.maximo_participantes = parseInt(maximo_participantes);
    if (id_categoria !== undefined) updateData.id_categoria = id_categoria ? parseInt(id_categoria) : null;
    if (activo !== undefined) updateData.activo = activo;
    if (destacado !== undefined) updateData.destacado = destacado;

    // Campos de texto: guardar como string directo (no JSON.stringify)
    if (incluye !== undefined) updateData.incluye = incluye;
    if (no_incluye !== undefined) updateData.no_incluye = no_incluye;
    if (recomendaciones !== undefined) updateData.recomendaciones = recomendaciones;
    if (itinerario !== undefined) updateData.itinerario = itinerario;

    await viaje.update(updateData);

    console.log('[updateViaje] Viaje actualizado exitosamente con ID:', id);

    res.json({
      success: true,
      message: 'Viaje actualizado exitosamente',
      data: { viaje }
    });

  } catch (error) {
    console.error('Error actualizando viaje:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

/**
 * Elimina un viaje (soft delete)
 * ✅ Conectado con frontend
 */
export const deleteViaje = async (req, res) => {
  try {
    const { id } = req.params;

    const viaje = await Viaje.findByPk(id);
    if (!viaje) {
      return res.status(404).json({
        success: false,
        message: 'Viaje no encontrado'
      });
    }

    // Soft delete: marcar como inactivo
    await viaje.update({ activo: false });

    res.json({
      success: true,
      message: 'Viaje eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando viaje:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Obtiene todos los destinos disponibles
 * Para usar en dropdowns/autocomplete del admin panel
 */
export const getDestinos = async (req, res) => {
  try {
    const destinos = await Destino.findAll({
      attributes: ['id_destino', 'nombre', 'provincia', 'region', 'descripcion'],
      order: [['nombre', 'ASC']]
    });

    res.json({
      success: true,
      data: { destinos }
    });

  } catch (error) {
    console.error('Error obteniendo destinos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Obtiene viajes similares basándose en dificultad y duración
 * @param {Number} req.params.id - ID del viaje actual
 * @param {Number} req.query.limit - Límite de resultados (default: 6)
 */
export const getSimilarViajes = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 6 } = req.query;

    // Obtener el viaje actual para comparar
    const viajeActual = await Viaje.findByPk(id);

    if (!viajeActual) {
      return res.status(404).json({
        success: false,
        message: 'Viaje no encontrado'
      });
    }

    // Construir query de búsqueda de viajes similares
    // Prioridad 1: Misma dificultad + duración similar (±1 día)
    // Prioridad 2: Mismo destino
    // Excluir el viaje actual
    const where = {
      id_viaje: { [Op.ne]: parseInt(id) }, // Excluir viaje actual
      activo: true, // Solo viajes activos
      [Op.or]: [
        {
          // Misma dificultad Y duración similar
          dificultad: viajeActual.dificultad,
          duracion_dias: {
            [Op.between]: [
              Math.max(1, viajeActual.duracion_dias - 1),
              viajeActual.duracion_dias + 1
            ]
          }
        },
        {
          // Mismo destino
          id_destino: viajeActual.id_destino
        }
      ]
    };

    // Buscar viajes similares
    const viajes = await Viaje.findAll({
      where,
      include: [
        {
          model: Categoria,
          as: 'categoria',
          required: false
        },
        {
          model: Destino,
          as: 'destino',
          required: false
        },
        {
          model: FechaViaje,
          as: 'fechas',
          where: { estado_fecha: 'disponible' },
          required: false,
          separate: true,
          order: [['fecha_inicio', 'ASC']]
        },
        {
          model: ImagenViaje,
          as: 'imagenes',
          required: false,
          separate: true,
          order: [['orden', 'ASC']]
        }
      ],
      // Ordenar: priorizar viajes con misma dificultad y duración similar
      order: [
        [sequelize.literal(`CASE
          WHEN dificultad = '${viajeActual.dificultad}'
          AND ABS(duracion_dias - ${viajeActual.duracion_dias}) <= 1
          THEN 0
          ELSE 1
        END`), 'ASC'],
        ['destacado', 'DESC'],
        ['fecha_creacion', 'DESC']
      ],
      limit: parseInt(limit)
    });

    // Procesar URLs de imágenes y calcular precio más bajo
    const viajesConImagenes = await Promise.all(viajes.map(async (viaje) => {
      const viajeData = viaje.toJSON();
      const viajeConImagenes = processViajeImages(viajeData, req);

      // Calcular precio más bajo de las fechas disponibles
      if (viajeConImagenes.fechas && viajeConImagenes.fechas.length > 0) {
        const precios = viajeConImagenes.fechas
          .map(fecha => parseFloat(fecha.precio))
          .filter(precio => !isNaN(precio) && precio > 0);

        viajeConImagenes.precio_mas_bajo = precios.length > 0
          ? Math.min(...precios)
          : viajeConImagenes.precio_base;
      } else {
        viajeConImagenes.precio_mas_bajo = viajeConImagenes.precio_base;
      }

      return viajeConImagenes;
    }));

    res.json({
      success: true,
      data: {
        viajes: viajesConImagenes,
        total: viajesConImagenes.length
      }
    });

  } catch (error) {
    console.error('Error obteniendo viajes similares:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};