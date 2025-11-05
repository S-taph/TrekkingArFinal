import express from "express";
import { param, body } from "express-validator";
import {
  getFechasByViaje,
  createFechaViaje,
  updateFechaViaje,
  deleteFechaViaje
} from "../controllers/fechaViajeController.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";

const router = express.Router({ mergeParams: true }); // mergeParams para heredar :viajeId

// Validaciones
const viajeIdValidation = [
  param("viajeId")
    .isInt({ min: 1 })
    .withMessage("ID de viaje debe ser un número entero positivo")
];

const fechaIdValidation = [
  param("viajeId")
    .isInt({ min: 1 })
    .withMessage("ID de viaje debe ser un número entero positivo"),
  param("fechaId")
    .isInt({ min: 1 })
    .withMessage("ID de fecha debe ser un número entero positivo")
];

const createFechaValidation = [
  body("fecha_inicio")
    .notEmpty()
    .withMessage("La fecha de inicio es requerida")
    .isDate({ format: 'YYYY-MM-DD', strictMode: false })
    .withMessage("La fecha de inicio debe ser válida (formato: YYYY-MM-DD)"),
  body("fecha_fin")
    .notEmpty()
    .withMessage("La fecha de fin es requerida")
    .isDate({ format: 'YYYY-MM-DD', strictMode: false })
    .withMessage("La fecha de fin debe ser válida (formato: YYYY-MM-DD)"),
  body("cupos_disponibles")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Los cupos disponibles deben ser al menos 1"),
  body("precio_fecha")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("El precio debe ser mayor o igual a 0")
];

// Ruta pública para obtener fechas de un viaje
router.get("/", viajeIdValidation, getFechasByViaje);

// Rutas de administración
router.use(authenticateToken);
router.use(requireAdmin);

// CRUD de fechas de viaje
router.post("/", viajeIdValidation, createFechaValidation, createFechaViaje);
router.put("/:fechaId", fechaIdValidation, updateFechaViaje);
router.delete("/:fechaId", fechaIdValidation, deleteFechaViaje);

export default router;
