import { useState } from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Container from "@mui/material/Container"
import Grid from "@mui/material/Grid"
import Link from "@mui/material/Link"
import IconButton from "@mui/material/IconButton"
import TextField from "@mui/material/TextField"
import Button from "@mui/material/Button"
import Snackbar from "@mui/material/Snackbar"
import Alert from "@mui/material/Alert"
import FacebookIcon from "@mui/icons-material/Facebook"
import InstagramIcon from "@mui/icons-material/Instagram"
import TwitterIcon from "@mui/icons-material/Twitter"
import YouTubeIcon from "@mui/icons-material/YouTube"
import EmailIcon from "@mui/icons-material/Email"
import PhoneIcon from "@mui/icons-material/Phone"
import LocationOnIcon from "@mui/icons-material/LocationOn"
import HikingIcon from "@mui/icons-material/Hiking"
import { newsletterAPI } from "../services/api"

/**
 * Footer - Diseño moderno de 4 columnas con fondo negro
 * Inspirado en la estética de hoynoduermoviajes.com.ar
 */
const Footer = () => {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  })

  const handleSubscribe = async () => {
    if (!email) {
      setSnackbar({
        open: true,
        message: "Por favor ingresa tu email",
        severity: "warning"
      })
      return
    }

    // Validación básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setSnackbar({
        open: true,
        message: "Por favor ingresa un email válido",
        severity: "error"
      })
      return
    }

    setLoading(true)

    try {
      const response = await newsletterAPI.subscribe(email)

      setSnackbar({
        open: true,
        message: response.message || "¡Gracias por suscribirte! Recibirás nuestras novedades en tu email",
        severity: "success"
      })

      setEmail("") // Limpiar campo
    } catch (error) {
      console.error("Error suscribiendo:", error)
      setSnackbar({
        open: true,
        message: error.message || "Error al procesar la suscripción. Intenta de nuevo.",
        severity: "error"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false })
  }

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: "#000000", // Negro sólido
        color: "#FFFFFF",
        py: 6,
        mt: "auto",
        borderTop: "1px solid #1A1A1A",
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Columna 1: Logo y Contacto */}
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <HikingIcon sx={{ fontSize: 32, color: "#A4D65E" }} />
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color: "#FFFFFF",
                  }}
                >
                  TrekkingAR
                </Typography>
              </Box>
              <Typography
                variant="body2"
                sx={{
                  color: "#B0B0B0",
                  lineHeight: 1.7,
                  mb: 2,
                }}
              >
                Explora los paisajes más increíbles de Argentina con nuestros tours de aventura.
              </Typography>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <LocationOnIcon sx={{ fontSize: 18, color: "#A4D65E" }} />
                <Typography variant="body2" sx={{ color: "#B0B0B0", fontSize: "0.875rem" }}>
                  Av. San Martín 1234, Bariloche
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <EmailIcon sx={{ fontSize: 18, color: "#A4D65E" }} />
                <Typography variant="body2" sx={{ color: "#B0B0B0", fontSize: "0.875rem" }}>
                  info@trekking-ar.com
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <PhoneIcon sx={{ fontSize: 18, color: "#A4D65E" }} />
                <Typography variant="body2" sx={{ color: "#B0B0B0", fontSize: "0.875rem" }}>
                  +54 294 442-8765
                </Typography>
              </Box>
            </Box>

            {/* Redes Sociales */}
            <Box sx={{ display: "flex", gap: 1, mt: 3 }}>
              <IconButton
                size="small"
                sx={{
                  color: "#B0B0B0",
                  border: "1px solid #2A2A2A",
                  "&:hover": {
                    color: "#A4D65E",
                    borderColor: "#A4D65E",
                    bgcolor: "rgba(164, 214, 94, 0.05)",
                  },
                }}
              >
                <FacebookIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                sx={{
                  color: "#B0B0B0",
                  border: "1px solid #2A2A2A",
                  "&:hover": {
                    color: "#A4D65E",
                    borderColor: "#A4D65E",
                    bgcolor: "rgba(164, 214, 94, 0.05)",
                  },
                }}
              >
                <InstagramIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                sx={{
                  color: "#B0B0B0",
                  border: "1px solid #2A2A2A",
                  "&:hover": {
                    color: "#A4D65E",
                    borderColor: "#A4D65E",
                    bgcolor: "rgba(164, 214, 94, 0.05)",
                  },
                }}
              >
                <TwitterIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                sx={{
                  color: "#B0B0B0",
                  border: "1px solid #2A2A2A",
                  "&:hover": {
                    color: "#A4D65E",
                    borderColor: "#A4D65E",
                    bgcolor: "rgba(164, 214, 94, 0.05)",
                  },
                }}
              >
                <YouTubeIcon fontSize="small" />
              </IconButton>
            </Box>
          </Grid>

          {/* Columna 2: Información */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                mb: 2,
                color: "#FFFFFF",
                fontSize: "0.875rem",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              INFORMACIÓN
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Link
                href="#"
                underline="none"
                sx={{
                  color: "#B0B0B0",
                  fontSize: "0.875rem",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    color: "#A4D65E",
                    paddingLeft: "8px",
                  },
                }}
              >
                Mi Cuenta
              </Link>
              <Link
                href="#"
                underline="none"
                sx={{
                  color: "#B0B0B0",
                  fontSize: "0.875rem",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    color: "#A4D65E",
                    paddingLeft: "8px",
                  },
                }}
              >
                Preguntas Frecuentes
              </Link>
              <Link
                href="#"
                underline="none"
                sx={{
                  color: "#B0B0B0",
                  fontSize: "0.875rem",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    color: "#A4D65E",
                    paddingLeft: "8px",
                  },
                }}
              >
                Quiénes Somos
              </Link>
              <Link
                href="#"
                underline="none"
                sx={{
                  color: "#B0B0B0",
                  fontSize: "0.875rem",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    color: "#A4D65E",
                    paddingLeft: "8px",
                  },
                }}
              >
                Nuestros Guías
              </Link>
              <Link
                href="#"
                underline="none"
                sx={{
                  color: "#B0B0B0",
                  fontSize: "0.875rem",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    color: "#A4D65E",
                    paddingLeft: "8px",
                  },
                }}
              >
                Galería
              </Link>
            </Box>
          </Grid>

          {/* Columna 3: Legal */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                mb: 2,
                color: "#FFFFFF",
                fontSize: "0.875rem",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              LEGAL
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Link
                href="#"
                underline="none"
                sx={{
                  color: "#B0B0B0",
                  fontSize: "0.875rem",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    color: "#A4D65E",
                    paddingLeft: "8px",
                  },
                }}
              >
                Términos y Condiciones
              </Link>
              <Link
                href="#"
                underline="none"
                sx={{
                  color: "#B0B0B0",
                  fontSize: "0.875rem",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    color: "#A4D65E",
                    paddingLeft: "8px",
                  },
                }}
              >
                Política de Privacidad
              </Link>
              <Link
                href="#"
                underline="none"
                sx={{
                  color: "#B0B0B0",
                  fontSize: "0.875rem",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    color: "#A4D65E",
                    paddingLeft: "8px",
                  },
                }}
              >
                Política de Cookies
              </Link>
              <Link
                href="#"
                underline="none"
                sx={{
                  color: "#B0B0B0",
                  fontSize: "0.875rem",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    color: "#A4D65E",
                    paddingLeft: "8px",
                  },
                }}
              >
                Política de Cancelación
              </Link>
            </Box>
          </Grid>

          {/* Columna 4: Newsletter */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                mb: 2,
                color: "#FFFFFF",
                fontSize: "0.875rem",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              NEWSLETTER
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "#B0B0B0",
                mb: 2,
                fontSize: "0.875rem",
                lineHeight: 1.6,
              }}
            >
              Suscríbete para recibir ofertas exclusivas y novedades sobre nuestros tours.
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <TextField
                placeholder="Tu email"
                variant="outlined"
                size="small"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "#1A1A1A",
                    color: "#FFFFFF",
                    borderRadius: 1,
                    "& fieldset": {
                      borderColor: "#2A2A2A",
                    },
                    "&:hover fieldset": {
                      borderColor: "#A4D65E",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#A4D65E",
                    },
                  },
                  "& .MuiInputBase-input::placeholder": {
                    color: "#666666",
                    opacity: 1,
                  },
                }}
              />
              <Button
                variant="contained"
                fullWidth
                disabled={loading || !email}
                onClick={handleSubscribe}
                sx={{
                  bgcolor: "#A4D65E",
                  color: "#000000",
                  fontWeight: 600,
                  textTransform: "none",
                  py: 1,
                  borderRadius: 1,
                  "&:hover": {
                    bgcolor: "#C5E68F",
                  },
                  "&:disabled": {
                    bgcolor: "#2A2A2A",
                    color: "#666666",
                  },
                }}
              >
                {loading ? "Suscribiendo..." : "Suscribirme"}
              </Button>
            </Box>
          </Grid>
        </Grid>

        {/* Copyright */}
        <Box
          sx={{
            borderTop: "1px solid #1A1A1A",
            mt: 6,
            pt: 3,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Typography variant="body2" sx={{ color: "#666666", fontSize: "0.875rem" }}>
            © 2025 TrekkingAR. Todos los derechos reservados.
          </Typography>
          <Typography variant="body2" sx={{ color: "#666666", fontSize: "0.875rem" }}>
            Hecho con 💚 en Argentina
          </Typography>
        </Box>
      </Container>

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default Footer
