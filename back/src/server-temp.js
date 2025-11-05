import express from "express"
import cors from "cors"
import helmet from "helmet"
import rateLimit from "express-rate-limit"
import dotenv from "dotenv"

// Importar rutas (sin admin temporalmente)
import authRoutes from "./routes/authRoutes.js"
import categoriaRoutes from "./routes/categoriaRoutes.js"
import viajeRoutes from "./routes/viajeRoutes.js"
import reservaRoutes from "./routes/reservaRoutes.js"
// import adminRoutes from "./routes/adminRoutes.js"

// Importar configuración de BD y modelos
import sequelize from "./config/database.js"
import "./models/associations.js"

// Cargar variables de entorno
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Configurar rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por ventana
  message: {
    success: false,
    message: "Demasiadas solicitudes, intenta de nuevo más tarde",
  },
})

// Middlewares globales
app.use(helmet()) // Headers de seguridad
app.use(cors()) // CORS
app.use(limiter) // Rate limiting
app.use(express.json({ limit: "10mb" })) // Parse JSON
app.use(express.urlencoded({ extended: true })) // Parse URL-encoded

// Middleware de logging simple
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  next()
})

// Rutas principales (sin admin temporalmente)
app.use("/api/auth", authRoutes)
app.use("/api/categorias", categoriaRoutes)
app.use("/api/viajes", viajeRoutes)
app.use("/api/reservas", reservaRoutes)
// app.use("/api/admin", adminRoutes)

// Ruta de health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Servidor funcionando correctamente (modo diagnóstico)",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
})

// Función para iniciar el servidor
const startServer = async () => {
  try {
    // Probar conexión a la base de datos
    await sequelize.authenticate()
    console.log("✅ Conexión a la base de datos establecida correctamente")

    // Sincronizar modelos (solo en desarrollo)
    if (process.env.NODE_ENV === "development") {
      await sequelize.sync({ alter: false }) // No forzar recreación
      console.log("✅ Modelos sincronizados")
    }

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT} (MODO DIAGNÓSTICO)`)
      console.log(`📡 API disponible en http://localhost:${PORT}`)
      console.log(`🏥 Health check: http://localhost:${PORT}/api/health`)
      console.log(`🌍 Entorno: ${process.env.NODE_ENV || "development"}`)
      console.log(`⚠️  RUTAS ADMIN DESHABILITADAS PARA DIAGNÓSTICO`)
    })
  } catch (error) {
    console.error("❌ Error al iniciar el servidor:", error)
    process.exit(1)
  }
}

// Iniciar el servidor
startServer()

export default app
