import { DataTypes } from "sequelize"
import sequelize from "../config/database.js"

/**
 * Modelo de AuditLog para registrar accesos administrativos y acciones críticas
 */
const AuditLog = sequelize.define(
  "audit_logs",
  {
    id_audit_log: {
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
    accion: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "Tipo de acción realizada (ej: login, logout, update_user, delete_trip, etc.)",
    },
    tipo_accion: {
      type: DataTypes.ENUM("login", "logout", "create", "update", "delete", "read", "oauth_login"),
      allowNull: false,
      defaultValue: "read",
    },
    recurso: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "Recurso afectado (ej: usuarios, viajes, reservas, etc.)",
    },
    id_recurso: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "ID del recurso afectado",
    },
    ip_address: {
      type: DataTypes.STRING(45),
      allowNull: true,
      comment: "Dirección IP del cliente (soporta IPv6)",
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "User agent del navegador/cliente",
    },
    detalles: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "Detalles adicionales de la acción en formato JSON",
    },
    estado: {
      type: DataTypes.ENUM("success", "failure", "warning"),
      allowNull: false,
      defaultValue: "success",
    },
    mensaje: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Mensaje descriptivo de la acción",
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
    indexes: [
      {
        fields: ["id_usuario"],
      },
      {
        fields: ["tipo_accion"],
      },
      {
        fields: ["created_at"],
      },
      {
        fields: ["recurso", "id_recurso"],
      },
    ],
  },
)

export default AuditLog
