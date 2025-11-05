import sequelize from './src/config/database.js';
import { up, down } from './migrations/20251029_create_destino_and_update_viaje.js';

async function runMigration() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida correctamente');

    console.log('\n🚀 Ejecutando migración: create_destino_and_update_viaje...');
    await up(sequelize.getQueryInterface(), sequelize.Sequelize);
    console.log('✅ Migración completada exitosamente!');

    console.log('\n📊 Verificando tabla destinos...');
    const [destinos] = await sequelize.query('SELECT * FROM destinos LIMIT 5');
    console.log(`✅ Tabla destinos creada con ${destinos.length} registros de ejemplo`);

    console.log('\n📊 Verificando columna id_destino en viajes...');
    const [columns] = await sequelize.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'viajes' AND COLUMN_NAME = 'id_destino'
    `);
    if (columns.length > 0) {
      console.log('✅ Columna id_destino agregada correctamente a la tabla viajes');
    } else {
      console.log('❌ Error: Columna id_destino no encontrada en tabla viajes');
    }

    await sequelize.close();
    console.log('\n✅ Proceso completado exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error ejecutando migración:', error);
    console.error('\nDetalles del error:', error.message);
    await sequelize.close();
    process.exit(1);
  }
}

runMigration();
