import sequelize from './src/config/database.js';

async function verifyDatabase() {
  try {
    console.log('🔍 Verificando estado de la base de datos...\n');
    await sequelize.authenticate();

    // Verificar tabla destinos
    const [destinos] = await sequelize.query('SELECT COUNT(*) as total FROM destinos');
    console.log(`✅ Tabla destinos: ${destinos[0].total} registros`);

    // Verificar columna id_destino en viajes
    const [columns] = await sequelize.query(`
      SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_KEY
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'viajes'
      AND COLUMN_NAME = 'id_destino'
    `);

    if (columns.length > 0) {
      console.log('✅ Columna id_destino en viajes:');
      console.log(`   - Tipo: ${columns[0].COLUMN_TYPE}`);
      console.log(`   - Nullable: ${columns[0].IS_NULLABLE}`);
      console.log(`   - Key: ${columns[0].COLUMN_KEY || 'None'}`);
    } else {
      console.log('❌ Columna id_destino NO EXISTE en viajes');
    }

    // Verificar foreign key
    const [fks] = await sequelize.query(`
      SELECT CONSTRAINT_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'viajes'
      AND COLUMN_NAME = 'id_destino'
      AND REFERENCED_TABLE_NAME IS NOT NULL
    `);

    if (fks.length > 0) {
      console.log(`✅ Foreign key: ${fks[0].CONSTRAINT_NAME} -> ${fks[0].REFERENCED_TABLE_NAME}.${fks[0].REFERENCED_COLUMN_NAME}`);
    } else {
      console.log('⚠️  No se encontró foreign key para id_destino');
    }

    // Intentar hacer un query de prueba con el join
    console.log('\n🧪 Probando query con JOIN a destinos...');
    const [viajes] = await sequelize.query(`
      SELECT v.id_viaje, v.titulo, d.nombre as destino_nombre
      FROM viajes v
      LEFT JOIN destinos d ON v.id_destino = d.id_destino
      LIMIT 3
    `);
    console.log(`✅ Query exitoso! ${viajes.length} viajes obtenidos`);

    await sequelize.close();
    console.log('\n✅ Verificación completada - Base de datos OK');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    await sequelize.close();
    process.exit(1);
  }
}

verifyDatabase();
