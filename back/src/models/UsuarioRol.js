import { DataTypes } from "sequelize"
import sequelize from "../config/database.js"

/**
 * Modelo UsuarioRol - Tabla intermedia para múltiples roles por usuario
 * Permite que un usuario tenga varios roles simultáneamente
 * Ej: Un usuario puede ser admin Y guía al mismo tiempo
 */
const UsuarioRol = sequelize.define(
  "usuario_roles",
  {
    id_usuario_rol: {
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
    rol: {
      type: DataTypes.ENUM("cliente", "admin", "guia"),
      allowNull: false,
      comment: "Rol asignado al usuario",
    },
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
      comment: "Si el rol está activo para el usuario",
    },
    fecha_asignacion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    asignado_por: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "usuarios",
        key: "id_usuarios",
      },
      comment: "ID del admin que asignó este rol",
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Notas sobre la asignación del rol",
    },
  },
  {
    timestamps: true,
    createdAt: "fecha_asignacion",
    updatedAt: false,
    indexes: [
      {
        unique: true,
        fields: ["id_usuario", "rol"],
        name: "unique_usuario_rol",
      },
      {
        fields: ["id_usuario"],
      },
      {
        fields: ["rol"],
      },
    ],
  },
)

export default UsuarioRol
