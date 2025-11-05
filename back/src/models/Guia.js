import { DataTypes } from "sequelize"
import sequelize from "../config/database.js"

const Guia = sequelize.define(
  "guias",
  {
    id_guia: {
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
    matricula: {
      type: DataTypes.STRING(50),
      allowNull: false, // Made matricula required
      unique: true,
      comment: "Número de matrícula profesional del guía",
    },
    certificaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    especialidades: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Montaña, senderismo, escalada, etc.",
    },
    anos_experiencia: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    idiomas: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "Español, Inglés, Francés, etc.",
    },
    tarifa_por_dia: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    disponible: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    calificacion_promedio: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: true,
      validate: {
        min: 0,
        max: 5,
      },
    },
    total_viajes_guiados: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
      comment: "Indica si el guía está activo o inactivo",
    },
    fecha_registro: {
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
    createdAt: "fecha_registro",
    updatedAt: "fecha_actualizacion",
  },
)

export default Guia
