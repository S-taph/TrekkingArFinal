'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('imagenes_viaje', 'focus_point', {
      type: Sequelize.STRING(50),
      defaultValue: 'center',
      allowNull: false,
      comment: 'Punto focal de la imagen para recorte (center, top, bottom, left, right, etc.)'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('imagenes_viaje', 'focus_point');
  }
};
