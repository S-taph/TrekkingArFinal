import express from 'express'
import {
  subscribe,
  unsubscribe,
  getSuscriptores,
  getStats
} from '../controllers/newsletterController.js'
import { authenticateToken, requireAdmin } from '../middleware/auth.js'

const router = express.Router()

// Rutas públicas
router.post('/subscribe', subscribe)
router.get('/unsubscribe/:token', unsubscribe)

// Rutas protegidas (solo admin)
router.get('/suscriptores', authenticateToken, requireAdmin, getSuscriptores)
router.get('/stats', authenticateToken, requireAdmin, getStats)

export default router
