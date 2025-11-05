/**
 * Sequelize CLI Configuration
 * 
 * Configuración para sequelize-cli para manejar migraciones
 * y seeders de la base de datos.
 */

require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'trekking_ar',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: console.log,
    timezone: '-03:00', // Argentina timezone
    define: {
      timestamps: true,
      underscored: true,
      createdAt: 'fecha_creacion',
      updatedAt: 'fecha_actualizacion'
    }
  },
  test: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME_TEST || 'trekking_db_test',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
    timezone: '-03:00',
    define: {
      timestamps: true,
      underscored: true,
      createdAt: 'fecha_creacion',
      updatedAt: 'fecha_actualizacion'
    }
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
    timezone: '-03:00',
    define: {
      timestamps: true,
      underscored: true,
      createdAt: 'fecha_creacion',
      updatedAt: 'fecha_actualizacion'
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
};