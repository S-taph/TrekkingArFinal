/**
 * Script para verificar que las variables de entorno se están cargando correctamente
 */

import dotenv from 'dotenv';
dotenv.config();

console.log('\n=== VERIFICACIÓN DE VARIABLES DE ENTORNO ===\n');

console.log('GMAIL_SMTP_USER:', process.env.GMAIL_SMTP_USER);
console.log('GMAIL_SMTP_USER (length):', process.env.GMAIL_SMTP_USER?.length);
console.log('GMAIL_SMTP_USER (type):', typeof process.env.GMAIL_SMTP_USER);
console.log('');

console.log('GMAIL_SMTP_PASS:', process.env.GMAIL_SMTP_PASS);
console.log('GMAIL_SMTP_PASS (length):', process.env.GMAIL_SMTP_PASS?.length);
console.log('GMAIL_SMTP_PASS (type):', typeof process.env.GMAIL_SMTP_PASS);
console.log('GMAIL_SMTP_PASS (chars):', process.env.GMAIL_SMTP_PASS?.split('').join(', '));
console.log('');

console.log('ADMIN_EMAILS:', process.env.ADMIN_EMAILS);
console.log('ADMIN_EMAILS (length):', process.env.ADMIN_EMAILS?.length);
console.log('');

// Verificar si hay caracteres invisibles
const pass = process.env.GMAIL_SMTP_PASS || '';
console.log('Códigos de caracteres de la contraseña:');
for (let i = 0; i < pass.length; i++) {
  console.log(`  [${i}]: '${pass[i]}' (code: ${pass.charCodeAt(i)})`);
}

console.log('\n=== FIN DE VERIFICACIÓN ===\n');
