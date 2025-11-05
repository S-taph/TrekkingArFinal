'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Agregar columna token_desuscripcion a la tabla suscriptores
    await queryInterface.addColumn('suscriptores', 'token_desuscripcion', {
      type: Sequelize.STRING(255),
      allowNull: true,
      unique: true,
      after: 'origen'
    });

    // Agregar índice
    await queryInterface.addIndex('suscriptores', ['token_desuscripcion'], {
      name: 'suscriptores_token_desuscripcion'
    });

    console.log('✅ Campo token_desuscripcion agregado exitosamente');
  },

  async down(queryInterface, Sequelize) {
    // Remover índice
    await queryInterface.removeIndex('suscriptores', 'suscriptores_token_desuscripcion');

    // Remover columna
    await queryInterface.removeColumn('suscriptores', 'token_desuscripcion');

    console.log('✅ Campo token_desuscripcion removido exitosamente');
  }
};
