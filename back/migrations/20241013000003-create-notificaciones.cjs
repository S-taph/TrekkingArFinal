/**
 * Migration: Create Admin Notificaciones table
 *
 * Creates the admin_notificaciones table to store system notifications
 * for administrators (contact forms, orders, system events).
 */

'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('admin_notificaciones', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      tipo: {
        type: Sequelize.ENUM('contact_form', 'sistema', 'order', 'reserva'),
        allowNull: false
      },
      titulo: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      mensaje: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      leido: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      meta: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Datos adicionales como IDs relacionados, URLs, etc.'
      },
      from_email: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      to_admin: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      prioridad: {
        type: Sequelize.ENUM('baja', 'media', 'alta', 'urgente'),
        allowNull: false,
        defaultValue: 'media'
      },
      fecha_leido: {
        type: Sequelize.DATE,
        allowNull: true
      },
      id_admin_leido: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'usuarios',
          key: 'id_usuarios'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
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
    await queryInterface.addIndex('admin_notificaciones', {
      fields: ['leido'],
      name: 'idx_admin_notificaciones_leido'
    });

    await queryInterface.addIndex('admin_notificaciones', {
      fields: ['tipo'],
      name: 'idx_admin_notificaciones_tipo'
    });

    await queryInterface.addIndex('admin_notificaciones', {
      fields: ['prioridad'],
      name: 'idx_admin_notificaciones_prioridad'
    });

    await queryInterface.addIndex('admin_notificaciones', {
      fields: ['to_admin'],
      name: 'idx_admin_notificaciones_to_admin'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('admin_notificaciones');
  }
};
