'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Eliminar columna url_local si existe
    const tableDescription = await queryInterface.describeTable('imagenes_viaje');

    if (tableDescription.url_local) {
      await queryInterface.removeColumn('imagenes_viaje', 'url_local');
    }
  },

  async down(queryInterface, Sequelize) {
    // Revertir: agregar url_local de nuevo
    await queryInterface.addColumn('imagenes_viaje', 'url_local', {
      type: Sequelize.STRING(500),
      allowNull: true,
    });
  }
};
