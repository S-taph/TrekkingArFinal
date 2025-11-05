/**
 * Migration: Create Reviews table
 *
 * Crea la tabla reviews para almacenar comentarios y valoraciones
 * de usuarios sobre viajes realizados.
 */

'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('reviews', {
      id_review: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      nombre: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      ubicacion: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      comentario: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      rating: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 5,
        },
      },
      id_viaje: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'viajes',
          key: 'id_viaje',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      activo: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      fecha_creacion: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      fecha_actualizacion: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    });

    // Agregar índice para búsquedas por viaje
    await queryInterface.addIndex('reviews', {
      fields: ['id_viaje'],
      name: 'idx_reviews_viaje',
    });

    // Agregar índice para filtrar reviews activos
    await queryInterface.addIndex('reviews', {
      fields: ['activo'],
      name: 'idx_reviews_activo',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('reviews');
  },
};
