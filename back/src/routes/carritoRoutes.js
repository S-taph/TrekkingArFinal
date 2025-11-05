/**
 * Carrito Routes
 * 
 * Rutas para el manejo del carrito de compras.
 * Todas las rutas requieren autenticación.
 */

import express from "express";
import { body, param } from "express-validator";
import { getCarrito, addItem, updateItem, removeItem, clearCarrito, checkout } from "../controllers/carritoController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Middleware de autenticación para todas las rutas
router.use(authenticateToken);

// Validaciones
const addItemValidation = [
  body("fechaViajeId")
    .isInt({ min: 1 })
    .withMessage("ID de fecha de viaje debe ser un número entero positivo"),
  body("cantidad")
    .isInt({ min: 1, max: 20 })
    .withMessage("La cantidad debe ser entre 1 y 20")
];

const updateItemValidation = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("ID de item debe ser un número entero positivo"),
  body("cantidad")
    .isInt({ min: 1, max: 20 })
    .withMessage("La cantidad debe ser entre 1 y 20")
];

const removeItemValidation = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("ID de item debe ser un número entero positivo")
];

// Rutas
router.get("/", getCarrito);
router.post("/items", addItemValidation, addItem);
router.put("/items/:id", updateItemValidation, updateItem);
router.delete("/items/:id", removeItemValidation, removeItem);
router.delete("/clear", clearCarrito);
router.post("/checkout", checkout);

export default router;