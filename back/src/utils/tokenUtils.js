import crypto from 'crypto'

/**
 * Genera un token aleatorio seguro
 * @param {number} length - Longitud del token en bytes (default: 32)
 * @returns {string} Token hexadecimal
 */
export const generateToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex')
}

/**
 * Genera un código corto alfanumérico (para códigos de descuento, etc)
 * @param {number} length - Longitud del código (default: 8)
 * @returns {string} Código alfanumérico
 */
export const generateShortCode = (length = 8) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  const bytes = crypto.randomBytes(length)

  for (let i = 0; i < length; i++) {
    code += characters[bytes[i] % characters.length]
  }

  return code
}
