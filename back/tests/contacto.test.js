/**
 * Contacto Tests
 *
 * Tests de humo (smoke tests) para endpoints de contacto y notificaciones.
 * Validan que los endpoints respondan correctamente.
 */

import request from 'supertest';
import app from '../src/server.js';

describe('Contacto Endpoints', () => {
  describe('POST /api/contact', () => {
    it('should return 400 when required fields are missing', async () => {
      const response = await request(app)
        .post('/api/contact')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('errors');
    });

    it('should return 400 with invalid email', async () => {
      const response = await request(app)
        .post('/api/contact')
        .send({
          nombre: 'Test User',
          email: 'invalid-email',
          asunto: 'Test Subject',
          mensaje: 'This is a test message for the contact form.'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });

    it('should return 400 when fields are too short', async () => {
      const response = await request(app)
        .post('/api/contact')
        .send({
          nombre: 'T', // Too short
          email: 'test@example.com',
          asunto: 'Sub', // Too short
          mensaje: 'Short' // Too short
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('errors');
    });

    it('should have correct response structure on success', async () => {
      const response = await request(app)
        .post('/api/contact')
        .send({
          nombre: 'Test User',
          email: 'test@example.com',
          asunto: 'Test Subject for Contact Form',
          mensaje: 'This is a test message with sufficient length to pass validation requirements.'
        });

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('message');
      expect(typeof response.body.success).toBe('boolean');

      if (response.body.success) {
        expect(response.status).toBe(201);
        expect(response.body.data).toHaveProperty('mensajeId');
        expect(typeof response.body.data.mensajeId).toBe('number');
      }
    });

    it('should handle special characters in message', async () => {
      const response = await request(app)
        .post('/api/contact')
        .send({
          nombre: 'Test User',
          email: 'test@example.com',
          asunto: 'Test with special chars: ñáéíóú',
          mensaje: 'Mensaje de prueba con caracteres especiales: ñáéíóú ¿? ¡!'
        });

      expect(response.body).toHaveProperty('success');
      expect(typeof response.body.success).toBe('boolean');
    });
  });

  describe('GET /api/admin/notificaciones', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/admin/notificaciones');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
    });

    it('should have correct response structure for admin', async () => {
      const response = await request(app)
        .get('/api/admin/notificaciones')
        .set('x-bypass-auth', 'true');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('data');

      if (response.body.success) {
        expect(response.body.data).toHaveProperty('notificaciones');
        expect(response.body.data).toHaveProperty('pagination');
        expect(response.body.data).toHaveProperty('notificacionesNoLeidas');
        expect(Array.isArray(response.body.data.notificaciones)).toBe(true);
      }
    });

    it('should support pagination parameters', async () => {
      const response = await request(app)
        .get('/api/admin/notificaciones')
        .query({ page: 1, limit: 10 })
        .set('x-bypass-auth', 'true');

      expect(response.status).toBe(200);

      if (response.body.success) {
        expect(response.body.data.pagination).toHaveProperty('page');
        expect(response.body.data.pagination).toHaveProperty('limit');
        expect(response.body.data.pagination).toHaveProperty('totalPages');
        expect(response.body.data.pagination.page).toBe(1);
        expect(response.body.data.pagination.limit).toBe(10);
      }
    });

    it('should support filter by leido', async () => {
      const response = await request(app)
        .get('/api/admin/notificaciones')
        .query({ leido: 'false' })
        .set('x-bypass-auth', 'true');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success');
    });
  });

  describe('PUT /api/admin/notificaciones/:id/read', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .put('/api/admin/notificaciones/1/read');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
    });

    it('should return 400 with invalid notification ID', async () => {
      const response = await request(app)
        .put('/api/admin/notificaciones/invalid/read')
        .set('x-bypass-auth', 'true');

      expect([400, 404]).toContain(response.status);
      expect(response.body).toHaveProperty('success', false);
    });

    it('should have correct response structure', async () => {
      const response = await request(app)
        .put('/api/admin/notificaciones/999999/read')
        .set('x-bypass-auth', 'true');

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('message');
      expect(typeof response.body.success).toBe('boolean');
    });
  });

  describe('POST /api/admin/notificaciones/:id/reply', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/admin/notificaciones/1/reply')
        .send({
          respuesta: 'This is a reply to your message.'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
    });

    it('should return 400 when respuesta is missing', async () => {
      const response = await request(app)
        .post('/api/admin/notificaciones/1/reply')
        .set('x-bypass-auth', 'true')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });

    it('should return 400 when respuesta is too short', async () => {
      const response = await request(app)
        .post('/api/admin/notificaciones/1/reply')
        .set('x-bypass-auth', 'true')
        .send({
          respuesta: 'Short'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });

    it('should have correct response structure', async () => {
      const response = await request(app)
        .post('/api/admin/notificaciones/999999/reply')
        .set('x-bypass-auth', 'true')
        .send({
          respuesta: 'This is a test reply with sufficient length to pass validation.'
        });

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('message');
      expect(typeof response.body.success).toBe('boolean');
    });
  });
});
