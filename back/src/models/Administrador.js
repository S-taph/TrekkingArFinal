import { DataTypes } from "sequelize"
import sequelize from "../config/database.js"

const Administrador = sequelize.define(
  "administradores",
  {
    id_administrador: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "usuarios",
        key: "id_usuarios",
      },
    },
    nivel: {
      type: DataTypes.ENUM("super_admin", "admin", "moderador"),
      defaultValue: "admin",
    },
    fecha_designacion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    createdAt: "fecha_designacion",
    updatedAt: false,
  },
)

export default Administrador
