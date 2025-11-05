import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Container, Paper, Typography, CircularProgress, Box, Button } from "@mui/material"
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline"
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline"
import { newsletterAPI } from "../services/api"

export default function NewsletterUnsubscribe() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState("loading") // loading, success, error
  const [message, setMessage] = useState("")

  useEffect(() => {
    const unsubscribe = async () => {
      try {
        const response = await newsletterAPI.unsubscribe(token)
        setStatus("success")
        setMessage(response.message || "Te has desuscrito exitosamente del newsletter")
      } catch (error) {
        setStatus("error")
        setMessage(error.message || "Error al procesar la desuscripción")
      }
    }

    if (token) {
      unsubscribe()
    }
  }, [token])

  const handleGoHome = () => {
    navigate("/")
  }

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: "center" }}>
        {status === "loading" && (
          <Box>
            <CircularProgress size={60} sx={{ mb: 3 }} />
            <Typography variant="h5" gutterBottom>
              Procesando desuscripción...
            </Typography>
          </Box>
        )}

        {status === "success" && (
          <Box>
            <CheckCircleOutlineIcon
              sx={{ fontSize: 80, color: "success.main", mb: 2 }}
            />
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
              ¡Desuscripción exitosa!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {message}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Lamentamos verte partir. Si cambias de opinión, siempre puedes volver a
              suscribirte desde nuestro sitio web.
            </Typography>
            <Button variant="contained" onClick={handleGoHome} size="large">
              Volver a la página principal
            </Button>
          </Box>
        )}

        {status === "error" && (
          <Box>
            <ErrorOutlineIcon sx={{ fontSize: 80, color: "error.main", mb: 2 }} />
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
              Error al desuscribirse
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              {message}
            </Typography>
            <Button variant="contained" onClick={handleGoHome} size="large">
              Volver a la página principal
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  )
}
