/**
 * AdminNotificacion Model
 *
 * Modelo para notificaciones del sistema dirigidas a administradores.
 * Incluye notificaciones de contacto, órdenes y eventos del sistema.
 */

import { DataTypes } from "sequelize"
import sequelize from "../config/database.js"

const AdminNotificacion = sequelize.define(
  "admin_notificaciones",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    tipo: {
      type: DataTypes.ENUM("contact_form", "sistema", "order", "reserva"),
      allowNull: false
    },
    titulo: {
      type: DataTypes.STRING(200),
      allowNull: true // Made optional since contactController doesn't use it
    },
    mensaje: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    leido: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    meta: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "Datos adicionales como IDs relacionados, URLs, etc."
    },
    from_email: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    to_admin: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false
    },
    prioridad: {
      type: DataTypes.ENUM("baja", "media", "alta", "urgente"),
      defaultValue: "media",
      allowNull: true // Made optional
    },
    fecha_leido: {
      type: DataTypes.DATE,
      allowNull: true
    },
    id_admin_leido: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "usuarios",
        key: "id_usuarios",
      },
      field: "id_admin_leido"
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: "fecha_creacion"
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: "fecha_actualizacion"
    },
  },
  {
    timestamps: true,
    createdAt: "fecha_creacion",
    updatedAt: "fecha_actualizacion",
    freezeTableName: true,
    indexes: [
      {
        fields: ['leido']
      },
      {
        fields: ['tipo']
      },
      {
        fields: ['prioridad']
      },
      {
        fields: ['to_admin']
      }
    ]
  },
)

export default AdminNotificacion
