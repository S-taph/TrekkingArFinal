import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Alert,
  Snackbar,
  CircularProgress,
  Stack,
  Divider,
} from "@mui/material"
import {
  Send as SendIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  WhatsApp as WhatsAppIcon,
} from "@mui/icons-material"
import Header from "../components/Header"
import Footer from "../components/Footer"
import { contactoAPI } from "../services/api"

/**
 * ContactoPage - Página de contacto con formulario
 * Envía emails a todos los administradores
 */
export default function ContactoPage() {
  const [searchParams] = useSearchParams()

  // Leer parámetros de la URL
  const tripId = searchParams.get('tripId')
  const tripName = searchParams.get('tripName')

  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    asunto: tripName ? `Consulta sobre: ${tripName}` : "",
    mensaje: "",
    tripId: tripId || "", // Campo oculto para futuras referencias en BD
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    document.title = "Contacto - TrekkingAR"
  }, [])

  // Actualizar asunto si cambian los parámetros de URL
  useEffect(() => {
    if (tripName) {
      setFormData(prev => ({
        ...prev,
        asunto: `Consulta sobre: ${tripName}`,
        tripId: tripId || ""
      }))
    }
  }, [tripName, tripId])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Preparar datos para enviar (incluye tripId si existe)
      const dataToSend = {
        nombre: formData.nombre,
        email: formData.email,
        telefono: formData.telefono,
        asunto: formData.asunto,
        mensaje: formData.tripId
          ? `[ID Viaje: ${formData.tripId}]\n\n${formData.mensaje}`
          : formData.mensaje,
      }

      const response = await contactoAPI.sendMessage(dataToSend)

      if (response.success) {
        setSuccess(true)
        // Limpiar formulario
        setFormData({
          nombre: "",
          email: "",
          telefono: "",
          asunto: "",
          mensaje: "",
          tripId: "",
        })
      } else {
        throw new Error(response.message || "Error al enviar el mensaje")
      }
    } catch (err) {
      console.error("[ContactoPage] Error:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const contactInfo = [
    {
      icon: <EmailIcon sx={{ fontSize: 40 }} />,
      title: "Email",
      value: "info@trekkingar.com",
      link: "mailto:info@trekkingar.com",
    },
    {
      icon: <PhoneIcon sx={{ fontSize: 40 }} />,
      title: "Teléfono",
      value: "+54 294 442-8765",
      link: "tel:+542944428765",
    },
    {
      icon: <WhatsAppIcon sx={{ fontSize: 40 }} />,
      title: "WhatsApp",
      value: "+54 9 294 442-8765",
      link: "https://wa.me/5492944428765",
    },
    {
      icon: <LocationIcon sx={{ fontSize: 40 }} />,
      title: "Dirección",
      value: "San Carlos de Bariloche, Río Negro, Argentina",
      link: null,
    },
  ]

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      <Header />

      {/* Hero Section */}
      <Box
        sx={{
          position: "relative",
          height: "300px",
          backgroundImage: "linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('/contact-bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mt: 8,
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            sx={{
              color: "white",
              fontWeight: 800,
              textAlign: "center",
              textTransform: "uppercase",
              letterSpacing: 3,
              textShadow: "0 4px 8px rgba(0,0,0,0.5)",
            }}
          >
            Contáctanos
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: "white",
              textAlign: "center",
              mt: 2,
              textShadow: "0 2px 4px rgba(0,0,0,0.5)",
            }}
          >
            Estamos aquí para ayudarte a planificar tu próxima aventura
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={6}>
          {/* Formulario de Contacto */}
          <Grid item xs={12} md={7}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
                Envíanos un Mensaje
              </Typography>

              {/* Indicador si viene de un viaje */}
              {tripName && (
                <Alert severity="info" sx={{ mb: 3 }}>
                  Consulta sobre el viaje: <strong>{tripName}</strong>
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    required
                    label="Nombre Completo"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    variant="outlined"
                  />

                  <TextField
                    fullWidth
                    required
                    type="email"
                    label="Email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    variant="outlined"
                  />

                  <TextField
                    fullWidth
                    label="Teléfono (opcional)"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    variant="outlined"
                  />

                  <TextField
                    fullWidth
                    required
                    label="Asunto"
                    name="asunto"
                    value={formData.asunto}
                    onChange={handleChange}
                    variant="outlined"
                  />

                  <TextField
                    fullWidth
                    required
                    multiline
                    rows={6}
                    label="Mensaje"
                    name="mensaje"
                    value={formData.mensaje}
                    onChange={handleChange}
                    variant="outlined"
                    helperText="Cuéntanos sobre tu consulta o el viaje que te interesa"
                  />

                  {error && (
                    <Alert severity="error" onClose={() => setError(null)}>
                      {error}
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
                    sx={{
                      py: 1.5,
                      fontSize: "1.1rem",
                      fontWeight: 600,
                      bgcolor: "success.main",
                      "&:hover": {
                        bgcolor: "success.dark",
                      },
                    }}
                  >
                    {loading ? "Enviando..." : "Enviar Mensaje"}
                  </Button>
                </Stack>
              </form>
            </Paper>
          </Grid>

          {/* Información de Contacto */}
          <Grid item xs={12} md={5}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 3, mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
                Información de Contacto
              </Typography>

              <Stack spacing={3}>
                {contactInfo.map((info, index) => (
                  <Box key={index}>
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                      <Box sx={{ color: "primary.main", flexShrink: 0 }}>
                        {info.icon}
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, color: "text.primary" }}>
                          {info.title}
                        </Typography>
                        {info.link ? (
                          <Typography
                            component="a"
                            href={info.link}
                            target={info.link.startsWith("http") ? "_blank" : undefined}
                            rel={info.link.startsWith("http") ? "noopener noreferrer" : undefined}
                            sx={{
                              color: "text.primary",
                              textDecoration: "none",
                              fontWeight: 500,
                              "&:hover": {
                                color: "primary.main",
                                textDecoration: "underline",
                              },
                            }}
                          >
                            {info.value}
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="text.primary" sx={{ fontWeight: 500 }}>
                            {info.value}
                          </Typography>
                        )}
                      </Box>
                    </Stack>
                    {index < contactInfo.length - 1 && <Divider sx={{ mt: 2 }} />}
                  </Box>
                ))}
              </Stack>
            </Paper>

            {/* Horarios */}
            <Paper
              elevation={3}
              sx={{
                p: 4,
                borderRadius: 3,
                bgcolor: "primary.main",
                color: "primary.contrastText"
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: "primary.contrastText" }}>
                Horarios de Atención
              </Typography>
              <Stack spacing={1}>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" sx={{ color: "primary.contrastText" }}>Lunes a Viernes:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: "primary.contrastText" }}>
                    9:00 - 18:00
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" sx={{ color: "primary.contrastText" }}>Sábados:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: "primary.contrastText" }}>
                    9:00 - 13:00
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" sx={{ color: "primary.contrastText" }}>Domingos:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: "primary.contrastText" }}>
                    Cerrado
                  </Typography>
                </Box>
              </Stack>
              <Divider sx={{ my: 2, bgcolor: (theme) => theme.palette.mode === 'dark' ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.5)" }} />
              <Typography variant="body2" sx={{ fontStyle: "italic", color: "primary.contrastText", fontWeight: 500 }}>
                * Respondemos consultas por WhatsApp 24/7
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Snackbar de éxito */}
      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setSuccess(false)} severity="success" sx={{ width: "100%" }}>
          ¡Mensaje enviado exitosamente! Te responderemos pronto.
        </Alert>
      </Snackbar>

      <Footer />
    </Box>
  )
}
