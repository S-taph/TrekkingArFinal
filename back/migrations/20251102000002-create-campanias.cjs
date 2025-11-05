'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('campanias', {
      id_campania: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      nombre: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      descripcion: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      asunto: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      cuerpo: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      tipo_campania: {
        type: Sequelize.ENUM('descuento', 'promocion', 'informativa', 'temporada'),
        defaultValue: 'informativa',
        allowNull: false
      },
      descuento_porcentaje: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
        validate: {
          min: 0,
          max: 100
        }
      },
      codigo_descuento: {
        type: Sequelize.STRING(50),
        allowNull: true,
        unique: true
      },
      fecha_inicio: {
        type: Sequelize.DATE,
        allowNull: true
      },
      fecha_fin: {
        type: Sequelize.DATE,
        allowNull: true
      },
      activa: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      limite_usos: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      usos_actuales: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      imagen_campania: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      enviada: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      fecha_envio: {
        type: Sequelize.DATE,
        allowNull: true
      },
      total_enviados: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      fecha_creacion: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false
      },
      fecha_actualizacion: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false
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
    await queryInterface.addIndex('campanias', ['activa']);
    await queryInterface.addIndex('campanias', ['enviada']);
    await queryInterface.addIndex('campanias', ['codigo_descuento']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('campanias');
  }
};
