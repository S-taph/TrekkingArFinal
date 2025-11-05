import express from "express"
import { body, param } from "express-validator"
import {
  createReserva,
  getReservasByUser,
  getAllReservas,
  updateReservaStatus,
  cancelReserva,
  syncCuposOcupados,
  diagnosticoCupos,
  resetAllReservas,
} from "../controllers/reservaController.js"
import { authenticateToken, requireRole } from "../middleware/auth.js"

const router = express.Router()

// Validaciones
const reservaValidation = [
  body("id_fecha_viaje").isInt({ min: 1 }).withMessage("ID de fecha de viaje debe ser un número entero positivo"),
  body("cantidad_personas").isInt({ min: 1, max: 20 }).withMessage("Cantidad de personas debe ser entre 1 y 20"),
  body("observaciones_reserva").optional().isLength({ max: 500 }).withMessage("Observaciones muy largas"),
]

const updateStatusValidation = [
  body("estado_reserva")
    .isIn(["pendiente", "confirmada", "cancelada", "completada"])
    .withMessage("Estado de reserva inválido"),
  body("observaciones_reserva").optional().isLength({ max: 500 }).withMessage("Observaciones muy largas"),
]

const idValidation = [param("id").isInt({ min: 1 }).withMessage("ID debe ser un número entero positivo")]

// Rutas protegidas para clientes
router.post("/", authenticateToken, reservaValidation, createReserva)
router.get("/mis-reservas", authenticateToken, getReservasByUser)
router.put("/:id/cancelar", authenticateToken, idValidation, cancelReserva)

// Rutas protegidas para admin
router.get("/", authenticateToken, requireRole(["admin"]), getAllReservas)
router.put(
  "/:id/estado",
  authenticateToken,
  requireRole(["admin"]),
  idValidation,
  updateStatusValidation,
  updateReservaStatus,
)
router.post("/sync-cupos", authenticateToken, requireRole(["admin"]), syncCuposOcupados)
router.get(
  "/diagnostico-cupos/:idFechaViaje",
  authenticateToken,
  requireRole(["admin"]),
  param("idFechaViaje").isInt({ min: 1 }).withMessage("ID de fecha de viaje debe ser un número entero positivo"),
  diagnosticoCupos
)

// ⚠️ RUTA PELIGROSA - Solo para desarrollo/limpieza
router.post("/reset-all", authenticateToken, requireRole(["admin"]), resetAllReservas)

export default router
