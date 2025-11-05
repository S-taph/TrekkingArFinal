import express from "express"
import {
  getAuditLogs,
  getAdminAccessLogs,
  getAuditStats,
  getUserAuditLogs,
} from "../controllers/auditController.js"
import { authenticateToken, requireAdmin } from "../middleware/auth.js"

const router = express.Router()

/**
 * Todas las rutas de auditoría requieren autenticación de administrador
 */

// Obtener logs de auditoría con filtros
router.get("/", authenticateToken, requireAdmin, getAuditLogs)

// Obtener logs de accesos administrativos
router.get("/admin-access", authenticateToken, requireAdmin, getAdminAccessLogs)

// Obtener estadísticas de auditoría
router.get("/stats", authenticateToken, requireAdmin, getAuditStats)

// Obtener logs de un usuario específico
router.get("/user/:id_usuario", authenticateToken, requireAdmin, getUserAuditLogs)

export default router
