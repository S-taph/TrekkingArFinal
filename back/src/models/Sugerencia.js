import { DataTypes } from "sequelize"
import sequelize from "../config/database.js"

const Sugerencia = sequelize.define(
  "sugerencias",
  {
    id_sugerencia: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "usuarios",
        key: "id_usuarios",
      },
    },
    tipo_sugerencia: {
      type: DataTypes.ENUM("mejora", "nuevo_viaje", "problema", "felicitacion", "otro"),
      allowNull: false,
    },
    titulo: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    prioridad: {
      type: DataTypes.ENUM("baja", "media", "alta"),
      defaultValue: "media",
    },
    estado: {
      type: DataTypes.ENUM("pendiente", "en_revision", "implementada", "rechazada"),
      defaultValue: "pendiente",
    },
    respuesta_admin: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    fecha_respuesta: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    fecha_creacion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    fecha_actualizacion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: true,
    createdAt: "fecha_creacion",
    updatedAt: "fecha_actualizacion",
  },
)

export default Sugerencia
