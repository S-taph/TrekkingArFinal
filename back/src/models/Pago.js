import { DataTypes } from "sequelize"
import sequelize from "../config/database.js"

const Pago = sequelize.define(
  "pagos",
  {
    id_pago: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_compra: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "compras",
        key: "id_compras",
      },
    },
    id_metodo_pago: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "metodos_pago",
        key: "id_metodo_pago",
      },
    },
    monto: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    estado_pago: {
      type: DataTypes.ENUM("pendiente", "procesando", "aprobado", "rechazado", "cancelado", "reembolsado"),
      defaultValue: "pendiente",
    },
    referencia_externa: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "ID de transacción del proveedor de pagos",
    },
    comprobante_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    fecha_pago: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    fecha_creacion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: true,
    createdAt: "fecha_creacion",
    updatedAt: false,
  },
)

export default Pago
