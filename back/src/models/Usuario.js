import { DataTypes } from "sequelize"
import sequelize from "../config/database.js"

const Usuario = sequelize.define(
  "usuarios",
  {
    id_usuarios: {
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
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: true, // allow null for social login
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    apellido: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    dni: {
      type: DataTypes.INTEGER,
      allowNull: true, // Allow null for Google OAuth users
      unique: true,
      validate: {
        isInt: {
          msg: 'El DNI debe contener solo números'
        },
        len: {
          args: [7, 8],
          msg: 'El DNI debe tener 7 u 8 dígitos'
        }
      }
    },
    telefono: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    contacto_emergencia: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    telefono_emergencia: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    experiencia_previa: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    rol: {
      type: DataTypes.ENUM("cliente", "admin", "guia"),
      defaultValue: "cliente",
    },
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    googleId: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true,
      field: "googleid",
    },
    avatar: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: "is_verified",
    },
    verification_token: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: "verification_token",
    },
    token_expiry: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "token_expiry",
    },
    password_reset_token: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: "password_reset_token",
    },
    password_reset_expiry: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "password_reset_expiry",
    },
    failed_login_attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      field: "failed_login_attempts",
    },
    locked_until: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "locked_until",
    },
    last_failed_login: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "last_failed_login",
    },
  },
  {
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
)

/**
 * Métodos de instancia para manejo de múltiples roles
 */
Usuario.prototype.getRoles = async function() {
  const UsuarioRol = (await import('./UsuarioRol.js')).default
  const roles = await UsuarioRol.findAll({
    where: {
      id_usuario: this.id_usuarios,
      activo: true
    },
    attributes: ['rol']
  })
  return roles.map(r => r.rol)
}

Usuario.prototype.hasRole = async function(rol) {
  const roles = await this.getRoles()
  return roles.includes(rol)
}

Usuario.prototype.hasAnyRole = async function(rolesArray) {
  const userRoles = await this.getRoles()
  return rolesArray.some(rol => userRoles.includes(rol))
}

Usuario.prototype.isAdmin = async function() {
  return await this.hasRole('admin')
}

Usuario.prototype.isGuia = async function() {
  return await this.hasRole('guia')
}

Usuario.prototype.isCliente = async function() {
  return await this.hasRole('cliente')
}

/**
 * Método para obtener el rol principal (para retrocompatibilidad)
 * Prioridad: admin > guia > cliente
 */
Usuario.prototype.getPrimaryRole = async function() {
  const roles = await this.getRoles()
  if (roles.includes('admin')) return 'admin'
  if (roles.includes('guia')) return 'guia'
  return 'cliente'
}

export default Usuario
