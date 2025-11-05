'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('usuarios', 'failed_login_attempts', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false,
      comment: 'Número de intentos fallidos de login consecutivos'
    });

    await queryInterface.addColumn('usuarios', 'locked_until', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Fecha hasta la cual la cuenta está bloqueada'
    });

    await queryInterface.addColumn('usuarios', 'last_failed_login', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Fecha del último intento fallido de login'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('usuarios', 'failed_login_attempts');
    await queryInterface.removeColumn('usuarios', 'locked_until');
    await queryInterface.removeColumn('usuarios', 'last_failed_login');
  }
};
