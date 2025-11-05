import { DataTypes } from "sequelize"
import sequelize from "../config/database.js"

const FechaViaje = sequelize.define(
  "fechas_viaje",
  {
    id_fechas_viaje: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_viaje: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "viajes",
        key: "id_viaje",
      },
    },
    fecha_inicio: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    fecha_fin: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    cupos_totales: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10,
    },
    cupos_ocupados: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    cupos_disponibles: {
      type: DataTypes.VIRTUAL,
      get() {
        return Math.max(0, (this.getDataValue('cupos_totales') || 10) - (this.getDataValue('cupos_ocupados') || 0));
      }
    },
    precio_fecha: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true, // Si es null, usa el precio base del viaje
    },
    estado_fecha: {
      type: DataTypes.ENUM("disponible", "completo", "cancelado"),
      defaultValue: "disponible",
    },
    observaciones: {
      type: DataTypes.TEXT,
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

export default FechaViaje
