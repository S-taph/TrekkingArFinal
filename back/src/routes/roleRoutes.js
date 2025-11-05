import express from "express"
import {
  getUserRoles,
  assignRole,
  removeRole,
  promoteToGuia,
  promoteToAdmin,
} from "../controllers/roleController.js"
import { authenticateToken, requireAdmin } from "../middleware/auth.js"

const router = express.Router()

/**
 * Todas las rutas requieren autenticación de administrador
 */

// Obtener roles de un usuario
router.get("/user/:id_usuario", authenticateToken, requireAdmin, getUserRoles)

// Asignar un rol a un usuario
router.post("/user/:id_usuario/assign", authenticateToken, requireAdmin, assignRole)

// Remover un rol de un usuario
router.post("/user/:id_usuario/remove", authenticateToken, requireAdmin, removeRole)

// Promover un usuario a guía
router.post("/user/:id_usuario/promote-guia", authenticateToken, requireAdmin, promoteToGuia)

// Promover un usuario a administrador
router.post("/user/:id_usuario/promote-admin", authenticateToken, requireAdmin, promoteToAdmin)

export default router
