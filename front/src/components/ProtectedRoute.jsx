import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { Box, CircularProgress } from "@mui/material"

/**
 * Componente para proteger rutas que requieren autenticación
 */
export const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth()
  const location = useLocation()

  // Mostrar loading mientras se verifica autenticación
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  // Redirigir a login si no está autenticado
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Redirigir a home si requiere admin y no lo es
  if (adminOnly && user.rol !== "admin") {
    return <Navigate to="/" replace />
  }

  return children
}
