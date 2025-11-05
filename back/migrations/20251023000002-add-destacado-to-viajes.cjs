/**
 * Migration: Add destacado field to viajes table
 *
 * Agrega el campo destacado para marcar viajes destacados
 * que se mostrarán en la sección "Experiencias Destacadas"
 */

'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('viajes', 'destacado', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      after: 'activo',
    });

    // Agregar índice para búsquedas rápidas de viajes destacados
    await queryInterface.addIndex('viajes', {
      fields: ['destacado'],
      name: 'idx_viajes_destacado',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('viajes', 'idx_viajes_destacado');
    await queryInterface.removeColumn('viajes', 'destacado');
  },
};
