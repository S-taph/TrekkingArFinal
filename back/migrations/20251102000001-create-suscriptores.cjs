'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('suscriptores', {
      id_suscriptor: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true
        }
      },
      nombre: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      activo: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      origen: {
        type: Sequelize.ENUM('web', 'landing', 'social', 'referido'),
        defaultValue: 'web',
        allowNull: false
      },
      token_desuscripcion: {
        type: Sequelize.STRING(255),
        allowNull: true,
        unique: true
      },
      fecha_suscripcion: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false
      },
      fecha_desuscripcion: {
        type: Sequelize.DATE,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // Índices para mejorar performance
    await queryInterface.addIndex('suscriptores', ['email']);
    await queryInterface.addIndex('suscriptores', ['activo']);
    await queryInterface.addIndex('suscriptores', ['token_desuscripcion']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('suscriptores');
  }
};
