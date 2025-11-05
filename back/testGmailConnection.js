/**
 * Script para probar conexión directa con Gmail SMTP
 */

import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

async function testConnection() {
  console.log('\n=== TEST DE CONEXIÓN CON GMAIL SMTP ===\n');

  const config = {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.GMAIL_SMTP_USER,
      pass: process.env.GMAIL_SMTP_PASS
    },
    tls: {
      rejectUnauthorized: false
    },
    debug: true, // Mostrar logs detallados
    logger: true // Mostrar logs
  };

  console.log('Configuración:');
  console.log('- Host:', config.host);
  console.log('- Port:', config.port);
  console.log('- User:', config.auth.user);
  console.log('- Pass:', config.auth.pass ? '***' + config.auth.pass.slice(-4) : 'NO CONFIGURADO');
  console.log('\n');

  console.log('Creando transporter...');
  const transporter = nodemailer.createTransport(config);

  console.log('Verificando conexión...\n');

  try {
    const verified = await transporter.verify();
    console.log('\n✅ ¡CONEXIÓN EXITOSA!');
    console.log('El servidor está listo para enviar mensajes');
    console.log('Detalles:', verified);
  } catch (error) {
    console.log('\n❌ ERROR DE CONEXIÓN');
    console.log('Código de error:', error.code);
    console.log('Mensaje:', error.message);
    console.log('Comando:', error.command);
    console.log('\nDetalles completos:');
    console.log(error);

    console.log('\n📋 DIAGNÓSTICO:');
    if (error.code === 'EAUTH') {
      console.log('- Las credenciales son INVÁLIDAS');
      console.log('- Posibles causas:');
      console.log('  1. La contraseña de aplicación es incorrecta');
      console.log('  2. La contraseña fue revocada');
      console.log('  3. La verificación en 2 pasos no está activada');
      console.log('  4. La cuenta tiene restricciones de seguridad');
    } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED') {
      console.log('- Problema de CONEXIÓN a internet o firewall');
    }
  }

  process.exit(0);
}

testConnection();
