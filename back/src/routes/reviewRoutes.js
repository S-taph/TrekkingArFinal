import express from "express";
import { body, param } from "express-validator";
import {
  getReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
  getReviewStats
} from "../controllers/reviewController.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// Validaciones
const reviewIdValidation = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("ID de review debe ser un número entero positivo")
];

const createReviewValidation = [
  body("nombre")
    .notEmpty()
    .withMessage("El nombre es requerido")
    .isLength({ max: 255 })
    .withMessage("El nombre no puede exceder 255 caracteres"),
  body("ubicacion")
    .optional()
    .isLength({ max: 255 })
    .withMessage("La ubicación no puede exceder 255 caracteres"),
  body("comentario")
    .notEmpty()
    .withMessage("El comentario es requerido"),
  body("rating")
    .isInt({ min: 1, max: 5 })
    .withMessage("El rating debe ser un número entre 1 y 5"),
  body("id_viaje")
    .optional()
    .isInt({ min: 1 })
    .withMessage("ID de viaje debe ser un número entero positivo")
];

const updateReviewValidation = [
  body("nombre")
    .optional()
    .isLength({ max: 255 })
    .withMessage("El nombre no puede exceder 255 caracteres"),
  body("ubicacion")
    .optional()
    .isLength({ max: 255 })
    .withMessage("La ubicación no puede exceder 255 caracteres"),
  body("comentario")
    .optional()
    .notEmpty()
    .withMessage("El comentario no puede estar vacío"),
  body("rating")
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage("El rating debe ser un número entre 1 y 5"),
  body("id_viaje")
    .optional()
    .isInt({ min: 1 })
    .withMessage("ID de viaje debe ser un número entero positivo"),
  body("activo")
    .optional()
    .isBoolean()
    .withMessage("Activo debe ser un valor booleano")
];

// Rutas públicas
router.get("/", getReviews);
router.get("/:id", reviewIdValidation, getReviewById);
router.get("/viaje/:viajeId/stats", param("viajeId").isInt({ min: 1 }), getReviewStats);

// Rutas protegidas (requieren autenticación)
router.post("/", createReviewValidation, createReview);

// Rutas de administración (requieren admin)
router.put("/:id", authenticateToken, requireAdmin, reviewIdValidation, updateReviewValidation, updateReview);
router.delete("/:id", authenticateToken, requireAdmin, reviewIdValidation, deleteReview);

export default router;
