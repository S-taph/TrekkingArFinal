import { useState, useEffect, useCallback } from "react"
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Badge,
  Button,
  Chip,
  Divider,
  CircularProgress,
  Alert,
} from "@mui/material"
import {
  Close as CloseIcon,
  Notifications as NotificationsIcon,
  Email as EmailIcon,
  Info as InfoIcon,
  ShoppingBag as OrderIcon,
  EventNote as ReservaIcon,
  DoneAll as DoneAllIcon,
} from "@mui/icons-material"
import { notificacionesAPI } from "../services/api"
import { useAuth } from "../context/AuthContext"
import { io } from "socket.io-client"

// ✅ Usar variable de entorno para Socket.IO
const SOCKET_IO_URL = import.meta.env.VITE_SOCKET_IO_URL || "http://localhost:3003"

// Mapeo de íconos por tipo de notificación
const iconMap = {
  contact_form: <EmailIcon />,
  sistema: <InfoIcon />,
  order: <OrderIcon />,
  reserva: <ReservaIcon />,
}

// Mapeo de colores por prioridad
const priorityColors = {
  baja: "default",
  media: "info",
  alta: "warning",
  urgente: "error",
}

export const NotificationCenter = ({ open, onClose }) => {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [unreadCount, setUnreadCount] = useState(0)

  // Cargar notificaciones desde la API
  const loadNotifications = useCallback(async () => {
    if (!user || user.rol !== "admin") return

    try {
      setLoading(true)
      setError(null)
      const response = await notificacionesAPI.getAdminNotificaciones({
        limit: 50,
      })
      if (response.success) {
        setNotifications(response.data.notificaciones || [])
        setUnreadCount(
          response.data.notificaciones.filter((n) => !n.leido).length,
        )
      }
    } catch (err) {
      console.error("[NotificationCenter] Error cargando notificaciones:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  // Cargar notificaciones al abrir
  useEffect(() => {
    if (open) {
      loadNotifications()
    }
  }, [open, loadNotifications])

  // Configurar Socket.IO para notificaciones en tiempo real
  useEffect(() => {
    if (!user || user.rol !== "admin") return

    const adminSocket = io(`${SOCKET_IO_URL}/admin`, {
      path: "/socket.io",
      withCredentials: true,
      transports: ["websocket", "polling"],
    })

    // Escuchar nuevas notificaciones
    adminSocket.on("new:notification", (notification) => {
      console.log("[NotificationCenter] Nueva notificación recibida:", notification)
      setNotifications((prev) => [notification, ...prev])
      setUnreadCount((prev) => prev + 1)
    })

    adminSocket.on("connect", () => {
      console.log("[NotificationCenter] Socket.IO conectado")
      // Unirse a la sala de administradores si hace falta
      adminSocket.emit("join:admin")
    })

    adminSocket.on("connect_error", (err) => {
      console.error("[NotificationCenter] Error de conexión Socket.IO:", err)
    })

    return () => {
      adminSocket.disconnect()
    }
  }, [user])


  // Marcar notificación como leída
  const markAsRead = async (notificationId) => {
    try {
      await notificacionesAPI.markAsRead(notificationId)
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, leido: true } : n)),
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (err) {
      console.error("[NotificationCenter] Error marcando como leída:", err)
    }
  }

  // Marcar todas como leídas
  const markAllAsRead = async () => {
    try {
      await notificacionesAPI.markAllAsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, leido: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error("[NotificationCenter] Error marcando todas como leídas:", err)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return "Ahora"
    if (diffMins < 60) return `Hace ${diffMins}m`
    if (diffMins < 1440) return `Hace ${Math.floor(diffMins / 60)}h`
    return date.toLocaleDateString()
  }

  // Solo mostrar para admins
  if (!user || user.rol !== "admin") {
    return null
  }

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 450, height: "100%", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <Box
          sx={{
            p: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            bgcolor: "primary.main",
            color: "primary.contrastText",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon />
            </Badge>
            <Typography variant="h6">Notificaciones</Typography>
          </Box>
          <IconButton onClick={onClose} sx={{ color: "inherit" }}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Acciones */}
        {notifications.length > 0 && unreadCount > 0 && (
          <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
            <Button
              size="small"
              startIcon={<DoneAllIcon />}
              onClick={markAllAsRead}
              fullWidth
            >
              Marcar todas como leídas
            </Button>
          </Box>
        )}

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        )}

        {/* Content */}
        <Box sx={{ flex: 1, overflow: "auto" }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : notifications.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4, px: 2 }}>
              <NotificationsIcon
                sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
              />
              <Typography variant="body1" color="text.secondary">
                No hay notificaciones
              </Typography>
            </Box>
          ) : (
            <List sx={{ py: 0 }}>
              {notifications.map((notification, index) => (
                <Box key={notification.id}>
                  <ListItem
                    alignItems="flex-start"
                    sx={{
                      bgcolor: notification.leido ? "transparent" : "action.hover",
                      cursor: "pointer",
                      "&:hover": {
                        bgcolor: "action.selected",
                      },
                    }}
                    onClick={() => !notification.leido && markAsRead(notification.id)}
                  >
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          bgcolor: notification.leido
                            ? "grey.400"
                            : priorityColors[notification.prioridad] + ".main",
                        }}
                      >
                        {iconMap[notification.tipo] || <InfoIcon />}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            mb: 0.5,
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            fontWeight={notification.leido ? 500 : 700}
                          >
                            {notification.titulo || "Notificación"}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(notification.createdAt)}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography
                            variant="body2"
                            color="text.primary"
                            sx={{ mb: 1 }}
                          >
                            {notification.mensaje}
                          </Typography>
                          {notification.from_email && (
                            <Typography variant="caption" color="text.secondary">
                              De: {notification.from_email}
                            </Typography>
                          )}
                          <Box sx={{ mt: 1 }}>
                            <Chip
                              label={notification.tipo.replace("_", " ")}
                              size="small"
                              sx={{ mr: 1 }}
                            />
                            {notification.prioridad !== "media" && (
                              <Chip
                                label={notification.prioridad}
                                size="small"
                                color={priorityColors[notification.prioridad]}
                              />
                            )}
                          </Box>
                        </>
                      }
                    />
                  </ListItem>
                  {index < notifications.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          )}
        </Box>
      </Box>
    </Drawer>
  )
}
