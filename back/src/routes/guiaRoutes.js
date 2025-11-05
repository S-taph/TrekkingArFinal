import express from "express"
import { body, param } from "express-validator"
import {
  getAllGuias,
  getGuiaById,
  createGuia,
  updateGuia,
  debugAllGuias,
  asignarGuiaAViaje,
  getGuiasByFechaViaje,
  updateGuiaAssignment,
  removeGuiaAssignment
} from "../controllers/guiaController.js"
import { authenticateToken, requireRole } from "../middleware/auth.js"

const router = express.Router()

// ✅ Validaciones para crear un guía (campos obligatorios)
const createGuiaValidation = [
  body("id_usuario")
    .isInt({ min: 1 })
    .withMessage("ID de usuario debe ser un número entero positivo"),
  body("certificaciones")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Certificaciones muy largas"),
  body("especialidades")
    .notEmpty()
    .withMessage("Especialidades son requeridas")
    .isLength({ max: 500 })
    .withMessage("Especialidades muy largas"),
  body("anos_experiencia")
    .isInt({ min: 0, max: 50 })
    .withMessage("Años de experiencia debe ser entre 0 y 50"),
  body("idiomas")
    .optional()
    .isLength({ max: 200 })
    .withMessage("Idiomas muy largos"),
  body("tarifa_por_dia")
    .isFloat({ min: 0 })
    .withMessage("Tarifa debe ser un número positivo"),
  body("disponible")
    .optional()
    .isBoolean()
    .withMessage("Disponible debe ser verdadero o falso"),
]

// ✅ Validaciones para actualizar un guía (todos opcionales)
const updateGuiaValidation = [
  body("id_usuario")
    .optional()
    .isInt({ min: 1 })
    .withMessage("ID de usuario debe ser un número entero positivo"),
  body("certificaciones")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Certificaciones muy largas"),
  body("especialidades")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Especialidades muy largas"),
  body("anos_experiencia")
    .optional()
    .isInt({ min: 0, max: 50 })
    .withMessage("Años de experiencia debe ser entre 0 y 50"),
  body("idiomas")
    .optional()
    .isLength({ max: 200 })
    .withMessage("Idiomas muy largos"),
  body("tarifa_por_dia")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Tarifa debe ser un número positivo"),
  body("disponible")
    .optional()
    .isBoolean()
    .withMessage("Disponible debe ser verdadero o falso"),
  body("activo")
    .optional()
    .isBoolean()
    .withMessage("Activo debe ser verdadero o falso"),
]

// ✅ Validación de ID
const idValidation = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("ID debe ser un número entero positivo"),
]

// ✅ Validaciones para asignar guía
const asignarGuiaValidation = [
  body("id_guia")
    .isInt({ min: 1 })
    .withMessage("ID de guía debe ser un número entero positivo"),
  body("id_fecha_viaje")
    .isInt({ min: 1 })
    .withMessage("ID de fecha de viaje debe ser un número entero positivo"),
  body("rol_guia")
    .optional()
    .isIn(["principal", "asistente", "especialista"])
    .withMessage("Rol debe ser: principal, asistente o especialista"),
  body("tarifa_acordada")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Tarifa acordada debe ser un número positivo"),
  body("estado_asignacion")
    .optional()
    .isIn(["asignado", "confirmado", "cancelado"])
    .withMessage("Estado debe ser: asignado, confirmado o cancelado"),
]

// ✅ Validaciones para actualizar asignación
const updateAsignacionValidation = [
  body("rol_guia")
    .optional()
    .isIn(["principal", "asistente", "especialista"])
    .withMessage("Rol debe ser: principal, asistente o especialista"),
  body("tarifa_acordada")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Tarifa acordada debe ser un número positivo"),
  body("estado_asignacion")
    .optional()
    .isIn(["asignado", "confirmado", "cancelado"])
    .withMessage("Estado debe ser: asignado, confirmado o cancelado"),
  body("observaciones")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Observaciones muy largas"),
]

// ✅ Rutas
router.get("/debug/all", debugAllGuias)

// Rutas públicas
router.get("/", getAllGuias)
router.get("/:id", idValidation, getGuiaById)

// Rutas protegidas (solo admin)
router.post("/", authenticateToken, requireRole(["admin"]), createGuiaValidation, createGuia)
router.put("/:id", authenticateToken, requireRole(["admin"]), idValidation, updateGuiaValidation, updateGuia)

// Rutas de asignación de guías a fechas (solo admin)
router.post("/asignar", authenticateToken, requireRole(["admin"]), asignarGuiaValidation, asignarGuiaAViaje)
router.get("/fechas/:fechaId/guias", getGuiasByFechaViaje)
router.put("/asignar/:id", authenticateToken, requireRole(["admin"]), idValidation, updateAsignacionValidation, updateGuiaAssignment)
router.delete("/asignar/:id", authenticateToken, requireRole(["admin"]), idValidation, removeGuiaAssignment)

export default router
