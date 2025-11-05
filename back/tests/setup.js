/**
 * Test Setup
 *
 * Configuración global para todos los tests.
 * Configura el entorno de test y establece timeouts.
 */

// Configurar timeout global para tests (10 segundos)
jest.setTimeout(10000);

// Configurar variables de entorno para tests
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_EXPIRES_IN = '1d';

// Mock para console.log en tests (reduce ruido)
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
};
