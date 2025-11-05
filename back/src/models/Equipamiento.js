import { DataTypes } from "sequelize"
import sequelize from "../config/database.js"

const Equipamiento = sequelize.define(
  "equipamiento",
  {
    id_equipamiento: {
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
    categoria: {
      type: DataTypes.ENUM("ropa", "calzado", "accesorios", "tecnico", "seguridad", "camping", "otro"),
      allowNull: false,
    },
    es_obligatorio: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
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

export default Equipamiento
