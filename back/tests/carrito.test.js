/**
 * Carrito Tests
 *
 * Tests de humo (smoke tests) para endpoints del carrito de compras.
 * Validan que los endpoints respondan correctamente.
 */

import request from 'supertest';
import app from '../src/server.js';

describe('Carrito Endpoints', () => {
  describe('GET /api/carrito', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/carrito');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
    });

    it('should have correct response structure when authenticated', async () => {
      // Using development bypass header
      const response = await request(app)
        .get('/api/carrito')
        .set('x-bypass-auth', 'true');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('data');

      if (response.body.success) {
        expect(response.body.data).toHaveProperty('carrito');
        expect(response.body.data.carrito).toHaveProperty('items');
        expect(response.body.data.carrito).toHaveProperty('subtotal');
        expect(response.body.data.carrito).toHaveProperty('totalItems');
      }
    });
  });

  describe('POST /api/carrito/items', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/carrito/items')
        .send({
          fechaViajeId: 1,
          cantidad: 2
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
    });

    it('should return 400 with missing required fields', async () => {
      const response = await request(app)
        .post('/api/carrito/items')
        .set('x-bypass-auth', 'true')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 with invalid cantidad', async () => {
      const response = await request(app)
        .post('/api/carrito/items')
        .set('x-bypass-auth', 'true')
        .send({
          fechaViajeId: 1,
          cantidad: 0 // Invalid: must be >= 1
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });

    it('should have correct response structure', async () => {
      const response = await request(app)
        .post('/api/carrito/items')
        .set('x-bypass-auth', 'true')
        .send({
          fechaViajeId: 999999, // Non-existent ID
          cantidad: 1
        });

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('message');
      expect(typeof response.body.success).toBe('boolean');
    });
  });

  describe('PUT /api/carrito/items/:id', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .put('/api/carrito/items/1')
        .send({
          cantidad: 3
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
    });

    it('should return 400 with invalid cantidad', async () => {
      const response = await request(app)
        .put('/api/carrito/items/1')
        .set('x-bypass-auth', 'true')
        .send({
          cantidad: 0
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });

    it('should return 400 with missing cantidad', async () => {
      const response = await request(app)
        .put('/api/carrito/items/1')
        .set('x-bypass-auth', 'true')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('DELETE /api/carrito/items/:id', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .delete('/api/carrito/items/1');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
    });

    it('should return 400 with invalid item ID', async () => {
      const response = await request(app)
        .delete('/api/carrito/items/invalid')
        .set('x-bypass-auth', 'true');

      // Should fail validation before reaching controller
      expect([400, 404]).toContain(response.status);
      expect(response.body).toHaveProperty('success', false);
    });

    it('should have correct response structure', async () => {
      const response = await request(app)
        .delete('/api/carrito/items/999999')
        .set('x-bypass-auth', 'true');

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('message');
      expect(typeof response.body.success).toBe('boolean');
    });
  });

  describe('POST /api/carrito/checkout', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/carrito/checkout');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
    });

    it('should have correct response structure when authenticated', async () => {
      const response = await request(app)
        .post('/api/carrito/checkout')
        .set('x-bypass-auth', 'true');

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('message');
      expect(typeof response.body.success).toBe('boolean');

      // If successful, should have order data
      if (response.body.success) {
        expect(response.body.data).toHaveProperty('orderId');
        expect(response.body.data).toHaveProperty('subtotal');
        expect(response.body.data).toHaveProperty('totalItems');
      }
    });
  });
});
