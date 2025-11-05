import { DataTypes } from "sequelize"
import sequelize from "../config/database.js"

const GuiaViaje = sequelize.define(
  "guia_viaje",
  {
    id_guia_viaje: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_guia: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "guias",
        key: "id_guia",
      },
    },
    id_fecha_viaje: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "fechas_viaje",
        key: "id_fechas_viaje",
      },
    },
    rol_guia: {
      type: DataTypes.ENUM("principal", "asistente", "especialista"),
      defaultValue: "principal",
    },
    tarifa_acordada: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    estado_asignacion: {
      type: DataTypes.ENUM("asignado", "confirmado", "cancelado"),
      defaultValue: "asignado",
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    fecha_asignacion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: true,
    createdAt: "fecha_asignacion",
    updatedAt: false,
  },
)

export default GuiaViaje
