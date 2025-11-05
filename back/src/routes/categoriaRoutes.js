import express from "express"
import { body, param } from "express-validator"
import {
  getAllCategorias,
  getCategoriaById,
  createCategoria,
  updateCategoria,
  deleteCategoria,
} from "../controllers/categoriaController.js"
import { authenticateToken, requireRole } from "../middleware/auth.js"

const router = express.Router()

// Validaciones
const categoriaValidation = [
  body("nombre").trim().isLength({ min: 2, max: 100 }).withMessage("El nombre debe tener entre 2 y 100 caracteres"),
  body("descripcion").optional().isLength({ max: 1000 }).withMessage("Descripción muy larga"),
  body("orden_visualizacion").optional().isInt({ min: 0 }).withMessage("Orden debe ser un número entero positivo"),
]

const idValidation = [param("id").isInt({ min: 1 }).withMessage("ID debe ser un número entero positivo")]

// Rutas públicas
router.get("/", getAllCategorias)
router.get("/:id", idValidation, getCategoriaById)

// Rutas protegidas (solo admin)
router.post("/", authenticateToken, requireRole(["admin"]), categoriaValidation, createCategoria)
router.put("/:id", authenticateToken, requireRole(["admin"]), idValidation, categoriaValidation, updateCategoria)
router.delete("/:id", authenticateToken, requireRole(["admin"]), idValidation, deleteCategoria)

export default router
