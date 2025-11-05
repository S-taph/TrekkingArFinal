import bcrypt from 'bcryptjs';
import Usuario from './src/models/Usuario.js';

const nuevaPassword = 'TuNuevaPassword123';
const hash = await bcrypt.hash(nuevaPassword, 12); // bcryptjs usa rounds = 12

await Usuario.update(
  { password_hash: hash }, // ⚠️ actualizar password_hash
  { where: { email: 'admin@trekking.com' } }
);

console.log('Contraseña actualizada correctamente');
