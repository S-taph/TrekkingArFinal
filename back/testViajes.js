import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function testViajes() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
  });

  try {
    console.log('🔍 Verificando viajes en la base de datos...\n');

    // Consultar todos los viajes
    const [viajes] = await connection.query('SELECT id_viaje, titulo, activo, destacado FROM viajes');

    console.log(`Total de viajes: ${viajes.length}\n`);

    if (viajes.length > 0) {
      console.log('Detalles de los viajes:');
      console.table(viajes);

      // Contar viajes activos vs inactivos
      const activos = viajes.filter(v => v.activo === 1 || v.activo === true).length;
      const inactivos = viajes.length - activos;

      console.log(`\n📊 Resumen:`);
      console.log(`   Viajes activos: ${activos}`);
      console.log(`   Viajes inactivos: ${inactivos}`);
    } else {
      console.log('❌ No hay viajes en la base de datos');
    }

    // Consultar imágenes de viajes
    const [imagenes] = await connection.query('SELECT COUNT(*) as total FROM imagenes_viaje');
    console.log(`\n🖼️  Total de imágenes: ${imagenes[0].total}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

testViajes();
