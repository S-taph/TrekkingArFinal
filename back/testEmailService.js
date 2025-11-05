/**
 * Script de prueba para verificar el servicio de email
 */

import dotenv from 'dotenv';
dotenv.config();

import emailService from './src/services/emailService.js';

async function testEmailService() {
  console.log('\n=== TEST EMAIL SERVICE ===\n');

  console.log('Configuración:');
  console.log('GMAIL_SMTP_USER:', process.env.GMAIL_SMTP_USER);
  console.log('GMAIL_SMTP_PASS:', process.env.GMAIL_SMTP_PASS ? '***configurado***' : 'NO CONFIGURADO');
  console.log('ADMIN_EMAILS:', process.env.ADMIN_EMAILS);
  console.log('\n');

  // Reinicializar el transporter para asegurarnos de que use las variables de entorno
  console.log('Reinicializando transporter...');
  emailService.initializeTransporter();
  console.log('Transporter reinicializado\n');

  // Datos de prueba
  const testContactData = {
    id: 999,
    nombre: 'Test Usuario',
    email: 'juanrojas.laboral@gmail.com', // Enviar a la misma cuenta para verificar
    asunto: 'Prueba de sistema de contacto',
    mensaje: 'Este es un mensaje de prueba para verificar que el sistema de emails funciona correctamente.',
    createdAt: new Date()
  };

  try {
    console.log('1️⃣  Enviando email de notificación a administradores...');
    const adminResult = await emailService.sendContactNotificationToAdmins(testContactData);
    console.log('✅ Email a administradores enviado exitosamente!');
    console.log('   Message ID:', adminResult.messageId);
    console.log('   Accepted:', adminResult.accepted);
    console.log('   Rejected:', adminResult.rejected);
    console.log('\n');

    console.log('2️⃣  Enviando email de confirmación al usuario...');
    const userResult = await emailService.sendContactConfirmationToUser(testContactData);
    console.log('✅ Email de confirmación enviado exitosamente!');
    console.log('   Message ID:', userResult.messageId);
    console.log('   Accepted:', userResult.accepted);
    console.log('   Rejected:', userResult.rejected);
    console.log('\n');

    console.log('🎉 TODOS LOS EMAILS SE ENVIARON CORRECTAMENTE!');
    console.log('Revisa la bandeja de entrada de:', process.env.ADMIN_EMAILS);
    console.log('\n');

  } catch (error) {
    console.error('❌ ERROR AL ENVIAR EMAILS:');
    console.error('   Mensaje:', error.message);
    console.error('   Detalles:', error);
    console.log('\n');
    console.log('Posibles soluciones:');
    console.log('1. Verifica que GMAIL_SMTP_USER y GMAIL_SMTP_PASS estén correctos en .env');
    console.log('2. Asegúrate de usar una "Contraseña de aplicación" de Google, no tu contraseña normal');
    console.log('3. Verifica que tengas activada la verificación en 2 pasos en tu cuenta de Google');
    console.log('4. Genera una nueva contraseña de aplicación en: https://myaccount.google.com/apppasswords');
  }

  process.exit(0);
}

// Ejecutar test
testEmailService();
