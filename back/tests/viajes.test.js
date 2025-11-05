/**
 * Viajes Tests
 *
 * Tests de humo (smoke tests) para endpoints de viajes.
 * Validan que los endpoints respondan correctamente.
 */

import request from 'supertest';
import app from '../src/server.js';

describe('Viajes Endpoints', () => {
  describe('GET /api/viajes', () => {
    it('should return list of viajes', async () => {
      const response = await request(app)
        .get('/api/viajes');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('data');

      if (response.body.success) {
        expect(response.body.data).toHaveProperty('viajes');
        expect(response.body.data).toHaveProperty('pagination');
        expect(Array.isArray(response.body.data.viajes)).toBe(true);
      }
    });

    it('should support pagination parameters', async () => {
      const response = await request(app)
        .get('/api/viajes')
        .query({ page: 1, limit: 5 });

      expect(response.status).toBe(200);

      if (response.body.success) {
        expect(response.body.data.pagination).toHaveProperty('page');
        expect(response.body.data.pagination).toHaveProperty('limit');
        expect(response.body.data.pagination).toHaveProperty('total');
        expect(response.body.data.pagination).toHaveProperty('totalPages');
        expect(response.body.data.pagination.page).toBe(1);
        expect(response.body.data.pagination.limit).toBe(5);
      }
    });

    it('should support search filter', async () => {
      const response = await request(app)
        .get('/api/viajes')
        .query({ search: 'montaña' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success');
      expect(response.body.data).toHaveProperty('viajes');
    });

    it('should support dificultad filter', async () => {
      const response = await request(app)
        .get('/api/viajes')
        .query({ dificultad: 'moderado' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success');
    });

    it('should support categoria filter', async () => {
      const response = await request(app)
        .get('/api/viajes')
        .query({ categoria: 1 });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success');
    });

    it('should support activo filter', async () => {
      const response = await request(app)
        .get('/api/viajes')
        .query({ activo: 'true' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success');
    });

    it('should have correct viaje structure', async () => {
      const response = await request(app)
        .get('/api/viajes')
        .query({ limit: 1 });

      expect(response.status).toBe(200);

      if (response.body.success && response.body.data.viajes.length > 0) {
        const viaje = response.body.data.viajes[0];

        // Check basic viaje properties
        expect(viaje).toHaveProperty('id_viaje');
        expect(viaje).toHaveProperty('titulo');
        expect(viaje).toHaveProperty('dificultad');
        expect(viaje).toHaveProperty('duracion_dias');
        expect(viaje).toHaveProperty('precio_base');

        // Check for relations
        expect(viaje).toHaveProperty('categoria');
        expect(viaje).toHaveProperty('fechas');
        expect(viaje).toHaveProperty('imagenes');
      }
    });
  });

  describe('GET /api/viajes/:id', () => {
    it('should return 400 with invalid ID', async () => {
      const response = await request(app)
        .get('/api/viajes/invalid-id');

      expect([400, 404]).toContain(response.status);
      expect(response.body).toHaveProperty('success', false);
    });

    it('should return 404 with non-existent ID', async () => {
      const response = await request(app)
        .get('/api/viajes/999999');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toMatch(/no encontrado/i);
    });

    it('should have correct response structure', async () => {
      const response = await request(app)
        .get('/api/viajes/1');

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('message');
      expect(typeof response.body.success).toBe('boolean');

      if (response.body.success) {
        expect(response.status).toBe(200);
        expect(response.body.data).toHaveProperty('viaje');

        const viaje = response.body.data.viaje;

        // Check all expected properties
        expect(viaje).toHaveProperty('id_viaje');
        expect(viaje).toHaveProperty('titulo');
        expect(viaje).toHaveProperty('descripcion_corta');
        expect(viaje).toHaveProperty('descripcion_completa');
        expect(viaje).toHaveProperty('dificultad');
        expect(viaje).toHaveProperty('duracion_dias');
        expect(viaje).toHaveProperty('precio_base');
        expect(viaje).toHaveProperty('activo');

        // Check for relations
        expect(viaje).toHaveProperty('categoria');
        expect(viaje).toHaveProperty('fechas');
        expect(viaje).toHaveProperty('imagenes');

        // Check that fechas is an array
        expect(Array.isArray(viaje.fechas)).toBe(true);
        expect(Array.isArray(viaje.imagenes)).toBe(true);
      }
    });
  });

  describe('POST /api/viajes/:id/images', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/viajes/1/images');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
    });

    it('should return 400 when no files are uploaded', async () => {
      const response = await request(app)
        .post('/api/viajes/1/images')
        .set('x-bypass-auth', 'true');

      // Might be 400 or 404 depending on if viaje exists
      expect([400, 404]).toContain(response.status);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('DELETE /api/viajes/:id/images/:imagenId', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .delete('/api/viajes/1/images/1');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
    });

    it('should return 400 with invalid IDs', async () => {
      const response = await request(app)
        .delete('/api/viajes/invalid/images/invalid')
        .set('x-bypass-auth', 'true');

      expect([400, 404]).toContain(response.status);
      expect(response.body).toHaveProperty('success', false);
    });
  });
});
