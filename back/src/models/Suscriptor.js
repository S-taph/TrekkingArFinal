import { DataTypes } from "sequelize"
import sequelize from "../config/database.js"

const Suscriptor = sequelize.define(
  "suscriptores",
  {
    id_suscriptor: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    origen: {
      type: DataTypes.ENUM("web", "landing", "social", "referido"),
      defaultValue: "web",
    },
    token_desuscripcion: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true,
    },
    fecha_suscripcion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    fecha_desuscripcion: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    createdAt: "fecha_suscripcion",
    updatedAt: false,
  },
)

export default Suscriptor
