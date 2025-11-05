import { useState, useEffect, memo } from "react"
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid2,
  Chip,
  Alert,
  CircularProgress,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Autocomplete,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Collapse,
} from "@mui/material"
import { Add, Edit, Delete, CalendarMonth, Person, ExpandMore, ExpandLess } from "@mui/icons-material"
import { viajesAPI, guiasAPI } from "../../services/api"

/**
 * Componente auxiliar para mostrar guías asignados en la tabla
 * Memoizado para evitar re-renders innecesarios
 */
const GuiasCell = memo(({ fechaId }) => {
  const [guias, setGuias] = useState([])
  const [loadingGuias, setLoadingGuias] = useState(true)

  useEffect(() => {
    const loadGuias = async () => {
      try {
        setLoadingGuias(true)
        const response = await guiasAPI.getGuiasByFecha(fechaId)
        if (response.success) {
          setGuias(response.data.asignaciones || [])
        }
      } catch (error) {
        console.error("Error cargando guías:", error)
        setGuias([])
      } finally {
        setLoadingGuias(false)
      }
    }
    loadGuias()
  }, [fechaId])

  if (loadingGuias) {
    return <CircularProgress size={20} />
  }

  if (guias.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        Sin asignar
      </Typography>
    )
  }

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
      {guias.map((asignacion) => (
        <Chip
          key={asignacion.id_guia_viaje}
          icon={<Person />}
          label={`${asignacion.guia.usuario?.nombre || "Guía"} (${asignacion.rol_guia})`}
          size="small"
          variant="outlined"
        />
      ))}
    </Box>
  )
})

GuiasCell.displayName = 'GuiasCell'

/**
 * FechasViajeManager - Componente para gestionar múltiples fechas de un viaje
 */
export default function FechasViajeManager({ viajeId }) {
  const [fechas, setFechas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingFecha, setEditingFecha] = useState(null)
  const [formData, setFormData] = useState({
    fecha_inicio: "",
    fecha_fin: "",
    cupos_disponibles: 10,
    precio_fecha: "",
    estado_fecha: "disponible",
    observaciones: "",
  })

  // Estado para asignación de guías
  const [guiasDisponibles, setGuiasDisponibles] = useState([])
  const [guiasAsignados, setGuiasAsignados] = useState([])
  const [selectedGuia, setSelectedGuia] = useState(null)
  const [guiaFormData, setGuiaFormData] = useState({
    rol_guia: "principal",
    tarifa_acordada: "",
    estado_asignacion: "asignado",
    observaciones: "",
  })
  const [showGuiasSection, setShowGuiasSection] = useState(false)

  useEffect(() => {
    if (viajeId) {
      loadFechas()
    }
  }, [viajeId])

  // Cargar guías disponibles cuando se abre el diálogo
  useEffect(() => {
    if (dialogOpen) {
      loadGuiasDisponibles()
      if (editingFecha) {
        loadGuiasAsignados(editingFecha.id_fechas_viaje)
      }
    }
  }, [dialogOpen, editingFecha])

  const loadGuiasDisponibles = async () => {
    try {
      const response = await guiasAPI.getGuias({ disponible: true, activo: true })
      if (response.success) {
        setGuiasDisponibles(response.data.guias || [])
      }
    } catch (error) {
      console.error("Error cargando guías:", error)
    }
  }

  const loadGuiasAsignados = async (fechaId) => {
    try {
      const response = await guiasAPI.getGuiasByFecha(fechaId)
      if (response.success) {
        setGuiasAsignados(response.data.asignaciones || [])
      }
    } catch (error) {
      console.error("Error cargando guías asignados:", error)
      setGuiasAsignados([])
    }
  }

  const loadFechas = async () => {
    try {
      setLoading(true)
      setError("")
      const response = await viajesAPI.getFechasViaje(viajeId)
      if (response.success) {
        setFechas(response.data.fechas || [])
      }
    } catch (error) {
      console.error("Error cargando fechas:", error)
      setError(error.message || "Error al cargar las fechas")
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingFecha(null)
    setFormData({
      fecha_inicio: "",
      fecha_fin: "",
      cupos_disponibles: 10,
      precio_fecha: "",
      estado_fecha: "disponible",
      observaciones: "",
    })
    setGuiasAsignados([])
    resetGuiaForm()
    setShowGuiasSection(false)
    setDialogOpen(true)
  }

  const handleEdit = (fecha) => {
    setEditingFecha(fecha)
    setFormData({
      fecha_inicio: fecha.fecha_inicio?.split("T")[0] || "",
      fecha_fin: fecha.fecha_fin?.split("T")[0] || "",
      cupos_disponibles: fecha.cupos_disponibles || 10,
      precio_fecha: fecha.precio_fecha || "",
      estado_fecha: fecha.estado_fecha || "disponible",
      observaciones: fecha.observaciones || "",
    })
    setGuiasAsignados([])
    resetGuiaForm()
    setShowGuiasSection(false)
    setDialogOpen(true)
  }

  const handleDelete = async (fechaId) => {
    if (!window.confirm("¿Eliminar esta fecha de salida?")) return

    try {
      await viajesAPI.deleteFechaViaje(viajeId, fechaId)
      loadFechas()
    } catch (error) {
      console.error("Error eliminando fecha:", error)
      setError(error.message || "Error al eliminar la fecha")
    }
  }

  const handleSave = async () => {
    try {
      setError("")

      // Validaciones
      if (!formData.fecha_inicio || !formData.fecha_fin) {
        setError("Las fechas de inicio y fin son requeridas")
        return
      }

      if (new Date(formData.fecha_inicio) > new Date(formData.fecha_fin)) {
        setError("La fecha de fin no puede ser anterior a la fecha de inicio")
        return
      }

      if (editingFecha) {
        await viajesAPI.updateFechaViaje(viajeId, editingFecha.id_fechas_viaje, formData)
      } else {
        // Crear la fecha primero
        const response = await viajesAPI.createFechaViaje(viajeId, formData)

        // Si hay guías asignados en estado local, guardarlos
        if (response.success && guiasAsignados.length > 0) {
          const fechaId = response.data.fecha.id_fechas_viaje

          // Asignar cada guía a la fecha recién creada
          for (const asignacion of guiasAsignados) {
            try {
              await guiasAPI.asignarGuiaAFecha({
                id_guia: asignacion.id_guia,
                id_fecha_viaje: fechaId,
                rol_guia: asignacion.rol_guia,
                tarifa_acordada: asignacion.tarifa_acordada,
                estado_asignacion: asignacion.estado_asignacion,
                observaciones: asignacion.observaciones,
              })
            } catch (guiaError) {
              console.error("Error asignando guía:", guiaError)
              // Continuar con los demás guías aunque falle uno
            }
          }
        }
      }

      setDialogOpen(false)
      loadFechas()
    } catch (error) {
      console.error("Error guardando fecha:", error)
      setError(error.message || "Error al guardar la fecha")
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleGuiaFormChange = (e) => {
    const { name, value } = e.target
    setGuiaFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleAsignarGuia = async () => {
    if (!selectedGuia) {
      setError("Selecciona un guía")
      return
    }

    if (!editingFecha) {
      // Si estamos creando una fecha nueva, agregar al estado local
      const newAsignacion = {
        id_guia: selectedGuia.id_guia,
        guia: selectedGuia,
        ...guiaFormData,
        // ID temporal para poder eliminar antes de guardar
        tempId: Date.now(),
      }
      setGuiasAsignados([...guiasAsignados, newAsignacion])
      resetGuiaForm()
      return
    }

    // Si estamos editando, guardar en el backend
    try {
      await guiasAPI.asignarGuiaAFecha({
        id_guia: selectedGuia.id_guia,
        id_fecha_viaje: editingFecha.id_fechas_viaje,
        ...guiaFormData,
      })
      await loadGuiasAsignados(editingFecha.id_fechas_viaje)
      resetGuiaForm()
    } catch (error) {
      console.error("Error asignando guía:", error)
      setError(error.message || "Error al asignar guía")
    }
  }

  const handleRemoverGuia = async (asignacion) => {
    if (!editingFecha) {
      // Si estamos creando, solo remover del estado local
      setGuiasAsignados(guiasAsignados.filter((a) => a.tempId !== asignacion.tempId))
      return
    }

    // Si estamos editando, eliminar del backend
    if (!window.confirm("¿Eliminar este guía de la fecha?")) return

    try {
      await guiasAPI.removeGuiaFromFecha(asignacion.id_guia_viaje)
      await loadGuiasAsignados(editingFecha.id_fechas_viaje)
    } catch (error) {
      console.error("Error removiendo guía:", error)
      setError(error.message || "Error al remover guía")
    }
  }

  const resetGuiaForm = () => {
    setSelectedGuia(null)
    setGuiaFormData({
      rol_guia: "principal",
      tarifa_acordada: "",
      estado_asignacion: "asignado",
      observaciones: "",
    })
  }

  const formatDate = (dateString) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleDateString("es-AR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getEstadoChip = (estado) => {
    const config = {
      disponible: { label: "Disponible", color: "success" },
      completo: { label: "Completo", color: "warning" },
      cancelado: { label: "Cancelado", color: "error" },
    }
    const { label, color } = config[estado] || config.disponible
    return <Chip label={label} color={color} size="small" />
  }

  if (!viajeId) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        Guarda el viaje primero para poder añadir fechas de salida
      </Alert>
    )
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CalendarMonth color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Fechas de Salida
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={handleCreate} size="medium">
          Añadir Fecha
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : fechas.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center", bgcolor: "grey.50" }}>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            No hay fechas de salida configuradas
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Añade fechas para que los usuarios puedan reservar este viaje
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Fecha Inicio</TableCell>
                <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Fecha Fin</TableCell>
                <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Cupos Disp.</TableCell>
                <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Cupos Ocup.</TableCell>
                <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Precio</TableCell>
                <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Guías</TableCell>
                <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Estado</TableCell>
                <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {fechas.map((fecha) => (
                <TableRow key={fecha.id_fechas_viaje}>
                  <TableCell sx={{ fontSize: '0.75rem' }}>{formatDate(fecha.fecha_inicio)}</TableCell>
                  <TableCell sx={{ fontSize: '0.75rem' }}>{formatDate(fecha.fecha_fin)}</TableCell>
                  <TableCell sx={{ fontSize: '0.75rem' }}>{fecha.cupos_disponibles}</TableCell>
                  <TableCell sx={{ fontSize: '0.75rem' }}>{fecha.cupos_ocupados || 0}</TableCell>
                  <TableCell sx={{ fontSize: '0.75rem' }}>
                    {fecha.precio_fecha ? `$${parseFloat(fecha.precio_fecha).toLocaleString()}` : "Precio base"}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.75rem' }}>
                    <GuiasCell fechaId={fecha.id_fechas_viaje} />
                  </TableCell>
                  <TableCell>{getEstadoChip(fecha.estado_fecha)}</TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleEdit(fecha)} color="primary">
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(fecha.id_fechas_viaje)}
                      color="error"
                      disabled={fecha.cupos_ocupados > 0}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Dialog para crear/editar fecha */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingFecha ? "Editar Fecha de Salida" : "Nueva Fecha de Salida"}</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
              {error}
            </Alert>
          )}
          <Grid2 container spacing={3} sx={{ mt: 1 }}>
            <Grid2 item xs={12} md={6}>
              <TextField
                fullWidth
                required
                type="date"
                name="fecha_inicio"
                label="Fecha de Inicio"
                value={formData.fecha_inicio}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                helperText="Fecha de inicio del viaje"
              />
            </Grid2>

            <Grid2 item xs={12} md={6}>
              <TextField
                fullWidth
                required
                type="date"
                name="fecha_fin"
                label="Fecha de Fin"
                value={formData.fecha_fin}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                helperText="Fecha de finalización del viaje"
              />
            </Grid2>

            <Grid2 item xs={12} md={6}>
              <TextField
                fullWidth
                required
                type="number"
                name="cupos_disponibles"
                label="Cupos Disponibles"
                value={formData.cupos_disponibles}
                onChange={handleChange}
                inputProps={{ min: 1 }}
                helperText="Cantidad máxima de participantes"
              />
            </Grid2>

            <Grid2 item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                name="precio_fecha"
                label="Precio Especial (Opcional)"
                value={formData.precio_fecha}
                onChange={handleChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                helperText="Deja vacío para usar el precio base del viaje"
              />
            </Grid2>

            <Grid2 item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Estado</InputLabel>
                <Select name="estado_fecha" value={formData.estado_fecha} label="Estado" onChange={handleChange}>
                  <MenuItem value="disponible">Disponible</MenuItem>
                  <MenuItem value="completo">Completo</MenuItem>
                  <MenuItem value="cancelado">Cancelado</MenuItem>
                </Select>
              </FormControl>
            </Grid2>

            <Grid2 item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                name="observaciones"
                label="Observaciones"
                value={formData.observaciones}
                onChange={handleChange}
                helperText="Información adicional sobre esta salida"
              />
            </Grid2>
          </Grid2>

          {/* Sección de Asignación de Guías */}
          <Box sx={{ mt: 3 }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={showGuiasSection ? <ExpandLess /> : <ExpandMore />}
              onClick={() => setShowGuiasSection(!showGuiasSection)}
              sx={{ mb: 2 }}
            >
              Asignar Guías ({guiasAsignados.length})
            </Button>

            <Collapse in={showGuiasSection}>
              <Box sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 1 }}>
                {/* Formulario para agregar guía */}
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                  Agregar Guía
                </Typography>

                <Grid2 container spacing={2} sx={{ mb: 2 }}>
                  <Grid2 item xs={12}>
                    <Autocomplete
                      options={guiasDisponibles}
                      value={selectedGuia}
                      onChange={(e, newValue) => {
                        setSelectedGuia(newValue)
                        if (newValue?.tarifa_por_dia) {
                          setGuiaFormData((prev) => ({
                            ...prev,
                            tarifa_acordada: newValue.tarifa_por_dia,
                          }))
                        }
                      }}
                      getOptionLabel={(option) =>
                        `${option.usuario?.nombre || ""} ${option.usuario?.apellido || ""} - ${option.especialidades || ""}`
                      }
                      renderInput={(params) => <TextField {...params} label="Seleccionar Guía" size="small" />}
                      isOptionEqualToValue={(option, value) => option.id_guia === value.id_guia}
                    />
                  </Grid2>

                  <Grid2 item xs={12} md={4}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Rol</InputLabel>
                      <Select name="rol_guia" value={guiaFormData.rol_guia} label="Rol" onChange={handleGuiaFormChange}>
                        <MenuItem value="principal">Principal</MenuItem>
                        <MenuItem value="asistente">Asistente</MenuItem>
                        <MenuItem value="especialista">Especialista</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid2>

                  <Grid2 item xs={12} md={4}>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      name="tarifa_acordada"
                      label="Tarifa Acordada"
                      value={guiaFormData.tarifa_acordada}
                      onChange={handleGuiaFormChange}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                    />
                  </Grid2>

                  <Grid2 item xs={12} md={4}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Estado</InputLabel>
                      <Select
                        name="estado_asignacion"
                        value={guiaFormData.estado_asignacion}
                        label="Estado"
                        onChange={handleGuiaFormChange}
                      >
                        <MenuItem value="asignado">Asignado</MenuItem>
                        <MenuItem value="confirmado">Confirmado</MenuItem>
                        <MenuItem value="cancelado">Cancelado</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid2>

                  <Grid2 item xs={12}>
                    <Button variant="contained" onClick={handleAsignarGuia} fullWidth size="small" disabled={!selectedGuia}>
                      Agregar Guía
                    </Button>
                  </Grid2>
                </Grid2>

                <Divider sx={{ my: 2 }} />

                {/* Lista de guías asignados */}
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                  Guías Asignados
                </Typography>

                {guiasAsignados.length === 0 ? (
                  <Alert severity="info" sx={{ mt: 1 }}>
                    No hay guías asignados aún
                  </Alert>
                ) : (
                  <List dense>
                    {guiasAsignados.map((asignacion) => (
                      <ListItem
                        key={asignacion.id_guia_viaje || asignacion.tempId}
                        sx={{
                          border: "1px solid",
                          borderColor: "divider",
                          borderRadius: 1,
                          mb: 1,
                        }}
                      >
                        <ListItemText
                          primary={
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Person fontSize="small" />
                              <Typography variant="body2" fontWeight={600}>
                                {asignacion.guia?.usuario?.nombre || "Guía"}{" "}
                                {asignacion.guia?.usuario?.apellido || ""}
                              </Typography>
                              <Chip label={asignacion.rol_guia} size="small" />
                            </Box>
                          }
                          secondary={
                            <Box sx={{ display: "flex", gap: 2, mt: 0.5 }}>
                              <Typography variant="caption">
                                Tarifa: ${parseFloat(asignacion.tarifa_acordada || 0).toLocaleString()}
                              </Typography>
                              <Typography variant="caption">Estado: {asignacion.estado_asignacion}</Typography>
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          <IconButton size="small" onClick={() => handleRemoverGuia(asignacion)} color="error">
                            <Delete fontSize="small" />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                )}
              </Box>
            </Collapse>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave}>
            {editingFecha ? "Actualizar" : "Crear"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
