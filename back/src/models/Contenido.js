import { DataTypes } from "sequelize"
import sequelize from "../config/database.js"

const Contenido = sequelize.define(
  "contenido",
  {
    id_contenido: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_viaje: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "viajes",
        key: "id_viaje",
      },
    },
    tipo_contenido: {
      type: DataTypes.ENUM("imagen", "video", "documento", "audio"),
      allowNull: false,
    },
    titulo: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    url_archivo: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    orden_visualizacion: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    es_principal: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: "Indica si es la imagen/video principal del viaje",
    },
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    fecha_subida: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: true,
    createdAt: "fecha_subida",
    updatedAt: false,
  },
)

export default Contenido
