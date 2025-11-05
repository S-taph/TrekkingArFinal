/**
 * Contact Routes
 * 
 * Rutas para el manejo de mensajes de contacto y notificaciones.
 * Las rutas de admin requieren autenticación y rol de administrador.
 */

import express from "express";
import { body, param, query } from "express-validator";
import { 
  sendContactMessage, 
  getNotificaciones, 
  markNotificationAsRead, 
  replyToContact,
  getMensajesContacto 
} from "../controllers/contactController.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// Validaciones
const contactMessageValidation = [
  body("nombre")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("El nombre debe tener entre 2 y 100 caracteres"),
  body("email")
    .isEmail()
    .withMessage("Debe ser un email válido")
    .normalizeEmail(),
  body("asunto")
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage("El asunto debe tener entre 5 y 200 caracteres"),
  body("mensaje")
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage("El mensaje debe tener entre 10 y 2000 caracteres")
];

const replyValidation = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("ID de notificación debe ser un número entero positivo"),
  body("respuesta")
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage("La respuesta debe tener entre 10 y 2000 caracteres")
];

const notificationIdValidation = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("ID de notificación debe ser un número entero positivo")
];

// Rutas públicas
router.post("/", contactMessageValidation, sendContactMessage);

// Rutas de administrador (requieren autenticación y rol admin)
router.use(authenticateToken);
router.use(requireAdmin);

// Notificaciones
router.get("/admin/notificaciones", getNotificaciones);
router.put("/admin/notificaciones/:id/read", notificationIdValidation, markNotificationAsRead);
router.post("/admin/notificaciones/:id/reply", replyValidation, replyToContact);

// Mensajes de contacto
router.get("/admin/mensajes", getMensajesContacto);

export default router;
