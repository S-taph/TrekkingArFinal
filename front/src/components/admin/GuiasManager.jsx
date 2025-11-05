"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Box,
  Typography,
  Button,
  TextField,
  Grid2,
  Card,
  CardContent,
  CardActions,
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
  Avatar,
} from "@mui/material"
import {
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  ToggleOff as ToggleOffIcon,
  ToggleOn as ToggleOnIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Star as StarIcon,
} from "@mui/icons-material"
import { guiasAPI } from "../../services/api"
import GuiaForm from "./GuiaForm"
import GuiaDetail from "./GuiaDetail"

export default function GuiasManager() {
  const [guias, setGuias] = useState([])
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
    especialidad: "",
    disponible: "", // Cambiar valor por defecto para mostrar todos
  })

  // Estados para modales
  const [showForm, setShowForm] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [selectedGuia, setSelectedGuia] = useState(null)
  const [formMode, setFormMode] = useState("create")

  // Cargar guías cuando cambian los filtros o la paginación
  useEffect(() => {
    const loadGuias = async () => {
      try {
        setLoading(true)
        const params = {
          page: pagination.currentPage,
          limit: pagination.itemsPerPage,
          ...filters,
        }

        if (params.disponible !== undefined && params.disponible !== "") {
          params.activo = params.disponible === "true"
          delete params.disponible
        }

        // Limpiar parámetros vacíos
        Object.keys(params).forEach((key) => {
          if (params[key] === "" || params[key] === null || params[key] === undefined) {
            delete params[key]
          }
        })

        console.log("[GuiasManager] Cargando guías con parámetros:", params)
        const response = await guiasAPI.getGuias(params)
        console.log("[GuiasManager] Respuesta del servidor:", response)

        if (response.success) {
          setGuias(response.data.guias)
          setPagination(response.data.pagination)
        } else {
          setError(response.message || "Error al cargar guías")
        }
      } catch (error) {
        console.error("[GuiasManager] Error en loadGuias:", error)
        setError(error.message || "Error al cargar guías")
      } finally {
        setLoading(false)
      }
    }

    loadGuias()
  }, [pagination.currentPage, pagination.itemsPerPage, filters.search, filters.especialidad, filters.disponible])

  // Función para recargar guías manualmente
  const reloadGuias = useCallback(async () => {
    try {
      setLoading(true)
      const params = {
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        ...filters,
      }

      if (params.disponible !== undefined && params.disponible !== "") {
        params.activo = params.disponible === "true"
        delete params.disponible
      }

      Object.keys(params).forEach((key) => {
        if (params[key] === "" || params[key] === null || params[key] === undefined) {
          delete params[key]
        }
      })

      const response = await guiasAPI.getGuias(params)

      if (response.success) {
        setGuias(response.data.guias)
        setPagination(response.data.pagination)
      } else {
        setError(response.message || "Error al cargar guías")
      }
    } catch (error) {
      console.error("[GuiasManager] Error en reloadGuias:", error)
      setError(error.message || "Error al cargar guías")
    } finally {
      setLoading(false)
    }
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

  const handleCreateGuia = () => {
    setSelectedGuia(null)
    setFormMode("create")
    setShowForm(true)
  }

  const handleEditGuia = (guia) => {
    setSelectedGuia(guia)
    setFormMode("edit")
    setShowForm(true)
  }

  const handleViewGuia = (guia) => {
    setSelectedGuia(guia)
    setShowDetail(true)
  }

  const handleToggleStatus = async (guia) => {
    try {
      await guiasAPI.updateGuia(guia.id_guia, { activo: !guia.activo })
      await reloadGuias()
    } catch (error) {
      setError(error.message || "Error al cambiar estado del guía")
    }
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    reloadGuias()
  }

  const getInitials = (nombre, apellido) => {
    return `${nombre?.charAt(0) || ""}${apellido?.charAt(0) || ""}`.toUpperCase()
  }

  if (loading && guias.length === 0) {
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
            Gestión de Guías
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            {pagination.totalItems} guías encontrados
          </Typography>
          {pagination.totalItems === 0 && (
            <Typography variant="body2" color="warning.main" sx={{ mt: 1 }}>
              No hay perfiles de guía creados. Los usuarios con rol "guia" deben tener un perfil de guía para aparecer
              aquí.
            </Typography>
          )}
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateGuia}>
          Nuevo Guía
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* Filtros */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <FilterIcon sx={{ mr: 1, verticalAlign: "middle" }} />
            Filtros
          </Typography>
          <Grid2 container spacing={2}>
            <Grid2 xs={12} md={4}>
              <TextField
                fullWidth
                size="medium"
                label="Buscar guías"
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />,
                }}
              />
            </Grid2>
            <Grid2 xs={12} md={4}>
              <TextField
                fullWidth
                size="medium"
                label="Especialidad"
                value={filters.especialidad}
                onChange={(e) => handleFilterChange("especialidad", e.target.value)}
                placeholder="ej: montañismo, trekking"
              />
            </Grid2>
            <Grid2 xs={12} md={4}>
              <FormControl fullWidth size="medium" sx={{ minWidth: 120 }}>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={filters.disponible}
                  label="Estado"
                  onChange={(e) => handleFilterChange("disponible", e.target.value)}
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="true">Activos</MenuItem>
                  <MenuItem value="false">Inactivos</MenuItem>
                </Select>
              </FormControl>
            </Grid2>
          </Grid2>
        </CardContent>
      </Card>

      {/* Lista de guías */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid2 container spacing={3}>
            {guias.map((guia) => (
              <Grid2 xs={12} sm={6} md={4} key={guia.id_guia}>
                <Card elevation={2} sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box display="flex" alignItems="center" mb={2}>
                      <Avatar src={guia.usuario?.avatar} sx={{ mr: 2, bgcolor: "primary.main" }}>
                        {getInitials(guia.usuario?.nombre, guia.usuario?.apellido)}
                      </Avatar>
                      <Box flexGrow={1}>
                        <Typography variant="h6" component="h3">
                          {guia.usuario?.nombre} {guia.usuario?.apellido}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1}>
                          <StarIcon fontSize="small" color="warning" />
                          <Typography variant="body2" color="textSecondary">
                            {guia.calificacion_promedio || "Sin calificar"}
                          </Typography>
                        </Box>
                      </Box>
                      <Chip
                        label={guia.activo ? "Activo" : "Inactivo"}
                        color={guia.activo ? "success" : "default"}
                        size="small"
                      />
                    </Box>

                    <Typography variant="body2" color="textSecondary" paragraph>
                      <strong>Especialidades:</strong> {guia.especialidades || "No especificadas"}
                    </Typography>

                    <Typography variant="body2" color="textSecondary" paragraph>
                      <strong>Experiencia:</strong> {guia.anos_experiencia || 0} {guia.anos_experiencia === 1 ? "año" : "años"}
                    </Typography>

                    {guia.idiomas && (
                      <Typography variant="body2" color="textSecondary" paragraph>
                        <strong>Idiomas:</strong> {guia.idiomas}
                      </Typography>
                    )}

                    {guia.tarifa_por_dia && (
                      <Typography variant="body2" color="primary.main">
                        <strong>Tarifa:</strong> ${guia.tarifa_por_dia}/día
                      </Typography>
                    )}
                  </CardContent>

                  <CardActions>
                    <Tooltip title="Ver detalles">
                      <IconButton size="small" onClick={() => handleViewGuia(guia)}>
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Editar">
                      <IconButton size="small" onClick={() => handleEditGuia(guia)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={guia.activo ? "Desactivar" : "Activar"}>
                      <IconButton size="small" onClick={() => handleToggleStatus(guia)}>
                        {guia.activo ? <ToggleOnIcon color="success" /> : <ToggleOffIcon />}
                      </IconButton>
                    </Tooltip>
                  </CardActions>
                </Card>
              </Grid2>
            ))}
          </Grid2>

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

      {/* Modal de formulario */}
      <Dialog open={showForm} onClose={() => setShowForm(false)} maxWidth="md" fullWidth>
        <DialogTitle>{formMode === "create" ? "Crear Nuevo Guía" : "Editar Guía"}</DialogTitle>
        <DialogContent>
          <GuiaForm
            guia={selectedGuia}
            mode={formMode}
            onSuccess={handleFormSuccess}
            onCancel={() => setShowForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Modal de detalle */}
      <Dialog open={showDetail} onClose={() => setShowDetail(false)} maxWidth="md" fullWidth>
        <DialogTitle>Detalles del Guía</DialogTitle>
        <DialogContent>
          <GuiaDetail guia={selectedGuia} onEdit={() => handleEditGuia(selectedGuia)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDetail(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
