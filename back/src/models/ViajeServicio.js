import { DataTypes } from "sequelize"
import sequelize from "../config/database.js"

const ViajeServicio = sequelize.define(
  "viaje_servicio",
  {
    id_viaje: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: "viajes",
        key: "id_viaje",
      },
    },
    id_servicio: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: "servicios",
        key: "id_servicio",
      },
    },
    incluido: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: "Si está incluido en el precio base o es adicional",
    },
    precio_adicional: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    timestamps: false,
  },
)

export default ViajeServicio
