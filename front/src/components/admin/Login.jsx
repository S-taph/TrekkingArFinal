"use client"

import { useState } from "react"
import { Container, Paper, TextField, Button, Typography, Box, Alert, CircularProgress } from "@mui/material"
import { authAPI } from "../../services/api"

export default function Login({ onLogin }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await authAPI.login(formData)
      console.log("🔍 Login response:", response)

      if (response.success) {
        const token = response.data?.token   // 🔹 verifica que tu backend devuelva el token aquí
        const usuario = response.data?.usuario

        if (!token) throw new Error("No se recibió token del servidor")

        localStorage.setItem("token", token)
        localStorage.setItem("user", JSON.stringify(usuario))

        if (usuario.rol === "admin") {
          onLogin(usuario)
        } else {
          setError("No tienes permisos de administrador")
          localStorage.removeItem("token")
          localStorage.removeItem("user")
        }
      } else {
        throw new Error(response.message || "Error al iniciar sesión")
      }
    } catch (error) {
      console.error(error)
      setError(error.message || "Error al iniciar sesión")
    } finally {
      setLoading(false)
    }
  }


  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: "100%" }}>
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            TrekkingAR
          </Typography>
          <Typography component="h2" variant="h6" align="center" color="textSecondary" gutterBottom>
            Panel de Administración
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email"
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Contraseña"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
            />
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={loading}>
              {loading ? <CircularProgress size={24} /> : "Iniciar Sesión"}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  )
}
