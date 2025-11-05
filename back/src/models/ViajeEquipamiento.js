import { DataTypes } from "sequelize"
import sequelize from "../config/database.js"

const ViajeEquipamiento = sequelize.define(
  "viaje_equipamiento",
  {
    id_viaje: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: "viajes",
        key: "id_viaje",
      },
    },
    id_equipamiento: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: "equipamiento",
        key: "id_equipamiento",
      },
    },
    es_obligatorio: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
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

export default ViajeEquipamiento
