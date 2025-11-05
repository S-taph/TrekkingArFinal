module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Insertar Mercado Pago como método de pago si no existe
    await queryInterface.sequelize.query(`
      INSERT INTO metodos_pago (nombre, descripcion, activo, comision_porcentaje, fecha_creacion)
      SELECT 'mercadopago', 'Mercado Pago - Todos los medios de pago', true, 0, NOW()
      WHERE NOT EXISTS (
        SELECT 1 FROM metodos_pago WHERE nombre = 'mercadopago'
      );
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Eliminar el método de pago de Mercado Pago
    await queryInterface.sequelize.query(`
      DELETE FROM metodos_pago WHERE nombre = 'mercadopago';
    `);
  }
};
