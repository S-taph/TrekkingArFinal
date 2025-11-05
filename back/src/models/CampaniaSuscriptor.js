import { DataTypes } from "sequelize"
import sequelize from "../config/database.js"

const CampaniaSuscriptor = sequelize.define(
  "campania_suscriptor",
  {
    id_campania_suscriptor: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_campania: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "campanias",
        key: "id_campania",
      },
    },
    id_suscriptor: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "suscriptores",
        key: "id_suscriptor",
      },
    },
    entregada: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    abierta: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    clickeada: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    fecha_entrega: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    fecha_abierta: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    fecha_clickeada: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    error_envio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    timestamps: true,
  },
)

export default CampaniaSuscriptor
