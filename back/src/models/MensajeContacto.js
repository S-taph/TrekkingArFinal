/**
 * MensajeContacto Model
 * 
 * Modelo para almacenar mensajes de contacto de usuarios
 * y permitir respuestas de administradores.
 */

import { DataTypes } from "sequelize"
import sequelize from "../config/database.js"

const MensajeContacto = sequelize.define(
  "mensajes_contacto",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: [2, 100]
      }
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    asunto: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        len: [5, 200]
      }
    },
    mensaje: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: [10, 2000]
      }
    },
    estado: {
      type: DataTypes.ENUM("nuevo", "respondido", "cerrado"),
      defaultValue: "nuevo",
      allowNull: false
    },
    respuesta: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    respondido_por: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "usuarios",
        key: "id_usuarios",
      },
      field: "id_admin_respondio"
    },
    fecha_respuesta: {
      type: DataTypes.DATE,
      allowNull: true
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
    indexes: [
      {
        fields: ['estado']
      },
      {
        fields: ['email']
      }
    ]
  },
)

export default MensajeContacto