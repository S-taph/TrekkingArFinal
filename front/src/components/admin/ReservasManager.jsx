"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Typography,
  TextField,
  Grid2,
  Card,
  CardContent,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Button,
} from "@mui/material"
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
} from "@mui/icons-material"
import { reservasAPI } from "../../services/api"

const getEstadoColor = (estado) => {
  switch (estado) {
    case "confirmada":
      return "success"
    case "pendiente":
      return "warning"
    case "cancelada":
      return "error"
    case "completada":
      return "info"
    case "en_progreso":
      return "primary"
    default:
      return "default"
  }
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(amount)
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

export default function ReservasManager() {
  const [reservas, setReservas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 12,
  })

  // Estados para filtros
  const [filters, setFilters] = useState({
    search: "",
    estado: "",
    fecha_desde: "",
    fecha_hasta: "",
  })

  // Estados para modales
  const [showDetail, setShowDetail] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [selectedReserva, setSelectedReserva] = useState(null)

  useEffect(() => {
    const loadReservas = async () => {
      try {
        setLoading(true)
        const params = {
          page: pagination.currentPage,
          limit: pagination.itemsPerPage, // ← Esta variable se usa aquí
          ...filters,
        }

        // Limpiar parámetros vacíos
        Object.keys(params).forEach((key) => {
          if (params[key] === "" || params[key] === null || params[key] === undefined) {
            delete params[key]
          }
        })

        const response = await reservasAPI.getReservas(params)

        if (response.success) {
          // Mapear los datos del backend al formato esperado por el frontend
          const reservasMapeadas = response.data.reservas.map((reserva) => ({
            id_reserva: reserva.id_reserva,
            usuario: reserva.usuario,
            viaje: reserva.fecha_viaje?.viaje,
            estado: reserva.estado_reserva,
            fecha_reserva: reserva.fecha_reserva,
            fecha_viaje: reserva.fecha_viaje?.fecha_inicio,
            cantidad_personas: reserva.cantidad_personas,
            precio_total: reserva.compra?.total_compra || reserva.subtotal_reserva,
            // Mantener campos originales para edición
            estado_reserva: reserva.estado_reserva,
            compra: reserva.compra,
            fecha_viaje_obj: reserva.fecha_viaje,
          }))
          setReservas(reservasMapeadas)
          setPagination(response.data.pagination)
        }
      } catch (error) {
        setError(error.message || "Error al cargar reservas")
      } finally {
        setLoading(false)
      }
    }

    loadReservas()
  }, [pagination.currentPage, pagination.itemsPerPage, filters])

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }))
    setPagination((prev) => ({ ...prev, currentPage: 1 }))
  }

  const handlePageChange = (event, page) => {
    setPagination((prev) => ({ ...prev, currentPage: page }))
  }

  const handleViewReserva = (reserva) => {
    setSelectedReserva(reserva)
    setShowDetail(true)
  }

  const handleEditReserva = (reserva) => {
    setSelectedReserva(reserva)
    setShowEdit(true)
  }

  const handleUpdateReserva = async (updatedData) => {
    try {
      // Llamar al API para actualizar la reserva
      await reservasAPI.updateReservaStatus(
        selectedReserva.id_reserva,
        updatedData.estado || updatedData.estado_reserva,
        updatedData.observaciones_reserva,
      )

      // Actualizar el estado local
      setReservas((prev) =>
        prev.map((reserva) =>
          reserva.id_reserva === selectedReserva.id_reserva
            ? {
                ...reserva,
                estado: updatedData.estado || updatedData.estado_reserva,
                estado_reserva: updatedData.estado || updatedData.estado_reserva,
                cantidad_personas: updatedData.cantidad_personas,
                fecha_viaje: updatedData.fecha_viaje,
                precio_total: updatedData.precio_total,
              }
            : reserva,
        ),
      )

      setShowEdit(false)
      setSelectedReserva(null)
    } catch (error) {
      setError(error.message || "Error al actualizar reserva")
    }
  }

  // Mock data eliminado - ahora usando datos reales del backend

  if (loading && reservas.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Gestión de Reservas
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            {pagination.totalItems} reservas encontradas
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* Filtros */}
      <Card sx={{ mb: 3, width: '100%' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <FilterIcon sx={{ mr: 1, verticalAlign: "middle" }} />
            Filtros
          </Typography>
          <Grid2 container spacing={2} sx={{ width: '100%' }}>
            <Grid2 size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                label="Buscar reservas"
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />,
                }}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, md: 3 }}>
              <FormControl fullWidth sx={{ minWidth: 200 }}>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={filters.estado}
                  label="Estado"
                  onChange={(e) => handleFilterChange("estado", e.target.value)}
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="pendiente">Pendiente</MenuItem>
                  <MenuItem value="confirmada">Confirmada</MenuItem>
                  <MenuItem value="en_progreso">En Progreso</MenuItem>
                  <MenuItem value="completada">Completada</MenuItem>
                  <MenuItem value="cancelada">Cancelada</MenuItem>
                </Select>
              </FormControl>
            </Grid2>
            <Grid2 size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                label="Fecha desde"
                type="date"
                value={filters.fecha_desde}
                onChange={(e) => handleFilterChange("fecha_desde", e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                label="Fecha hasta"
                type="date"
                value={filters.fecha_hasta}
                onChange={(e) => handleFilterChange("fecha_hasta", e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid2>
          </Grid2>
        </CardContent>
      </Card>

      {/* Lista de reservas */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>
            {reservas.map((reserva) => (
              <Card key={reserva.id_reserva} elevation={2} sx={{ width: '100%' }}>
                <CardContent>
                  <Grid2 container spacing={2} alignItems="center">
                    <Grid2 size={{ xs: 12, md: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        {reserva.usuario?.nombre} {reserva.usuario?.apellido}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {reserva.usuario?.email}
                      </Typography>
                    </Grid2>

                    <Grid2 size={{ xs: 12, md: 3 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        {reserva.viaje?.titulo}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {reserva.viaje?.duracion_dias} días
                      </Typography>
                    </Grid2>

                    <Grid2 size={{ xs: 12, md: 2 }}>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Fecha del viaje
                      </Typography>
                      <Typography variant="body1">{formatDate(reserva.fecha_viaje)}</Typography>
                      <Typography variant="caption" color="textSecondary" sx={{ display: "block", mt: 0.5 }}>
                        Reservado: {formatDate(reserva.fecha_reserva)}
                      </Typography>
                    </Grid2>

                    <Grid2 size={{ xs: 12, md: 2 }}>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Personas
                      </Typography>
                      <Typography variant="body1">{reserva.cantidad_personas}</Typography>
                      <Typography variant="h6" color="primary.main">
                        {formatCurrency(reserva.precio_total)}
                      </Typography>
                    </Grid2>

                    <Grid2 size={{ xs: 12, md: 2 }}>
                      <Box display="flex" flexDirection="column" alignItems="flex-end" gap={1}>
                        <Chip
                          label={reserva.estado}
                          color={getEstadoColor(reserva.estado)}
                          sx={{ textTransform: "capitalize" }}
                        />
                        <Box>
                          <Tooltip title="Ver detalles">
                            <IconButton size="small" onClick={() => handleViewReserva(reserva)}>
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Editar">
                            <IconButton size="small" onClick={() => handleEditReserva(reserva)}>
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    </Grid2>
                  </Grid2>
                </CardContent>
              </Card>
            ))}
          </Box>

          {/* Paginación */}
          {pagination.totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination
                count={pagination.totalPages}
                page={pagination.currentPage}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      )}

      {/* Modal de detalle */}
      <Dialog open={showDetail} onClose={() => setShowDetail(false)} maxWidth="md" fullWidth>
        <DialogTitle>Detalles de la Reserva</DialogTitle>
        <DialogContent>
          {selectedReserva && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Información del Cliente
              </Typography>
              <Typography>
                <strong>Nombre:</strong> {selectedReserva.usuario?.nombre} {selectedReserva.usuario?.apellido}
              </Typography>
              <Typography>
                <strong>Email:</strong> {selectedReserva.usuario?.email}
              </Typography>

              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Información del Viaje
              </Typography>
              <Typography>
                <strong>Viaje:</strong> {selectedReserva.viaje?.titulo}
              </Typography>
              <Typography>
                <strong>Duración:</strong> {selectedReserva.viaje?.duracion_dias} días
              </Typography>
              <Typography>
                <strong>Fecha:</strong> {formatDate(selectedReserva.fecha_viaje)}
              </Typography>

              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Detalles de la Reserva
              </Typography>
              <Typography>
                <strong>Estado:</strong>{" "}
                <Chip
                  label={selectedReserva.estado}
                  color={getEstadoColor(selectedReserva.estado)}
                  size="small"
                  sx={{ textTransform: "capitalize" }}
                />
              </Typography>
              <Typography>
                <strong>Cantidad de personas:</strong> {selectedReserva.cantidad_personas}
              </Typography>
              <Typography>
                <strong>Precio total:</strong> {formatCurrency(selectedReserva.precio_total)}
              </Typography>
              <Typography>
                <strong>Fecha de reserva:</strong> {formatDate(selectedReserva.fecha_reserva)}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDetail(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* Modal de edición */}
      <Dialog open={showEdit} onClose={() => setShowEdit(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Reserva</DialogTitle>
        <DialogContent>
          {selectedReserva && (
            <Box sx={{ mt: 2 }}>
              <Grid2 container spacing={2}>
                <Grid2 size={12}>
                  <FormControl fullWidth>
                    <InputLabel>Estado</InputLabel>
                    <Select
                      value={selectedReserva.estado || selectedReserva.estado_reserva}
                      label="Estado"
                      onChange={(e) =>
                        setSelectedReserva((prev) => ({
                          ...prev,
                          estado: e.target.value,
                          estado_reserva: e.target.value,
                        }))
                      }
                    >
                      <MenuItem value="pendiente">Pendiente</MenuItem>
                      <MenuItem value="confirmada">Confirmada</MenuItem>
                      <MenuItem value="en_progreso">En Progreso</MenuItem>
                      <MenuItem value="completada">Completada</MenuItem>
                      <MenuItem value="cancelada">Cancelada</MenuItem>
                    </Select>
                  </FormControl>
                </Grid2>
                <Grid2 size={12}>
                  <TextField
                    fullWidth
                    label="Cantidad de personas"
                    type="number"
                    value={selectedReserva.cantidad_personas}
                    onChange={(e) =>
                      setSelectedReserva((prev) => ({
                        ...prev,
                        cantidad_personas: Number.parseInt(e.target.value),
                      }))
                    }
                  />
                </Grid2>
                <Grid2 size={12}>
                  <TextField
                    fullWidth
                    label="Fecha del viaje"
                    type="date"
                    value={selectedReserva.fecha_viaje?.split("T")[0] || selectedReserva.fecha_viaje}
                    onChange={(e) =>
                      setSelectedReserva((prev) => ({
                        ...prev,
                        fecha_viaje: e.target.value,
                      }))
                    }
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid2>
                <Grid2 size={12}>
                  <TextField
                    fullWidth
                    label="Precio total"
                    type="number"
                    value={selectedReserva.precio_total}
                    onChange={(e) =>
                      setSelectedReserva((prev) => ({
                        ...prev,
                        precio_total: Number.parseFloat(e.target.value),
                      }))
                    }
                    InputProps={{
                      startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                    }}
                  />
                </Grid2>
              </Grid2>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEdit(false)}>Cancelar</Button>
          <Button onClick={() => handleUpdateReserva(selectedReserva)} variant="contained">
            Guardar Cambios
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
