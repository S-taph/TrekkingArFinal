/**
 * Migration: Create MensajesContacto table
 * 
 * Creates the mensajes_contacto table to store contact form
 * submissions and admin responses.
 */

'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('mensajes_contacto', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      nombre: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      asunto: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      mensaje: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      estado: {
        type: Sequelize.ENUM('nuevo', 'respondido', 'cerrado'),
        allowNull: false,
        defaultValue: 'nuevo'
      },
      respuesta: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      id_admin_respondio: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'usuarios',
          key: 'id_usuarios'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      fecha_respuesta: {
        type: Sequelize.DATE,
        allowNull: true
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

    // Add indexes for better query performance
    await queryInterface.addIndex('mensajes_contacto', {
      fields: ['estado'],
      name: 'idx_mensajes_contacto_estado'
    });

    await queryInterface.addIndex('mensajes_contacto', {
      fields: ['email'],
      name: 'idx_mensajes_contacto_email'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('mensajes_contacto');
  }
};
