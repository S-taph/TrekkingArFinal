import { useState, useEffect } from "react"
import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  Grid,
  Divider,
  Alert,
  IconButton,
  Stack,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
} from "@mui/material"
import {
  PhotoCamera,
  Save,
  Luggage,
  CalendarMonth,
  TrendingUp,
  Lock,
  Visibility,
  VisibilityOff,
  CheckCircle,
} from "@mui/icons-material"
import Header from "../components/Header"
import Footer from "../components/Footer"
import { useAuth } from "../context/AuthContext"
import { usuariosAPI, reservasAPI } from "../services/api"
import { buildImageUrl, handleImageError } from "../utils/imageUrl"

/**
 * ProfilePage - Página de perfil de usuario mejorada
 * ✅ Conectado con backend real
 * ✅ Incluye estadísticas, cambio de contraseña y reservas recientes
 */
export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const [activeTab, setActiveTab] = useState(0)

  // Estados para perfil
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    dni: "",
    contacto_emergencia: "",
    telefono_emergencia: "",
    experiencia_previa: "",
  })
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)

  // Estados para cambio de contraseña
  const [passwordDialog, setPasswordDialog] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const [passwordError, setPasswordError] = useState(null)
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  // Estados para estadísticas
  const [stats, setStats] = useState({
    totalReservas: 0,
    reservasPendientes: 0,
    reservasCompletadas: 0,
    proximosViajes: 0,
  })
  const [recentReservas, setRecentReservas] = useState([])
  const [loadingStats, setLoadingStats] = useState(true)

  // Cargar datos del usuario y estadísticas
  useEffect(() => {
    document.title = "Mi Perfil - TrekkingAR"
    if (user) {
      setFormData({
        nombre: user.nombre || "",
        apellido: user.apellido || "",
        email: user.email || "",
        telefono: user.telefono || "",
        dni: user.dni ? String(user.dni) : "",
        contacto_emergencia: user.contacto_emergencia || "",
        telefono_emergencia: user.telefono_emergencia || "",
        experiencia_previa: user.experiencia_previa || "",
      })
      loadUserStats()
    }
  }, [user])

  // Cargar estadísticas del usuario
  const loadUserStats = async () => {
    try {
      setLoadingStats(true)
      const response = await reservasAPI.getMisReservas()

      if (response.success) {
        const reservas = Array.isArray(response.data?.reservas) ? response.data.reservas : []

        // Calcular estadísticas
        const totalReservas = reservas.length
        const reservasPendientes = reservas.filter(r => r.estado_reserva === "pendiente").length
        const reservasCompletadas = reservas.filter(r => r.estado_reserva === "confirmada").length

        // Contar próximos viajes (reservas confirmadas con fecha futura)
        const now = new Date()
        const proximosViajes = reservas.filter(r => {
          if (r.estado_reserva !== "confirmada") return false
          const fechaViaje = new Date(r.fecha_viaje?.fecha_inicio || r.fecha_reserva)
          return fechaViaje > now
        }).length

        setStats({
          totalReservas,
          reservasPendientes,
          reservasCompletadas,
          proximosViajes,
        })

        // Guardar las 3 reservas más recientes
        setRecentReservas(reservas.slice(0, 3))
      }
    } catch (error) {
      console.error("Error cargando estadísticas:", error)
    } finally {
      setLoadingStats(false)
    }
  }

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setSuccess(false)
    setError(null)

    // Validación del DNI si está presente
    if (formData.dni !== undefined && formData.dni !== null && formData.dni !== "") {
      // Convertir a string para validación
      const dniStr = String(formData.dni).trim()

      if (dniStr !== "") {
        // Validar que sea solo números
        if (!/^\d+$/.test(dniStr)) {
          setError("El DNI debe contener solo números")
          setSaving(false)
          return
        }
        // Validar longitud (DNI argentino: 7-8 dígitos)
        if (dniStr.length < 7 || dniStr.length > 8) {
          setError("El DNI debe tener entre 7 y 8 dígitos")
          setSaving(false)
          return
        }
      }
    }

    try {
      // ✅ Conectado con PUT /api/usuarios/:id
      const response = await usuariosAPI.updateUsuario(user.id_usuarios, formData)

      if (response.success) {
        // Si hay un avatar nuevo, subirlo
        if (avatarFile) {
          const avatarResponse = await usuariosAPI.uploadAvatar(user.id_usuarios, avatarFile)
          if (avatarResponse.success) {
            // Actualizar el contexto con el nuevo avatar
            updateUser({ ...user, ...formData, avatar: avatarResponse.data.avatarUrl })
          }
        } else {
          // Solo actualizar los datos del usuario
          updateUser({ ...user, ...formData })
        }

        setSuccess(true)
        setAvatarFile(null)
        setAvatarPreview(null)
      }
    } catch (error) {
      console.error("Error guardando perfil:", error)
      // Mostrar el mensaje de error del servidor (ya procesado por apiRequest)
      setError(error.message || "Error al guardar los cambios")
    } finally {
      setSaving(false)
    }
  }

  // Manejo de cambio de contraseña
  const handlePasswordChange = async () => {
    setPasswordError(null)
    setPasswordSuccess(false)

    // Validaciones
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError("Todos los campos son obligatorios")
      return
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError("La nueva contraseña debe tener al menos 6 caracteres")
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("Las contraseñas no coinciden")
      return
    }

    try {
      const response = await usuariosAPI.changePassword(user.id_usuarios, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      })

      if (response.success) {
        setPasswordSuccess(true)
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
        setTimeout(() => {
          setPasswordDialog(false)
          setPasswordSuccess(false)
        }, 2000)
      }
    } catch (error) {
      console.error("Error cambiando contraseña:", error)
      setPasswordError(error.message || "Error al cambiar la contraseña")
    }
  }

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }))
  }

  // Función para formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  // Función para obtener color del estado
  const getEstadoColor = (estado) => {
    switch (estado) {
      case "confirmada":
        return "success"
      case "pendiente":
        return "warning"
      case "cancelada":
        return "error"
      default:
        return "default"
    }
  }

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      <Header />

      <Container maxWidth="lg" sx={{ pt: 12, pb: 4 }}>
        {/* Header con avatar y datos básicos */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item>
              <Box sx={{ position: "relative" }}>
                <Avatar
                  src={avatarPreview || user?.avatar}
                  sx={{ width: 100, height: 100 }}
                >
                  {user?.nombre?.charAt(0)}
                </Avatar>
                <IconButton
                  component="label"
                  sx={{
                    position: "absolute",
                    bottom: -5,
                    right: -5,
                    bgcolor: "primary.main",
                    color: "white",
                    "&:hover": { bgcolor: "primary.dark" },
                    width: 36,
                    height: 36,
                  }}
                >
                  <PhotoCamera fontSize="small" />
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                </IconButton>
              </Box>
            </Grid>
            <Grid item xs>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {user?.nombre} {user?.apellido}
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                {user?.email}
              </Typography>
              <Chip
                label={user?.rol === "admin" ? "Administrador" : "Usuario"}
                color={user?.rol === "admin" ? "primary" : "default"}
                size="small"
                sx={{ mt: 1 }}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Estadísticas */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                bgcolor: "#2C3E50",
                background: "linear-gradient(135deg, #2C3E50 0%, #34495E 100%)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: "#fff" }}>
                      {stats.totalReservas}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5, color: "#ECF0F1" }}>
                      Total Reservas
                    </Typography>
                  </Box>
                  <Luggage sx={{ fontSize: 48, opacity: 0.25, color: "#fff" }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                bgcolor: "#D68910",
                background: "linear-gradient(135deg, #D68910 0%, #E59400 100%)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: "#fff" }}>
                      {stats.reservasPendientes}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5, color: "#FFF8E7" }}>
                      Pendientes
                    </Typography>
                  </Box>
                  <CalendarMonth sx={{ fontSize: 48, opacity: 0.25, color: "#fff" }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                bgcolor: "#1B5E20",
                background: "linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: "#fff" }}>
                      {stats.reservasCompletadas}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5, color: "#E8F5E9" }}>
                      Completadas
                    </Typography>
                  </Box>
                  <CheckCircle sx={{ fontSize: 48, opacity: 0.25, color: "#fff" }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                bgcolor: "#8B4513",
                background: "linear-gradient(135deg, #8B4513 0%, #A0522D 100%)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: "#fff" }}>
                      {stats.proximosViajes}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5, color: "#FFF5EE" }}>
                      Próximos Viajes
                    </Typography>
                  </Box>
                  <TrendingUp sx={{ fontSize: 48, opacity: 0.25, color: "#fff" }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs de contenido */}
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{ borderBottom: 1, borderColor: "divider" }}
          >
            <Tab label="Información Personal" />
            <Tab label="Reservas Recientes" />
          </Tabs>

          {/* Tab 1: Información Personal */}
          {activeTab === 0 && (
            <Box sx={{ p: 3 }}>
              {success && (
                <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(false)}>
                  Perfil actualizado correctamente
                </Alert>
              )}

              {error && (
                <Alert severity="error" sx={{ mb: 3, whiteSpace: 'pre-line' }} onClose={() => setError(null)}>
                  {error}
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Nombre"
                      value={formData.nombre}
                      onChange={(e) => handleChange("nombre", e.target.value)}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Apellido"
                      value={formData.apellido}
                      onChange={(e) => handleChange("apellido", e.target.value)}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Teléfono"
                      value={formData.telefono}
                      onChange={(e) => handleChange("telefono", e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="DNI"
                      value={formData.dni}
                      onChange={(e) => handleChange("dni", e.target.value)}
                      helperText="Ingrese 7 u 8 dígitos sin puntos ni espacios"
                      inputProps={{ maxLength: 8 }}
                    />
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }}>
                  <Chip label="Información de Emergencia" />
                </Divider>

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Contacto de Emergencia"
                      value={formData.contacto_emergencia}
                      onChange={(e) => handleChange("contacto_emergencia", e.target.value)}
                      helperText="Nombre de la persona a contactar en caso de emergencia"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Teléfono de Emergencia"
                      value={formData.telefono_emergencia}
                      onChange={(e) => handleChange("telefono_emergencia", e.target.value)}
                      helperText="Número de contacto de emergencia"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Experiencia Previa en Trekking"
                      value={formData.experiencia_previa}
                      onChange={(e) => handleChange("experiencia_previa", e.target.value)}
                      helperText="Describa su experiencia previa en trekking o actividades similares (opcional)"
                    />
                  </Grid>
                </Grid>

                <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    startIcon={<Save />}
                    disabled={saving}
                  >
                    {saving ? "Guardando..." : "Guardar Cambios"}
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<Lock />}
                    onClick={() => setPasswordDialog(true)}
                  >
                    Cambiar Contraseña
                  </Button>
                </Stack>
              </form>
            </Box>
          )}

          {/* Tab 2: Reservas Recientes */}
          {activeTab === 1 && (
            <Box sx={{ p: 3 }}>
              {loadingStats ? (
                <Typography>Cargando reservas...</Typography>
              ) : recentReservas.length === 0 ? (
                <Typography color="text.secondary">
                  No tienes reservas recientes
                </Typography>
              ) : (
                <Stack spacing={2}>
                  {recentReservas.map((reserva) => (
                    <Card key={reserva.id_reserva} variant="outlined" sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' } }}>
                      {reserva.fecha_viaje?.viaje?.imagen_principal_url && (
                        <CardMedia
                          component="img"
                          sx={{
                            width: { xs: '100%', sm: 140 },
                            height: { xs: 180, sm: 140 },
                            objectFit: 'cover'
                          }}
                          image={buildImageUrl(
                            reserva.fecha_viaje.viaje.imagen_principal_url,
                            reserva.fecha_viaje.viaje.id_viaje
                          )}
                          alt={reserva.fecha_viaje.viaje.titulo}
                          onError={handleImageError}
                        />
                      )}
                      <CardContent sx={{ flex: 1 }}>
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={12} md={6}>
                            <Typography variant="h6">
                              {reserva.fecha_viaje?.viaje?.titulo || "Viaje"}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Fecha: {formatDate(reserva.fecha_viaje?.fecha_inicio || reserva.fecha_reserva)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Pasajeros: {reserva.cantidad_personas || 1}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <Typography variant="h6" color="primary.main">
                              ${Number(reserva.subtotal_reserva || reserva.compra?.total_compra || 0).toFixed(2)}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <Chip
                              label={reserva.estado_reserva || "pendiente"}
                              color={getEstadoColor(reserva.estado_reserva)}
                              sx={{ textTransform: "capitalize" }}
                            />
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  ))}
                  <Button variant="text" href="/mis-reservas">
                    Ver todas las reservas
                  </Button>
                </Stack>
              )}
            </Box>
          )}
        </Paper>
      </Container>

      {/* Dialog para cambiar contraseña */}
      <Dialog open={passwordDialog} onClose={() => setPasswordDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Cambiar Contraseña</DialogTitle>
        <DialogContent>
          {passwordSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Contraseña cambiada correctamente
            </Alert>
          )}
          {passwordError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {passwordError}
            </Alert>
          )}

          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Contraseña Actual"
              type={showPasswords.current ? "text" : "password"}
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => togglePasswordVisibility("current")} edge="end">
                      {showPasswords.current ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Nueva Contraseña"
              type={showPasswords.new ? "text" : "password"}
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => togglePasswordVisibility("new")} edge="end">
                      {showPasswords.new ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Confirmar Nueva Contraseña"
              type={showPasswords.confirm ? "text" : "password"}
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => togglePasswordVisibility("confirm")} edge="end">
                      {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialog(false)}>Cancelar</Button>
          <Button onClick={handlePasswordChange} variant="contained">
            Cambiar Contraseña
          </Button>
        </DialogActions>
      </Dialog>

      <Footer />
    </Box>
  )
}
