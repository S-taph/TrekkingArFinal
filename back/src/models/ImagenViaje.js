import { DataTypes } from "sequelize"
import sequelize from "../config/database.js"

const ImagenViaje = sequelize.define(
  "imagenes_viaje",
  {
    id_imagen_viaje: {
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
    url: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    orden: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    es_principal: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    focus_point: {
      type: DataTypes.STRING(50),
      defaultValue: 'center',
      allowNull: false,
      validate: {
        isIn: [['center', 'top', 'bottom', 'left', 'right',
                'top left', 'top right', 'bottom left', 'bottom right']]
      }
    },
  },
  {
    timestamps: false,
  },
)

export default ImagenViaje
