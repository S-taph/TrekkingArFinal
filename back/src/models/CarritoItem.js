/**
 * CarritoItem Model
 * 
 * Modelo para los items individuales del carrito de compras.
 * Cada item referencia una FechaViaje específica para permitir
 * reservas de fechas concretas de viajes.
 */

import { DataTypes } from "sequelize"
import sequelize from "../config/database.js"

const CarritoItem = sequelize.define(
  "carrito_items",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    carritoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "carrito",
        key: "id_carrito",
      },
      field: "id_carrito"
    },
    fechaViajeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "fechas_viaje",
        key: "id_fechas_viaje",
      },
      field: "id_fecha_viaje"
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1,
        max: 20 // Límite razonable por item
      }
    },
    precio_unitario: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: "fecha_creacion"
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: "fecha_actualizacion"
    },
  },
  {
    timestamps: true,
    createdAt: "fecha_creacion",
    updatedAt: "fecha_actualizacion",
    indexes: [
      {
        unique: true,
        fields: ['id_carrito', 'id_fecha_viaje'],
        name: 'unique_carrito_fecha'
      }
    ]
  },
)

export default CarritoItem