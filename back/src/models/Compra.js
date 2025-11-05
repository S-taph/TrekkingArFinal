import { DataTypes } from "sequelize"
import sequelize from "../config/database.js"

const Compra = sequelize.define(
  "compras",
  {
    id_compras: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    numero_compra: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "usuarios",
        key: "id_usuarios",
      },
    },
    total_compra: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    estado_compra: {
      type: DataTypes.ENUM("pendiente", "pagada", "cancelada", "reembolsada"),
      defaultValue: "pendiente",
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    fecha_compra: {
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
    createdAt: "fecha_compra",
    updatedAt: "fecha_actualizacion",
  },
)

export default Compra
