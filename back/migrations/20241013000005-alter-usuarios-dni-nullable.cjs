/**
 * Migration: Alter usuarios table - Make DNI nullable
 *
 * Allows DNI to be null for users registering via Google OAuth
 * who can complete their profile information later.
 */

'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('usuarios', 'dni', {
      type: Sequelize.INTEGER,
      allowNull: true, // Changed from false to true
      unique: true
    });
  },

  async down(queryInterface, Sequelize) {
    // Note: Rolling back this migration might fail if there are NULL values
    await queryInterface.changeColumn('usuarios', 'dni', {
      type: Sequelize.INTEGER,
      allowNull: false,
      unique: true
    });
  }
};
