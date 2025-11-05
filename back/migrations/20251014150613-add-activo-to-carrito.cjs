'use strict';

export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn('carrito', 'activo', {
    type: Sequelize.BOOLEAN,
    defaultValue: true,
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeColumn('carrito', 'activo');
}
