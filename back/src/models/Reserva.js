import { DataTypes } from "sequelize"
import sequelize from "../config/database.js"

const Reserva = sequelize.define(
  "reservas",
  {
    id_reserva: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    numero_reserva: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    id_compra: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "compras",
        key: "id_compras",
      },
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "usuarios",
        key: "id_usuarios",
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
    cantidad_personas: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    precio_unitario: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    subtotal_reserva: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    estado_reserva: {
      type: DataTypes.ENUM("pendiente", "confirmada", "cancelada", "completada"),
      defaultValue: "pendiente",
    },
    observaciones_reserva: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    fecha_reserva: {
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
    createdAt: "fecha_reserva",
    updatedAt: "fecha_actualizacion",
  },
)

export default Reserva
