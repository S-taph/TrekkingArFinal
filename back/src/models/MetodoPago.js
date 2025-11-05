import { DataTypes } from "sequelize"
import sequelize from "../config/database.js"

const MetodoPago = sequelize.define(
  "metodos_pago",
  {
    id_metodo_pago: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    configuracion_json: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "Configuración específica del método de pago",
    },
    comision_porcentaje: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      defaultValue: 0,
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

export default MetodoPago
