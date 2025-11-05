import express from 'express'
import {
  getCampanias,
  getCampaniaById,
  createCampania,
  updateCampania,
  deleteCampania,
  sendCampania,
  getCampaniaStats
} from '../controllers/campaniaController.js'
import { authenticateToken, requireAdmin } from '../middleware/auth.js'

const router = express.Router()

// Todas las rutas requieren autenticación de admin
router.use(authenticateToken, requireAdmin)

router.get('/', getCampanias)
router.get('/:id', getCampaniaById)
router.post('/', createCampania)
router.put('/:id', updateCampania)
router.delete('/:id', deleteCampania)
router.post('/:id/send', sendCampania)
router.get('/:id/stats', getCampaniaStats)

export default router
