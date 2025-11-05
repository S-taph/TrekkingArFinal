/**
 * Migration: Alter Usuarios table for social login
 * 
 * Adds Google OAuth fields and makes password_hash nullable
 * to support social login functionality.
 */

'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add Google OAuth fields
    await queryInterface.addColumn('usuarios', 'googleid', {
      type: Sequelize.STRING(255),
      allowNull: true,
      unique: true,
      comment: 'Google OAuth ID for social login'
    });

    await queryInterface.addColumn('usuarios', 'avatar', {
      type: Sequelize.STRING(500),
      allowNull: true,
      comment: 'User avatar URL from social provider'
    });

    // Make password_hash nullable for social login users
    await queryInterface.changeColumn('usuarios', 'password_hash', {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: 'Password hash, nullable for social login users'
    });

    // Add index for Google ID lookups
    await queryInterface.addIndex('usuarios', {
      fields: ['googleId'],
      name: 'idx_usuarios_google_id',
      unique: true
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove indexes
    await queryInterface.removeIndex('usuarios', 'idx_usuarios_google_id');

    // Remove columns
    await queryInterface.removeColumn('usuarios', 'googleId');
    await queryInterface.removeColumn('usuarios', 'avatar');

    // Restore password_hash as not null (this might fail if there are null values)
    await queryInterface.changeColumn('usuarios', 'password_hash', {
      type: Sequelize.STRING(255),
      allowNull: false
    });
  }
};
