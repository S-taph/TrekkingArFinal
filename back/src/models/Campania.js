import { DataTypes } from "sequelize"
import sequelize from "../config/database.js"

const Campania = sequelize.define(
  "campanias",
  {
    id_campania: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    asunto: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    cuerpo: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    tipo_campania: {
      type: DataTypes.ENUM("descuento", "promocion", "informativa", "temporada"),
      defaultValue: "informativa",
      allowNull: false,
    },
    descuento_porcentaje: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      validate: {
        min: 0,
        max: 100,
      },
    },
    codigo_descuento: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: true,
    },
    fecha_inicio: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    fecha_fin: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    activa: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    limite_usos: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Límite de veces que se puede usar la campaña",
    },
    usos_actuales: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    imagen_campania: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    enviada: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    fecha_envio: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    total_enviados: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
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

export default Campania
