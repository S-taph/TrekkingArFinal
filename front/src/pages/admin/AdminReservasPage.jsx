import { useState, useEffect } from "react"
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Select,
  MenuItem,
  FormControl,
  CircularProgress,
  Alert,
} from "@mui/material"
import { reservasAPI } from "../../services/api"

const estadoColors = {
  pendiente: "warning",
  confirmada: "success",
  cancelada: "error",
  completada: "info",
}

/**
 * AdminReservasPage - Gestión de reservas (admin)
 * ✅ Conectado con backend real
 */
export default function AdminReservasPage() {
  const [reservas, setReservas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadReservas()
  }, [])

  const loadReservas = async () => {
    try {
      setLoading(true)
      setError(null)
      // ✅ Conectado con GET /api/reservas
      const response = await reservasAPI.getReservas()

      if (response.success) {
        setReservas(response.data.reservas || [])
      }
    } catch (error) {
      console.error("Error cargando reservas:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChangeEstado = async (id, newEstado) => {
    try {
      // ✅ Conectado con PUT /api/reservas/:id/estado
      await reservasAPI.updateReservaStatus(id, newEstado)

      // Actualizar estado local
      setReservas((prev) =>
        prev.map((r) => (r.id_reserva === id ? { ...r, estado_reserva: newEstado } : r)),
      )
    } catch (error) {
      console.error("Error actualizando estado:", error)
      setError(error.message)
    }
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
        Gestión de Reservas
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : reservas.length === 0 ? (
        <Alert severity="info">No hay reservas registradas.</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nº Reserva</TableCell>
                <TableCell>Usuario</TableCell>
                <TableCell>Viaje</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Personas</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Estado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reservas.map((reserva) => (
                <TableRow key={reserva.id_reserva}>
                  <TableCell>{reserva.numero_reserva}</TableCell>
                  <TableCell>
                    {reserva.usuario?.nombre} {reserva.usuario?.apellido}
                  </TableCell>
                  <TableCell>{reserva.viaje?.titulo}</TableCell>
                  <TableCell>
                    {new Date(reserva.fecha_viaje?.fecha_inicio).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{reserva.cantidad_personas}</TableCell>
                  <TableCell>${reserva.precio_total?.toLocaleString()}</TableCell>
                  <TableCell>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <Select
                        value={reserva.estado_reserva}
                        onChange={(e) => handleChangeEstado(reserva.id_reserva, e.target.value)}
                      >
                        <MenuItem value="pendiente">Pendiente</MenuItem>
                        <MenuItem value="confirmada">Confirmada</MenuItem>
                        <MenuItem value="cancelada">Cancelada</MenuItem>
                        <MenuItem value="completada">Completada</MenuItem>
                      </Select>
                    </FormControl>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  )
}
