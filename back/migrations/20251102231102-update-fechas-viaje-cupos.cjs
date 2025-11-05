'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Verificar si la columna cupos_totales ya existe
    const tableDescription = await queryInterface.describeTable('fechas_viaje');

    if (!tableDescription.cupos_totales) {
      // Si no existe cupos_totales, renombrar cupos_disponibles a cupos_totales
      await queryInterface.renameColumn('fechas_viaje', 'cupos_disponibles', 'cupos_totales');
      console.log('✅ Columna cupos_disponibles renombrada a cupos_totales');
    } else if (tableDescription.cupos_disponibles) {
      // Si ambas existen, eliminar cupos_disponibles (ahora es virtual)
      await queryInterface.removeColumn('fechas_viaje', 'cupos_disponibles');
      console.log('✅ Columna cupos_disponibles eliminada (ahora es virtual)');
    }
  },

  async down(queryInterface, Sequelize) {
    // Revertir: renombrar cupos_totales de vuelta a cupos_disponibles
    const tableDescription = await queryInterface.describeTable('fechas_viaje');

    if (tableDescription.cupos_totales && !tableDescription.cupos_disponibles) {
      await queryInterface.renameColumn('fechas_viaje', 'cupos_totales', 'cupos_disponibles');
      console.log('✅ Revertido: cupos_totales renombrado a cupos_disponibles');
    }
  }
};
