import Usuario from "./Usuario.js"
import Viaje from "./Viaje.js"
import Categoria from "./Categoria.js"
import Destino from "./Destino.js"
import Reserva from "./Reserva.js"
import Compra from "./Compra.js"
import FechaViaje from "./FechaViaje.js"
import Guia from "./Guia.js"
import Contenido from "./Contenido.js"
import Sugerencia from "./Sugerencia.js"
import Campania from "./Campania.js"
// import Notificacion from "./Notificacion.js" // TODO: Implementar modelo Notificacion para campañas
import AdminNotificacion from "./AdminNotificacion.js"
import MensajeContacto from "./MensajeContacto.js"
import GuiaViaje from "./GuiaViaje.js"
import Suscriptor from "./Suscriptor.js"
import CampaniaSuscriptor from "./CampaniaSuscriptor.js"
import Pago from "./Pago.js"
import MetodoPago from "./MetodoPago.js"
import Carrito from "./Carrito.js"
import CarritoItem from "./CarritoItem.js"
import Servicio from "./Servicio.js"
import ViajeServicio from "./ViajeServicio.js"
import Equipamiento from "./Equipamiento.js"
import ViajeEquipamiento from "./ViajeEquipamiento.js"
import ImagenViaje from "./ImagenViaje.js"
import Administrador from "./Administrador.js"
import Configuracion from "./Configuracion.js"
import Review from "./Review.js"
import AuditLog from "./AuditLog.js"
import UsuarioRol from "./UsuarioRol.js"

// ===== RELACIONES USUARIO =====
Usuario.hasMany(Reserva, { foreignKey: "id_usuario", as: "reservas" })
Usuario.hasMany(Compra, { foreignKey: "id_usuario", as: "compras" })
Usuario.hasMany(Sugerencia, { foreignKey: "id_usuario", as: "sugerencias" })
// Usuario.hasMany(Notificacion, { foreignKey: "id_usuario", as: "notificaciones" }) // TODO: Implementar Notificacion
Usuario.hasOne(Guia, { foreignKey: "id_usuario", as: "perfilGuia" })

// ===== RELACIONES USUARIO-ROL (MÚLTIPLES ROLES) =====
Usuario.hasMany(UsuarioRol, { foreignKey: "id_usuario", as: "roles" })
UsuarioRol.belongsTo(Usuario, { foreignKey: "id_usuario", as: "usuario" })
UsuarioRol.belongsTo(Usuario, { foreignKey: "asignado_por", as: "asignadoPor" })

// ===== RELACIONES CATEGORÍA =====
Categoria.hasMany(Viaje, { foreignKey: "id_categoria", as: "viajes" })

// ===== RELACIONES DESTINO =====
Destino.hasMany(Viaje, { foreignKey: "id_destino", as: "viajes" })

// ===== RELACIONES VIAJE =====
Viaje.belongsTo(Categoria, { foreignKey: "id_categoria", as: "categoria" })
Viaje.belongsTo(Destino, { foreignKey: "id_destino", as: "destino" })
Viaje.hasMany(FechaViaje, { foreignKey: "id_viaje", as: "fechas" })
Viaje.hasMany(Contenido, { foreignKey: "id_viaje", as: "contenidos" })

// ===== RELACIONES FECHA VIAJE =====
FechaViaje.belongsTo(Viaje, { foreignKey: "id_viaje", as: "viaje" })
FechaViaje.hasMany(Reserva, { foreignKey: "id_fecha_viaje", as: "reservas" })
FechaViaje.hasMany(GuiaViaje, { foreignKey: "id_fecha_viaje", as: "guiasAsignados" })

// ===== RELACIONES GUÍA =====
Guia.belongsTo(Usuario, { foreignKey: "id_usuario", as: "usuario" })
Guia.hasMany(GuiaViaje, { foreignKey: "id_guia", as: "asignaciones" })

// ===== RELACIONES GUÍA-VIAJE (Tabla intermedia) =====
GuiaViaje.belongsTo(Guia, { foreignKey: "id_guia", as: "guia" })
GuiaViaje.belongsTo(FechaViaje, { foreignKey: "id_fecha_viaje", as: "fechaViaje" })

// ===== RELACIONES COMPRA =====
Compra.belongsTo(Usuario, { foreignKey: "id_usuario", as: "usuario" })
Compra.hasMany(Reserva, { foreignKey: "id_compra", as: "reservas" })

// ===== RELACIONES RESERVA =====
Reserva.belongsTo(Usuario, { foreignKey: "id_usuario", as: "usuario" })
Reserva.belongsTo(Compra, { foreignKey: "id_compra", as: "compra" })
Reserva.belongsTo(FechaViaje, { foreignKey: "id_fecha_viaje", as: "fecha_viaje" })

// ===== RELACIONES CONTENIDO =====
Contenido.belongsTo(Viaje, { foreignKey: "id_viaje", as: "viaje" })

// ===== RELACIONES SUGERENCIA =====
Sugerencia.belongsTo(Usuario, { foreignKey: "id_usuario", as: "usuario" })

// ===== RELACIONES CAMPAÑA =====
// Campania.hasMany(Notificacion, { foreignKey: "id_campania", as: "notificaciones" }) // TODO: Implementar Notificacion

// ===== RELACIONES NOTIFICACIÓN =====
// Notificacion.belongsTo(Usuario, { foreignKey: "id_usuario", as: "usuario" }) // TODO: Implementar Notificacion
// Notificacion.belongsTo(Campania, { foreignKey: "id_campania", as: "campania" }) // TODO: Implementar Notificacion

// Admin notifications and contact messages
AdminNotificacion.hasOne(MensajeContacto, { foreignKey: "id_notificacion", as: "mensajeContacto" })

// ===== RELACIONES SUSCRIPTOR =====
Suscriptor.belongsToMany(Campania, {
  through: CampaniaSuscriptor,
  foreignKey: "id_suscriptor",
  otherKey: "id_campania",
  as: "campanias",
})

// ===== RELACIONES CAMPAÑA-SUSCRIPTOR =====
Campania.belongsToMany(Suscriptor, {
  through: CampaniaSuscriptor,
  foreignKey: "id_campania",
  otherKey: "id_suscriptor",
  as: "suscriptores",
})

CampaniaSuscriptor.belongsTo(Campania, { foreignKey: "id_campania", as: "campania" })
CampaniaSuscriptor.belongsTo(Suscriptor, { foreignKey: "id_suscriptor", as: "suscriptor" })

// ===== RELACIONES PAGO =====
Pago.belongsTo(Compra, { foreignKey: "id_compra", as: "compra" })
Pago.belongsTo(MetodoPago, { foreignKey: "id_metodo_pago", as: "metodo_pago" })

Compra.hasMany(Pago, { foreignKey: "id_compra", as: "pagos" })
MetodoPago.hasMany(Pago, { foreignKey: "id_metodo_pago", as: "pagos" })

// ===== RELACIONES CARRITO =====
Carrito.belongsTo(Usuario, { foreignKey: "id_usuario", as: "usuario" })
Usuario.hasMany(Carrito, { foreignKey: "id_usuario", as: "carritos" })

// ===== RELACIONES CARRITO ITEM =====
Carrito.hasMany(CarritoItem, { foreignKey: "id_carrito", as: "items" })
CarritoItem.belongsTo(Carrito, { foreignKey: "id_carrito", as: "carrito" })
CarritoItem.belongsTo(FechaViaje, { foreignKey: "id_fecha_viaje", as: "fechaViaje" })
FechaViaje.hasMany(CarritoItem, { foreignKey: "id_fecha_viaje", as: "carritoItems" })

// ===== RELACIONES MENSAJE CONTACTO =====
MensajeContacto.belongsTo(Usuario, { foreignKey: "id_admin_respondio", as: "adminRespondio" })
Usuario.hasMany(MensajeContacto, { foreignKey: "id_admin_respondio", as: "mensajesRespondidos" })

// ===== RELACIONES NOTIFICACION (ADMIN) =====
// Notificacion.belongsTo(Usuario, { foreignKey: "id_admin_leido", as: "adminLeido" }) // TODO: Implementar Notificacion
// Usuario.hasMany(Notificacion, { foreignKey: "id_admin_leido", as: "notificacionesLeidas" }) // TODO: Implementar Notificacion

// ===== RELACIONES VIAJE-SERVICIO =====
Viaje.belongsToMany(Servicio, {
  through: ViajeServicio,
  foreignKey: "id_viaje",
  otherKey: "id_servicio",
  as: "servicios",
})

Servicio.belongsToMany(Viaje, {
  through: ViajeServicio,
  foreignKey: "id_servicio",
  otherKey: "id_viaje",
  as: "viajes",
})

ViajeServicio.belongsTo(Viaje, { foreignKey: "id_viaje", as: "viaje" })
ViajeServicio.belongsTo(Servicio, { foreignKey: "id_servicio", as: "servicio" })

// ===== RELACIONES VIAJE-EQUIPAMIENTO =====
Viaje.belongsToMany(Equipamiento, {
  through: ViajeEquipamiento,
  foreignKey: "id_viaje",
  otherKey: "id_equipamiento",
  as: "equipamientos",
})

Equipamiento.belongsToMany(Viaje, {
  through: ViajeEquipamiento,
  foreignKey: "id_equipamiento",
  otherKey: "id_viaje",
  as: "viajes",
})

ViajeEquipamiento.belongsTo(Viaje, { foreignKey: "id_viaje", as: "viaje" })
ViajeEquipamiento.belongsTo(Equipamiento, { foreignKey: "id_equipamiento", as: "equipamiento" })

// ===== RELACIONES IMAGEN VIAJE =====
ImagenViaje.belongsTo(Viaje, { foreignKey: "id_viaje", as: "viaje" })
Viaje.hasMany(ImagenViaje, { foreignKey: "id_viaje", as: "imagenes" })

// ===== RELACIONES ADMINISTRADOR =====
Administrador.belongsTo(Usuario, { foreignKey: "id_usuario", as: "usuario" })
Usuario.hasOne(Administrador, { foreignKey: "id_usuario", as: "perfilAdmin" })

// ===== RELACIONES REVIEW =====
Review.belongsTo(Viaje, { foreignKey: "id_viaje", as: "viaje" })
Viaje.hasMany(Review, { foreignKey: "id_viaje", as: "reviews" })

// ===== RELACIONES AUDIT LOG =====
AuditLog.belongsTo(Usuario, { foreignKey: "id_usuario", as: "usuario" })
Usuario.hasMany(AuditLog, { foreignKey: "id_usuario", as: "auditLogs" })

export {
  Usuario,
  Viaje,
  Categoria,
  Destino,
  Reserva,
  Compra,
  FechaViaje,
  Guia,
  Contenido,
  Sugerencia,
  Campania,
  // Notificacion, // TODO: Implementar Notificacion para campañas
  GuiaViaje,
  Suscriptor,
  CampaniaSuscriptor,
  Pago,
  MetodoPago,
  Carrito,
  CarritoItem,
  MensajeContacto,
  Servicio,
  ViajeServicio,
  Equipamiento,
  ViajeEquipamiento,
  ImagenViaje,
  Administrador,
  Configuracion,
  AdminNotificacion,
  Review,
  AuditLog,
  UsuarioRol,
}
