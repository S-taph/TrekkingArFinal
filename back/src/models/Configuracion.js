import { DataTypes } from "sequelize"
import sequelize from "../config/database.js"

const Configuracion = sequelize.define(
  "configuraciones",
  {
    id_configuracion: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    modulo: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    clave: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    valor: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    tipo: {
      type: DataTypes.ENUM("string", "number", "boolean", "json"),
      defaultValue: "string",
    },
    es_publica: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: "Si puede ser accedida desde el frontend",
    },
    fecha_actualizacion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: true,
    createdAt: false,
    updatedAt: "fecha_actualizacion",
    indexes: [
      {
        unique: true,
        fields: ["modulo", "clave"],
      },
    ],
  },
)

export default Configuracion
