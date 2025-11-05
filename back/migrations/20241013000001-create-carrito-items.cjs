/**
 * Migration: Create CarritoItems table
 * 
 * Creates the carrito_items table to store individual items
 * in user shopping carts, referencing specific FechaViaje instances.
 */

'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('carrito_items', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id_carrito: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'carrito',
          key: 'id_carrito'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      id_fecha_viaje: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'fechas_viaje',
          key: 'id_fechas_viaje'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      cantidad: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      precio_unitario: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      subtotal: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      fecha_creacion: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      fecha_actualizacion: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Add unique constraint to prevent duplicate items for same cart and date
    await queryInterface.addIndex('carrito_items', {
      fields: ['id_carrito', 'id_fecha_viaje'],
      unique: true,
      name: 'unique_carrito_fecha'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('carrito_items');
  }
};
