/**
 * Passport Configuration
 *
 * Configuración de Passport para autenticación con Google OAuth.
 * Maneja la creación y vinculación de usuarios con cuentas de Google.
 * Implementa verificación de lista blanca para administradores.
 */

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import Usuario from '../models/Usuario.js';
import roleService from '../services/roleService.js';

/**
 * Obtiene la lista de emails autorizados como administradores
 * @returns {Array<string>} Lista de emails de administradores
 */
const getAdminWhitelist = () => {
  const whitelist = process.env.ADMIN_WHITELIST || '';
  return whitelist
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(email => email.length > 0);
};

/**
 * Verifica si un email está en la lista blanca de administradores
 * @param {string} email - Email a verificar
 * @returns {boolean}
 */
const isAdminWhitelisted = (email) => {
  const whitelist = getAdminWhitelist();
  if (whitelist.length === 0) {
    // Si no hay lista blanca configurada, ningún email está autorizado automáticamente
    return false;
  }
  return whitelist.includes(email.toLowerCase());
};

// Configurar estrategia de Google OAuth
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3003/api/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    console.log('Google OAuth profile:', profile);

    // Buscar usuario existente por Google ID
    let user = await Usuario.findOne({ 
      where: { googleId: profile.id } 
    });

    if (user) {
      // Usuario ya existe con Google ID
      return done(null, user);
    }

    // Buscar usuario existente por email
    user = await Usuario.findOne({ 
      where: { email: profile.emails[0].value } 
    });

    if (user) {
      // Usuario existe pero no tiene Google ID vinculado
      // Vincular la cuenta de Google al usuario existente
      await user.update({
        googleId: profile.id,
        avatar: profile.photos[0]?.value || null,
        is_verified: true // Auto-verificar usuarios de Google OAuth
      });

      console.log('Google account linked to existing user:', user.email);

      // Log de seguridad: verificar si es admin
      if (user.rol === 'admin') {
        console.log(`[SECURITY] 🔐 Admin login via OAuth: ${user.email}`);
      }

      return done(null, user);
    }

    // Verificar si el email está en la lista blanca de administradores
    const email = profile.emails[0].value;
    const shouldBeAdmin = isAdminWhitelisted(email);

    // Determinar rol inicial
    let userRole = 'cliente';
    if (shouldBeAdmin) {
      userRole = 'admin';
      console.log(`[SECURITY] ✅ Email ${email} encontrado en lista blanca de administradores`);
    }

    // Crear nuevo usuario
    const newUser = await Usuario.create({
      googleId: profile.id,
      email: email,
      nombre: profile.name.givenName,
      apellido: profile.name.familyName,
      avatar: profile.photos[0]?.value || null,
      password_hash: null, // No password para usuarios de Google
      dni: null, // Se puede completar después
      telefono: null,
      rol: userRole, // Mantenido para retrocompatibilidad
      activo: true,
      is_verified: true // Auto-verificar usuarios de Google OAuth
    });

    // Asignar roles en el nuevo sistema
    await roleService.setupInitialRoles(newUser.id_usuarios, "cliente")

    // Si está en la whitelist, asignar rol de admin adicional
    if (shouldBeAdmin) {
      await roleService.assignRole(newUser.id_usuarios, "admin", null, "Email en lista blanca de administradores")
      console.log(`[SECURITY] 🔐 New admin user created with Google OAuth: ${newUser.email}`);
    } else {
      console.log('New user created with Google OAuth:', newUser.email);
    }

    return done(null, newUser);

  } catch (error) {
    console.error('Error in Google OAuth strategy:', error);
    return done(error, null);
  }
}));

// Serializar usuario para la sesión
passport.serializeUser((user, done) => {
  done(null, user.id_usuarios);
});

// Deserializar usuario de la sesión
passport.deserializeUser(async (id, done) => {
  try {
    const user = await Usuario.findByPk(id, {
      attributes: { exclude: ['password_hash'] }
    });
    done(null, user);
  } catch (error) {
    console.error('Error deserializing user:', error);
    done(error, null);
  }
});

// Función para configurar Passport con la app
export const configurePassportGoogle = (app) => {
  app.use(passport.initialize());
  app.use(passport.session());
};

export default passport;