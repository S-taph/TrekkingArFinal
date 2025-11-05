import sequelize from './src/config/database.js';

async function checkAndFix() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida\n');

    // Verificar si existe la tabla destinos
    console.log('📊 Verificando tabla destinos...');
    const [tables] = await sequelize.query(`
      SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'destinos'
    `);

    if (tables.length > 0) {
      console.log('✅ Tabla destinos existe');

      // Ver cuántos registros hay
      const [count] = await sequelize.query('SELECT COUNT(*) as total FROM destinos');
      console.log(`   - Registros actuales: ${count[0].total}`);
    } else {
      console.log('❌ Tabla destinos NO existe - creando...');
      await sequelize.query(`
        CREATE TABLE destinos (
          id_destino INTEGER auto_increment PRIMARY KEY,
          nombre VARCHAR(255) NOT NULL UNIQUE,
          provincia VARCHAR(100),
          region VARCHAR(100),
          descripcion TEXT,
          fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
          fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB
      `);
      console.log('✅ Tabla destinos creada');
    }

    // Verificar si existe la columna id_destino en viajes
    console.log('\n📊 Verificando columna id_destino en viajes...');
    const [columns] = await sequelize.query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'viajes'
      AND COLUMN_NAME = 'id_destino'
    `);

    if (columns.length > 0) {
      console.log('✅ Columna id_destino YA EXISTE en viajes');
    } else {
      console.log('❌ Columna id_destino NO existe - agregando...');
      await sequelize.query(`
        ALTER TABLE viajes
        ADD COLUMN id_destino INTEGER NULL,
        ADD CONSTRAINT fk_viajes_destino
        FOREIGN KEY (id_destino) REFERENCES destinos(id_destino)
        ON UPDATE CASCADE ON DELETE SET NULL
      `);
      console.log('✅ Columna id_destino agregada a viajes');

      // Agregar índice
      await sequelize.query(`
        ALTER TABLE viajes ADD INDEX idx_viajes_destino (id_destino)
      `);
      console.log('✅ Índice agregado');
    }

    // Insertar destinos de ejemplo si la tabla está vacía
    const [destinos] = await sequelize.query('SELECT COUNT(*) as total FROM destinos');
    if (destinos[0].total === 0) {
      console.log('\n📝 Insertando destinos de ejemplo...');
      await sequelize.query(`
        INSERT INTO destinos (nombre, provincia, region, descripcion, fecha_creacion, fecha_actualizacion) VALUES
        ('Cerro Aconcagua', 'Mendoza', 'Cuyo', 'El pico más alto de América', NOW(), NOW()),
        ('Cerro Fitz Roy', 'Santa Cruz', 'Patagonia', 'Icónica montaña patagónica', NOW(), NOW()),
        ('Cerro Torre', 'Santa Cruz', 'Patagonia', 'Una de las montañas más difíciles del mundo', NOW(), NOW()),
        ('Glaciar Perito Moreno', 'Santa Cruz', 'Patagonia', 'Uno de los glaciares más famosos del mundo', NOW(), NOW()),
        ('Cerro Champaquí', 'Córdoba', 'Sierras Pampeanas', 'Punto más alto de Córdoba', NOW(), NOW()),
        ('Quebrada de Humahuaca', 'Jujuy', 'NOA', 'Patrimonio de la Humanidad UNESCO', NOW(), NOW()),
        ('Volcán Lanín', 'Neuquén', 'Patagonia Norte', 'Volcán emblemático de la Patagonia', NOW(), NOW()),
        ('Laguna de los Tres', 'Santa Cruz', 'Patagonia', 'Trekking clásico en El Chaltén', NOW(), NOW()),
        ('Cerro Catedral', 'Río Negro', 'Patagonia', 'Centro de esquí y trekking en Bariloche', NOW(), NOW()),
        ('Valle de la Luna', 'San Juan', 'Cuyo', 'Formaciones rocosas únicas', NOW(), NOW())
      `);
      console.log('✅ 10 destinos insertados');
    }

    console.log('\n✅ Base de datos configurada correctamente!');
    console.log('\n📊 Estado final:');
    const [finalDestinos] = await sequelize.query('SELECT COUNT(*) as total FROM destinos');
    console.log(`   - Destinos: ${finalDestinos[0].total}`);

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    await sequelize.close();
    process.exit(1);
  }
}

checkAndFix();
