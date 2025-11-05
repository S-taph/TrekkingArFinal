import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import {
  Box,
  Container,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Stack,
} from "@mui/material"
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Home as HomeIcon,
} from "@mui/icons-material"
import Header from "../components/Header"

export default function VerifyEmailPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token")

      if (!token) {
        setError("Token de verificación no proporcionado")
        setLoading(false)
        return
      }

      try {
        const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3003/api"
        const response = await fetch(`${API_URL}/auth/verify-email?token=${token}`, {
          method: "GET",
          credentials: "include",
        })

        const data = await response.json()

        if (response.ok && data.success) {
          setSuccess(true)
          setError("")
        } else {
          setSuccess(false)
          setError(data.message || "Error al verificar el correo electrónico")
        }
      } catch (err) {
        console.error("[VerifyEmail] Error:", err)
        setError("Error de conexión con el servidor. Por favor intenta de nuevo.")
      } finally {
        setLoading(false)
      }
    }

    verifyEmail()
  }, [searchParams])

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      <Header />

      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper
          elevation={3}
          sx={{
            p: 4,
            textAlign: "center",
            borderRadius: 2,
          }}
        >
          {loading ? (
            <>
              <CircularProgress size={60} sx={{ mb: 3 }} />
              <Typography variant="h5" gutterBottom>
                Verificando tu correo electrónico...
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Por favor espera un momento
              </Typography>
            </>
          ) : success ? (
            <>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  bgcolor: "success.light",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto",
                  mb: 3,
                }}
              >
                <SuccessIcon sx={{ fontSize: 50, color: "success.main" }} />
              </Box>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: "success.main" }}>
                ¡Todo listo para la aventura!
              </Typography>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Tu correo ha sido verificado exitosamente
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 2, mb: 4 }}>
                Ya puedes acceder a todas las funciones de TrekkingAR y comenzar a reservar tus
                próximas aventuras.
              </Typography>
              <Stack direction="row" spacing={2} justifyContent="center">
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<HomeIcon />}
                  onClick={() => navigate("/")}
                  sx={{
                    bgcolor: "success.main",
                    "&:hover": {
                      bgcolor: "success.dark",
                    },
                  }}
                >
                  Ir al inicio
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate("/catalogo")}
                  color="success"
                >
                  Ver viajes
                </Button>
              </Stack>
            </>
          ) : (
            <>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  bgcolor: "error.light",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto",
                  mb: 3,
                }}
              >
                <ErrorIcon sx={{ fontSize: 50, color: "error.main" }} />
              </Box>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: "error.main" }}>
                Error de verificación
              </Typography>
              <Alert severity="error" sx={{ mt: 2, mb: 3, textAlign: "left" }}>
                {error}
              </Alert>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                El enlace de verificación puede haber expirado o ser inválido. Por favor, verifica
                que hayas copiado el enlace correctamente o solicita un nuevo correo de
                verificación.
              </Typography>
              <Stack direction="row" spacing={2} justifyContent="center">
                <Button variant="outlined" onClick={() => navigate("/login")}>
                  Ir a inicio de sesión
                </Button>
                <Button variant="contained" onClick={() => navigate("/")}>
                  Volver al inicio
                </Button>
              </Stack>
            </>
          )}
        </Paper>
      </Container>
    </Box>
  )
}
