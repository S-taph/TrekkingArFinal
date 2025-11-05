import { DataTypes } from "sequelize"
import sequelize from "../config/database.js"

const Viaje = sequelize.define(
  "viajes",
  {
    id_viaje: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_categoria: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "categorias",
        key: "id_categoria",
      },
    },
    id_destino: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "destinos",
        key: "id_destino",
      },
    },
    titulo: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    descripcion_corta: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    descripcion_completa: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    itinerario_detallado: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    dificultad: {
      type: DataTypes.ENUM("facil", "moderado", "dificil", "extremo"),
      allowNull: false,
    },
    duracion_dias: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    precio_base: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    imagen_principal_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    condiciones_fisicas: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    minimo_participantes: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    maximo_participantes: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    incluye: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    no_incluye: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    recomendaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    destacado: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    fecha_creacion: {
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
    createdAt: "fecha_creacion",
    updatedAt: "fecha_actualizacion",
  },
)

export default Viaje
