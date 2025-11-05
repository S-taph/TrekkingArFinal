import express from 'express'
import { getUsuarios, getUsuarioById, updateUsuario, uploadAvatar, changePassword } from '../controllers/usuarioController.js'
import { authenticateToken, requireRole } from '../middleware/auth.js'
import { upload } from '../config/multer.js'

const router = express.Router()

// Rutas públicas o protegidas
router.get('/', authenticateToken, requireRole(['admin']), getUsuarios)
router.get('/:id', authenticateToken, getUsuarioById)
// Permitir que usuarios actualicen su propio perfil (se valida en el controlador)
router.put('/:id', authenticateToken, updateUsuario)
router.post('/:id/avatar', authenticateToken, upload.single('avatar'), uploadAvatar)
router.put('/:id/change-password', authenticateToken, changePassword)

export default router