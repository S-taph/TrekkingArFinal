'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('campania_suscriptor', {
      id_campania_suscriptor: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id_campania: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'campanias',
          key: 'id_campania'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      id_suscriptor: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'suscriptores',
          key: 'id_suscriptor'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      entregada: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      abierta: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      clickeada: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      fecha_entrega: {
        type: Sequelize.DATE,
        allowNull: true
      },
      fecha_abierta: {
        type: Sequelize.DATE,
        allowNull: true
      },
      fecha_clickeada: {
        type: Sequelize.DATE,
        allowNull: true
      },
      error_envio: {
        type: Sequelize.TEXT,
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

    // Índices
    await queryInterface.addIndex('campania_suscriptor', ['id_campania']);
    await queryInterface.addIndex('campania_suscriptor', ['id_suscriptor']);
    await queryInterface.addIndex('campania_suscriptor', ['entregada']);

    // Índice compuesto para evitar duplicados
    await queryInterface.addIndex('campania_suscriptor', ['id_campania', 'id_suscriptor'], {
      unique: true,
      name: 'unique_campania_suscriptor'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('campania_suscriptor');
  }
};
