import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function testFechasViajes() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
  });

  try {
    console.log('🔍 Verificando fechas de viajes...\n');

    // Primero obtener la estructura de la tabla
    const [structure] = await connection.query('DESCRIBE fechas_viaje');
    console.log('Estructura de la tabla fechas_viaje:');
    console.table(structure);

    // Consultar todas las fechas
    const [fechas] = await connection.query(`
      SELECT *
      FROM fechas_viaje
      ORDER BY fecha_inicio
    `);

    console.log(`Total de fechas de viajes: ${fechas.length}\n`);

    if (fechas.length > 0) {
      console.log('Detalles de las fechas:');
      console.table(fechas);

      // Contar por estado
      const disponibles = fechas.filter(f => f.estado_fecha === 'disponible').length;
      const completo = fechas.filter(f => f.estado_fecha === 'completo').length;
      const cancelado = fechas.filter(f => f.estado_fecha === 'cancelado').length;

      console.log(`\n📊 Resumen:`);
      console.log(`   Disponibles: ${disponibles}`);
      console.log(`   Completo: ${completo}`);
      console.log(`   Cancelado: ${cancelado}`);
    } else {
      console.log('❌ No hay fechas de viajes en la base de datos');
      console.log('💡 Esto explica por qué el botón "Reservar" está deshabilitado');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

testFechasViajes();
