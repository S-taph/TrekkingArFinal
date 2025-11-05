import { useState, useEffect } from "react"
import {
  Box,
  Typography,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  CircularProgress,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip
} from "@mui/material"
import AddIcon from "@mui/icons-material/Add"
import SendIcon from "@mui/icons-material/Send"
import DeleteIcon from "@mui/icons-material/Delete"
import EditIcon from "@mui/icons-material/Edit"
import CampaignIcon from "@mui/icons-material/Campaign"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import { campaniasAPI, newsletterAPI } from "../../services/api"

const CampaniasManager = () => {
  const [campanias, setCampanias] = useState([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [editingCampania, setEditingCampania] = useState(null)
  const [suscriptoresStats, setSuscriptoresStats] = useState(null)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  })

  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    asunto: "",
    cuerpo: "",
    tipo_campania: "informativa",
    imagen_campania: "",
    descuento_porcentaje: "",
    codigo_descuento: ""
  })

  // Cargar campañas y stats
  const loadCampanias = async () => {
    try {
      setLoading(true)
      const [campaniasResponse, statsResponse] = await Promise.all([
        campaniasAPI.getAll(),
        newsletterAPI.getStats()
      ])

      setCampanias(campaniasResponse.data)
      setSuscriptoresStats(statsResponse.data)
    } catch (err) {
      console.error("Error cargando campañas:", err)
      showSnackbar("Error al cargar las campañas", "error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCampanias()
  }, [])

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity })
  }

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false })
  }

  const handleOpenDialog = (campania = null) => {
    if (campania) {
      setEditingCampania(campania)
      setFormData({
        nombre: campania.nombre || "",
        descripcion: campania.descripcion || "",
        asunto: campania.asunto || "",
        cuerpo: campania.cuerpo || "",
        tipo_campania: campania.tipo_campania || "informativa",
        imagen_campania: campania.imagen_campania || "",
        descuento_porcentaje: campania.descuento_porcentaje || "",
        codigo_descuento: campania.codigo_descuento || ""
      })
    } else {
      setEditingCampania(null)
      setFormData({
        nombre: "",
        descripcion: "",
        asunto: "",
        cuerpo: "",
        tipo_campania: "informativa",
        imagen_campania: "",
        descuento_porcentaje: "",
        codigo_descuento: ""
      })
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingCampania(null)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSaveCampania = async () => {
    try {
      // Validaciones
      if (!formData.nombre || !formData.asunto || !formData.cuerpo) {
        showSnackbar("Por favor completa todos los campos obligatorios", "error")
        return
      }

      const campaniaData = { ...formData }

      // Convertir valores vacíos a null
      if (!campaniaData.descuento_porcentaje) campaniaData.descuento_porcentaje = null
      if (!campaniaData.codigo_descuento) campaniaData.codigo_descuento = null
      if (!campaniaData.imagen_campania) campaniaData.imagen_campania = null

      if (editingCampania) {
        await campaniasAPI.update(editingCampania.id_campania, campaniaData)
        showSnackbar("Campaña actualizada exitosamente", "success")
      } else {
        await campaniasAPI.create(campaniaData)
        showSnackbar("Campaña creada exitosamente", "success")
      }

      handleCloseDialog()
      loadCampanias()
    } catch (err) {
      console.error("Error guardando campaña:", err)
      showSnackbar(err.message || "Error al guardar la campaña", "error")
    }
  }

  const handleSendCampania = async (campania) => {
    if (
      !window.confirm(
        `¿Estás seguro de enviar la campaña "${campania.nombre}" a ${suscriptoresStats?.activos || 0} suscriptores activos?`
      )
    ) {
      return
    }

    try {
      const response = await campaniasAPI.send(campania.id_campania)
      showSnackbar(response.message, "success")
      loadCampanias()
    } catch (err) {
      console.error("Error enviando campaña:", err)
      showSnackbar(err.message || "Error al enviar la campaña", "error")
    }
  }

  const handleDeleteCampania = async (campania) => {
    if (!window.confirm(`¿Estás seguro de eliminar la campaña "${campania.nombre}"?`)) {
      return
    }

    try {
      await campaniasAPI.delete(campania.id_campania)
      showSnackbar("Campaña eliminada exitosamente", "success")
      loadCampanias()
    } catch (err) {
      console.error("Error eliminando campaña:", err)
      showSnackbar(err.message || "Error al eliminar la campaña", "error")
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleDateString("es-AR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Campañas Newsletter
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ bgcolor: "#1E7A5F", "&:hover": { bgcolor: "#155a47" } }}
        >
          Nueva Campaña
        </Button>
      </Box>

      {/* Estadísticas */}
      {suscriptoresStats && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>{suscriptoresStats.activos}</strong> suscriptores activos recibirán las campañas
          </Typography>
        </Alert>
      )}

      {/* Lista de campañas */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) : campanias.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <CampaignIcon sx={{ fontSize: 60, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No hay campañas creadas
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Crea tu primera campaña de newsletter
          </Typography>
          <Button variant="contained" onClick={() => handleOpenDialog()}>
            Crear Primera Campaña
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {campanias.map((campania) => (
            <Grid item xs={12} md={6} lg={4} key={campania.id_campania}>
              <Card elevation={2}>
                <CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {campania.nombre}
                    </Typography>
                    {campania.enviada && (
                      <Chip
                        label="Enviada"
                        color="success"
                        size="small"
                        icon={<CheckCircleIcon />}
                      />
                    )}
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    <strong>Asunto:</strong> {campania.asunto}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {campania.descripcion || campania.cuerpo.substring(0, 100) + "..."}
                  </Typography>

                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
                    <Chip label={campania.tipo_campania} size="small" />
                    {campania.codigo_descuento && (
                      <Chip
                        label={`Código: ${campania.codigo_descuento}`}
                        size="small"
                        color="secondary"
                      />
                    )}
                    {campania.descuento_porcentaje && (
                      <Chip
                        label={`${campania.descuento_porcentaje}% OFF`}
                        size="small"
                        color="error"
                      />
                    )}
                  </Box>

                  {campania.enviada && (
                    <Typography variant="caption" color="text.secondary">
                      Enviada el {formatDate(campania.fecha_envio)} a {campania.total_enviados}{" "}
                      suscriptores
                    </Typography>
                  )}
                </CardContent>

                <CardActions sx={{ justifyContent: "space-between", px: 2, pb: 2 }}>
                  <Box>
                    {!campania.enviada && (
                      <>
                        <Tooltip title="Editar">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(campania)}
                            color="primary"
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteCampania(campania)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </Box>

                  {!campania.enviada && (
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<SendIcon />}
                      onClick={() => handleSendCampania(campania)}
                      sx={{ bgcolor: "#D98B3A", "&:hover": { bgcolor: "#c47a2f" } }}
                    >
                      Enviar
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Dialog para crear/editar campaña */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingCampania ? "Editar Campaña" : "Nueva Campaña"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nombre de la Campaña *"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                placeholder="Ej: Promoción Verano 2025"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Asunto del Email *"
                name="asunto"
                value={formData.asunto}
                onChange={handleInputChange}
                placeholder="Ej: ¡Descuento especial en tus próximas aventuras!"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={6}
                label="Cuerpo del Mensaje *"
                name="cuerpo"
                value={formData.cuerpo}
                onChange={handleInputChange}
                placeholder="Escribe el contenido del email aquí..."
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Tipo de Campaña</InputLabel>
                <Select
                  name="tipo_campania"
                  value={formData.tipo_campania}
                  label="Tipo de Campaña"
                  onChange={handleInputChange}
                >
                  <MenuItem value="informativa">Informativa</MenuItem>
                  <MenuItem value="promocion">Promoción</MenuItem>
                  <MenuItem value="descuento">Descuento</MenuItem>
                  <MenuItem value="temporada">Temporada</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="URL Imagen (opcional)"
                name="imagen_campania"
                value={formData.imagen_campania}
                onChange={handleInputChange}
                placeholder="https://ejemplo.com/imagen.jpg"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Código de Descuento (opcional)"
                name="codigo_descuento"
                value={formData.codigo_descuento}
                onChange={handleInputChange}
                placeholder="VERANO2025"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="% Descuento (opcional)"
                name="descuento_porcentaje"
                value={formData.descuento_porcentaje}
                onChange={handleInputChange}
                inputProps={{ min: 0, max: 100 }}
                placeholder="20"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Descripción interna (opcional)"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                placeholder="Descripción para uso interno"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button variant="contained" onClick={handleSaveCampania}>
            {editingCampania ? "Actualizar" : "Crear"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default CampaniasManager
