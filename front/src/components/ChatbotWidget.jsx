import { useState, useRef, useEffect } from "react"
import { useLocation } from "react-router-dom"
import {
  Box,
  Paper,
  IconButton,
  TextField,
  Typography,
  Fab,
  Zoom,
  Avatar,
  CircularProgress,
  Chip,
  Button,
  Divider,
} from "@mui/material"
import {
  Chat as ChatIcon,
  Close as CloseIcon,
  Send as SendIcon,
  SmartToy as BotIcon,
  Person as PersonIcon,
  WhatsApp as WhatsAppIcon,
} from "@mui/icons-material"

// ✅ Usar variable de entorno para la API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3003/api"

export const ChatbotWidget = () => {
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "assistant",
      content:
        "¡Hola! Soy el asistente virtual de TrekkingAR. ¿En qué puedo ayudarte hoy?",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  // Scroll automático al último mensaje
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Enviar mensaje al chatbot
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage = {
      id: Date.now(),
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setLoading(true)

    try {
      // Llamar a la API del chatbot
      const response = await fetch(`${API_BASE_URL}/chatbot`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-bypass-auth": "true",
        },
        credentials: "include",
        body: JSON.stringify({
          message: inputValue,
          conversationHistory: messages.slice(-5).map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      })

      const data = await response.json()

      if (data.success) {
        const botMessage = {
          id: Date.now() + 1,
          role: "assistant",
          content: data.data.response,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, botMessage])
      } else {
        throw new Error(data.message || "Error en el chatbot")
      }
    } catch (error) {
      console.error("[ChatbotWidget] Error:", error)
      const errorMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content:
          "Lo siento, hubo un problema al procesar tu mensaje. Por favor, intenta de nuevo.",
        timestamp: new Date(),
        isError: true,
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Sugerencias rápidas
  const quickSuggestions = [
    "¿Qué viajes tienen disponibles?",
    "¿Cuál es la política de cancelación?",
    "¿Cómo puedo hacer una reserva?",
  ]

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion)
  }

  // Contactar por WhatsApp
  const handleWhatsAppContact = () => {
    const phoneNumber = "5492944428765" // +54 9 294 442-8765 (sin espacios ni símbolos)
    const message = encodeURIComponent(
      "Hola! Me gustaría hablar con un representante de TrekkingAR."
    )
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`
    window.open(whatsappUrl, "_blank", "noopener,noreferrer")
  }

  // No mostrar el chatbot en rutas de administración
  if (location.pathname.startsWith("/admin")) {
    return null
  }

  return (
    <>
      {/* Botón flotante */}
      <Zoom in={!open}>
        <Fab
          color="primary"
          aria-label="chat"
          onClick={() => setOpen(true)}
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 1000,
            boxShadow: 4,
            "&:hover": {
              transform: "scale(1.1)",
              transition: "transform 0.2s ease",
            },
          }}
        >
          <ChatIcon />
        </Fab>
      </Zoom>

      {/* Ventana del chat */}
      <Zoom in={open}>
        <Paper
          elevation={8}
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            width: 400,
            height: 600,
            zIndex: 1000,
            display: open ? "flex" : "none",
            flexDirection: "column",
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              p: 2,
              bgcolor: "primary.main",
              color: "primary.contrastText",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Avatar sx={{ bgcolor: "primary.dark" }}>
                <BotIcon />
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight={600}>
                  Asistente Virtual
                </Typography>
                <Typography variant="caption">Siempre disponible</Typography>
              </Box>
            </Box>
            <IconButton onClick={() => setOpen(false)} sx={{ color: "inherit" }}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Mensajes */}
          <Box
            sx={{
              flex: 1,
              overflow: "auto",
              p: 2,
              bgcolor: "background.default",
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            {messages.map((message) => (
              <Box
                key={message.id}
                sx={{
                  display: "flex",
                  justifyContent:
                    message.role === "user" ? "flex-end" : "flex-start",
                  gap: 1,
                }}
              >
                {message.role === "assistant" && (
                  <Avatar sx={{ bgcolor: "primary.main", width: 32, height: 32 }}>
                    <BotIcon fontSize="small" />
                  </Avatar>
                )}
                <Paper
                  elevation={1}
                  sx={{
                    p: 1.5,
                    maxWidth: "75%",
                    bgcolor:
                      message.role === "user"
                        ? "primary.main"
                        : message.isError
                          ? "error.light"
                          : "background.paper",
                    color:
                      message.role === "user"
                        ? "primary.contrastText"
                        : "text.primary",
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                    {message.content}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      mt: 0.5,
                      opacity: 0.7,
                      fontSize: "0.7rem",
                    }}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Typography>
                </Paper>
                {message.role === "user" && (
                  <Avatar sx={{ bgcolor: "secondary.main", width: 32, height: 32 }}>
                    <PersonIcon fontSize="small" />
                  </Avatar>
                )}
              </Box>
            ))}

            {/* Indicador de carga */}
            {loading && (
              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <Avatar sx={{ bgcolor: "primary.main", width: 32, height: 32 }}>
                  <BotIcon fontSize="small" />
                </Avatar>
                <Paper
                  elevation={1}
                  sx={{
                    p: 1.5,
                    bgcolor: "background.paper",
                    borderRadius: 2,
                  }}
                >
                  <CircularProgress size={20} />
                </Paper>
              </Box>
            )}

            {/* Sugerencias rápidas (solo si no hay muchos mensajes) */}
            {messages.length <= 2 && (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
                {quickSuggestions.map((suggestion, index) => (
                  <Chip
                    key={index}
                    label={suggestion}
                    onClick={() => handleSuggestionClick(suggestion)}
                    size="small"
                    sx={{ cursor: "pointer" }}
                  />
                ))}
              </Box>
            )}

            <div ref={messagesEndRef} />
          </Box>

          {/* Input y botón de WhatsApp */}
          <Box
            sx={{
              borderTop: 1,
              borderColor: "divider",
              bgcolor: "background.paper",
            }}
          >
            {/* Botón de WhatsApp */}
            <Box sx={{ p: 2, pb: 1 }}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<WhatsAppIcon />}
                onClick={handleWhatsAppContact}
                sx={{
                  borderColor: "#25D366",
                  color: "#25D366",
                  textTransform: "none",
                  "&:hover": {
                    borderColor: "#20BA5A",
                    bgcolor: "rgba(37, 211, 102, 0.08)",
                  },
                }}
              >
                Hablar con un representante
              </Button>
            </Box>

            <Divider sx={{ mx: 2 }} />

            {/* Input de mensaje */}
            <Box sx={{ p: 2, pt: 1 }}>
              <Box sx={{ display: "flex", gap: 1 }}>
                <TextField
                  fullWidth
                  multiline
                  maxRows={3}
                  placeholder="Escribe tu mensaje..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                  size="small"
                />
                <IconButton
                  color="primary"
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || loading}
                  sx={{
                    bgcolor: "primary.main",
                    color: "white",
                    "&:hover": {
                      bgcolor: "primary.dark",
                    },
                    "&:disabled": {
                      bgcolor: "action.disabledBackground",
                    },
                  }}
                >
                  <SendIcon />
                </IconButton>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Zoom>
    </>
  )
}
