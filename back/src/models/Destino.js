import { DataTypes } from "sequelize"
import sequelize from "../config/database.js"

const Destino = sequelize.define(
  "destinos",
  {
    id_destino: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      comment: "Nombre del destino, ej: Cerro Aconcagua, Laguna Brava",
    },
    provincia: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "Provincia donde se ubica el destino, ej: Mendoza, Salta",
    },
    region: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "Región geográfica, ej: Cuyo, NOA, Patagonia",
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Descripción general del destino",
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
    indexes: [
      {
        unique: true,
        fields: ["nombre"],
      },
    ],
  },
)

export default Destino
