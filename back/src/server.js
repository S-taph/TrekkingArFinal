// Cargar variables de entorno PRIMERO, antes que cualquier otro módulo
import dotenv from "dotenv"
dotenv.config()

// Ahora sí importar los demás módulos
import express from "express"
import cors from "cors"
import helmet from "helmet"
import rateLimit from "express-rate-limit"
import cookieParser from "cookie-parser"
import session from "express-session"
import { createServer } from "http"
import { Server } from "socket.io"
import jwt from "jsonwebtoken"
import mongoSanitize from "express-mongo-sanitize"
import xss from "xss-clean"

// Importar rutas
import authRoutes from "./routes/authRoutes.js"
import categoriaRoutes from "./routes/categoriaRoutes.js"
import viajeRoutes from "./routes/viajeRoutes.js"
import reservaRoutes from "./routes/reservaRoutes.js"
import guiaRoutes from "./routes/guiaRoutes.js"
import usuarioRoutes from "./routes/usuarioRoutes.js"
import carritoRoutes from "./routes/carritoRoutes.js"
import contactRoutes from "./routes/contactRoutes.js"
import reviewRoutes from "./routes/reviewRoutes.js"
import chatbotRoutes from "./routes/chatbotRoutes.js"
import pagoRoutes from "./routes/pagoRoutes.js"
import auditRoutes from "./routes/auditRoutes.js"
import roleRoutes from "./routes/roleRoutes.js"
import newsletterRoutes from "./routes/newsletterRoutes.js"
import campaniaRoutes from "./routes/campaniaRoutes.js"

// Importar configuración de BD y modelos
import sequelize from "./config/database.js"
import "./models/associations.js"
import seedDatabase from "../scripts/seedDatabase.js"
import { configurePassportGoogle } from "./config/passport.js"

const app = express()
const server = createServer(app)
const PORT = process.env.PORT || 3000

// Configurar CORS dinámico para Socket.IO
const socketCorsOptions = {
  origin: function (origin, callback) {
    // Lista de orígenes permitidos para Socket.IO
    const allowedSocketOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:3003',
      process.env.FRONTEND_URL,
      process.env.BACKEND_URL,
    ].filter(Boolean);

    if (!origin || allowedSocketOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else if (origin.includes('ngrok-free.app') || origin.includes('ngrok.io') || origin.includes('.ngrok-free.dev')) {
      callback(null, true);
    } else {
      callback(new Error('Origen no permitido por CORS en Socket.IO'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST']
};

// Configurar Socket.IO
const io = new Server(server, {
  cors: socketCorsOptions,
  path: process.env.SOCKET_IO_PATH || "/socket.io"
})

// Middleware de autenticación para Socket.IO
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.cookie?.split('token=')[1]?.split(';')[0];
    
    if (!token) {
      return next(new Error('Token de autenticación requerido'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Importar Usuario aquí para evitar dependencias circulares
    const { Usuario } = await import('./models/associations.js');
    const user = await Usuario.findByPk(decoded.id, {
      attributes: { exclude: ['password_hash'] }
    });

    if (!user || !user.activo) {
      return next(new Error('Usuario inválido o inactivo'));
    }

    socket.user = user;
    next();
  } catch (error) {
    console.error('Error autenticando socket:', error);
    next(new Error('Token inválido'));
  }
});

// Configurar namespaces de Socket.IO
const adminNamespace = io.of('/admin');

// Aplicar middleware de autenticación también al namespace admin
adminNamespace.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.cookie?.split('token=')[1]?.split(';')[0];

    if (!token) {
      return next(new Error('Token de autenticación requerido'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { Usuario } = await import('./models/associations.js');
    const user = await Usuario.findByPk(decoded.id, {
      attributes: { exclude: ['password_hash'] }
    });

    if (!user || !user.activo) {
      return next(new Error('Usuario inválido o inactivo'));
    }

    // Verificar que el usuario sea admin
    if (user.rol !== 'admin') {
      return next(new Error('Acceso denegado: se requiere rol de administrador'));
    }

    socket.user = user;
    next();
  } catch (error) {
    console.error('Error autenticando socket admin:', error);
    next(new Error('Token inválido'));
  }
});

adminNamespace.on('connection', (socket) => {
  console.log(`Admin conectado: ${socket.user?.email || 'desconocido'} (${socket.id})`);

  // Unir al usuario al room de administradores
  socket.join('admin');

  socket.on('disconnect', () => {
    console.log(`Admin desconectado: ${socket.user?.email || 'desconocido'}`);
  });
});

// Hacer io disponible en las rutas
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Configurar rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 500, // Aumentado a 500 requests por ventana (era 100, demasiado restrictivo)
  message: {
    success: false,
    message: "Demasiadas solicitudes, intenta de nuevo más tarde",
  },
  // Excluir rutas de lectura comunes que no necesitan limitación estricta
  skip: (req) => {
    const skipPaths = [
      '/api/viajes',
      '/api/categorias',
      '/api/health',
      '/api/reviews',
      '/api/auth/profile'  // Verificación de sesión (necesaria para AuthContext)
    ];
    return skipPaths.some(path => req.path.startsWith(path)) && req.method === 'GET';
  }
})

// Configurar trust proxy para ngrok y otros proxies reversos
app.set('trust proxy', true)

// Configuración avanzada de CORS para soportar múltiples orígenes
// Necesario cuando usamos ngrok para backend pero el frontend sigue en localhost
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:3003',
  process.env.FRONTEND_URL,
  process.env.BACKEND_URL,
].filter(Boolean); // Remover valores undefined/null

// Función para validar origen dinámicamente
const corsOptions = {
  origin: function (origin, callback) {
    // Permitir requests sin origin (como mobile apps, Postman, curl, etc.)
    if (!origin) return callback(null, true);

    // Verificar si el origen está en la lista de permitidos
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    }
    // Permitir dominios de ngrok dinámicamente (para desarrollo)
    else if (origin.includes('ngrok-free.app') || origin.includes('ngrok.io') || origin.includes('.ngrok-free.dev')) {
      console.log(`[CORS] ✅ Permitiendo origen ngrok: ${origin}`);
      callback(null, true);
    }
    // Rechazar otros orígenes
    else {
      console.warn(`[CORS] ❌ Origen bloqueado: ${origin}`);
      callback(new Error('Origen no permitido por CORS'));
    }
  },
  credentials: true, // Permitir envío de cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'x-bypass-auth', 'ngrok-skip-browser-warning'],
  exposedHeaders: ['Set-Cookie'],
  optionsSuccessStatus: 200
};

// Middlewares globales
// Headers de seguridad con Content Security Policy
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://fonts.gstatic.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://sdk.mercadopago.com"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      connectSrc: ["'self'", process.env.BACKEND_URL, "https://api.mercadopago.com", "wss:", "ws:"],
      frameSrc: ["'self'", "https://www.mercadopago.com"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null
    }
  }
}))
app.use(cors(corsOptions)) // CORS configurado dinámicamente
app.use(limiter) // Rate limiting
app.use(cookieParser()) // Agregando middleware de cookie-parser

// Configurar express-session para Passport
app.use(session({
  secret: process.env.JWT_SECRET || 'fallback-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
  }
}))

app.use(express.json({ limit: "10mb" })) // Parse JSON
app.use(express.urlencoded({ extended: true })) // Parse URL-encoded

// Sanitización de input
app.use(mongoSanitize()) // Prevenir NoSQL injection
app.use(xss()) // Prevenir XSS attacks

// Serve static uploads
import path from "path"
import { fileURLToPath } from "url"
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Servir uploads con headers que permitan cross-origin
app.use('/uploads', (req, res, next) => {
  // Permitir uso cruzado de imágenes
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:5173');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
  next();
});
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// Middleware de logging simple
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  next()
})

// Rutas principales
app.use("/api/auth", authRoutes)
app.use("/api/categorias", categoriaRoutes)
app.use("/api/viajes", viajeRoutes)
app.use("/api/reservas", reservaRoutes)
app.use("/api/guias", guiaRoutes)
app.use("/api/usuarios", usuarioRoutes)
app.use("/api/carrito", carritoRoutes)
app.use("/api/reviews", reviewRoutes) // IMPORTANTE: Debe ir ANTES de contactRoutes
app.use("/api/chatbot", chatbotRoutes) // Ruta del chatbot
app.use("/api/contact", contactRoutes) // Corregido: usar /api/contact para coincidir con frontend
app.use("/api/pagos", pagoRoutes) // Rutas de pagos
app.use("/api/audit", auditRoutes) // Rutas de auditoría (solo admin)
app.use("/api/roles", roleRoutes) // Rutas de gestión de roles (solo admin)
app.use("/api/newsletter", newsletterRoutes) // Rutas de newsletter
app.use("/api/campanias", campaniaRoutes) // Rutas de campañas (solo admin)

// Configure Passport Google (después de las rutas para evitar conflictos)
configurePassportGoogle(app)

// Ruta de health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Servidor funcionando correctamente",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
})

// Ruta raíz
app.get("/", (req, res) => {
  res.json({
    message: "🏔️ TrekkingAR API",
    version: "1.0.0",
    docs: "/api/health",
  })
})

// Middleware para rutas no encontradas (solo para rutas API)
app.use("/api/*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Ruta no encontrada",
    path: req.originalUrl,
  })
})

// Middleware de manejo de errores global
app.use((err, req, res, next) => {
  console.error("Error no manejado:", err)

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Error interno del servidor",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
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
      try {
        await sequelize.sync({ alter: false }) // No forzar recreación
        console.log("✅ Modelos sincronizados")
      } catch (error) {
        console.warn("⚠️  Advertencia: No se pudieron sincronizar todos los modelos:", error.message)
        console.log("💡 Ejecuta las migraciones manualmente: npx sequelize-cli db:migrate")
      }
    }

    await seedDatabase()

    // Iniciar servidor
    server.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`)
      console.log(`📡 API disponible en http://localhost:${PORT}`)
      console.log(`🔌 Socket.IO disponible en http://localhost:${PORT}/socket.io`)
      console.log(`🏥 Health check: http://localhost:${PORT}/api/health`)
      console.log(`🌍 Entorno: ${process.env.NODE_ENV || "development"}`)
    })
  } catch (error) {
    console.error("❌ Error al iniciar el servidor:", error)
    process.exit(1)
  }
}

// Manejo de errores no capturados
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason)
  process.exit(1)
})

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error)
  process.exit(1)
})

// Iniciar el servidor
startServer()

export default app
