/**
 * Authentication Tests
 *
 * Tests de humo (smoke tests) para endpoints de autenticación.
 * Validan que los endpoints respondan correctamente.
 */

import request from 'supertest';
import app from '../src/server.js';

describe('Authentication Endpoints', () => {
  describe('POST /api/auth/register', () => {
    it('should return 400 when required fields are missing', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com'
          // missing password, nombre, apellido, dni
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 when email is invalid', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: 'password123',
          nombre: 'Test',
          apellido: 'User',
          dni: 12345678
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });

    it('should have correct response structure on validation error', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({});

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('message');
      expect(typeof response.body.success).toBe('boolean');
      expect(typeof response.body.message).toBe('string');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should return 400 when credentials are missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
    });

    it('should return 401 with invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toMatch(/credenciales/i);
    });

    it('should have correct response structure', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('message');
      expect(typeof response.body.success).toBe('boolean');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return 401 without authentication token', async () => {
      const response = await request(app)
        .get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
    });

    it('should return 403 with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Cookie', 'token=invalid-token-here');

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /api/auth/google', () => {
    it('should redirect to Google OAuth', async () => {
      const response = await request(app)
        .get('/api/auth/google')
        .expect(302); // Expect redirect

      expect(response.headers.location).toBeDefined();
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should successfully logout', async () => {
      const response = await request(app)
        .post('/api/auth/logout');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.message).toMatch(/logout/i);
    });

    it('should clear authentication cookie', async () => {
      const response = await request(app)
        .post('/api/auth/logout');

      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      // Check that token cookie is cleared
      const tokenCookie = cookies?.find(cookie => cookie.includes('token='));
      expect(tokenCookie).toBeDefined();
    });
  });
});
