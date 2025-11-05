import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Stack,
  IconButton,
} from "@mui/material"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import EmailIcon from "@mui/icons-material/Email"

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess(false)

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3003/api"
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSuccess(true)
      } else {
        setError(data.message || "Error al procesar la solicitud")
      }
    } catch (err) {
      setError("Error de conexión con el servidor")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        py: 4,
        position: "relative",
      }}
    >
      {/* Botón Volver a Login */}
      <IconButton
        onClick={() => navigate("/login")}
        sx={{
          position: "absolute",
          top: 16,
          left: 16,
          color: "white",
          bgcolor: "rgba(255, 255, 255, 0.2)",
          "&:hover": {
            bgcolor: "rgba(255, 255, 255, 0.3)",
          },
        }}
        aria-label="Volver al login"
      >
        <ArrowBackIcon />
      </IconButton>

      <Container maxWidth="sm">
        <Paper elevation={6} sx={{ p: 4, borderRadius: 2 }}>
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Box
              component="img"
              src="/mountain.png"
              alt="Logo TrekkingAr"
              sx={{ height: 60, mb: 2 }}
            />
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Recuperar Contraseña
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ingresa tu email y te enviaremos un link para restablecer tu contraseña
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success ? (
            <Box sx={{ textAlign: "center" }}>
              <Alert severity="success" sx={{ mb: 3 }}>
                ¡Email enviado! Revisa tu bandeja de entrada y sigue las instrucciones para restablecer tu contraseña.
              </Alert>
              <Button
                variant="outlined"
                onClick={() => navigate("/login")}
                fullWidth
              >
                Volver al login
              </Button>
            </Box>
          ) : (
            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={loading}
                  startIcon={<EmailIcon />}
                >
                  {loading ? "Enviando..." : "Enviar enlace de recuperación"}
                </Button>

                <Button
                  variant="text"
                  onClick={() => navigate("/login")}
                  fullWidth
                >
                  Cancelar
                </Button>
              </Stack>
            </form>
          )}
        </Paper>
      </Container>
    </Box>
  )
}