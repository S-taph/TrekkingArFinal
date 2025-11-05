"use client"

import { useState, useEffect } from "react"
import {
  Box,
  TextField,
  Button,
  Grid2,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  Card,
  CardMedia,
  CardActions,
  CardContent,
  IconButton,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Divider,
  Autocomplete,
} from "@mui/material"
import CloudUploadIcon from "@mui/icons-material/CloudUpload"
import DeleteIcon from "@mui/icons-material/Delete"
import ImageIcon from "@mui/icons-material/Image"
import CloseIcon from "@mui/icons-material/Close"
import CenterFocusStrongIcon from "@mui/icons-material/CenterFocusStrong"
import CalendarMonth from "@mui/icons-material/CalendarMonth"
import { viajesAPI, categoriasAPI } from "../../services/api"
import FechasViajeManager from "./FechasViajeManager"
import ImageFocusControl from "./ImageFocusControl"

export default function ViajeForm({ viaje, mode, onSuccess, onCancel }) {
  // Estado principal del formulario
  const [formData, setFormData] = useState({
    id_categoria: "",
    destino: "",
    titulo: "",
    descripcion_corta: "",
    descripcion_completa: "",
    dificultad: "",
    duracion_dias: "",
    precio_base: "",
    minimo_participantes: "",
    maximo_participantes: "",
    incluye: "",
    no_incluye: "",
    recomendaciones: "",
    activo: true,
    destacado: false,
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Estado para validación por campo
  const [fieldErrors, setFieldErrors] = useState({})

  // Datos para selects
  const [categorias, setCategorias] = useState([])
  const [loadingCategorias, setLoadingCategorias] = useState(true)
  const [destinos, setDestinos] = useState([])
  const [loadingDestinos, setLoadingDestinos] = useState(true)

  // Image management state
  const [selectedImages, setSelectedImages] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  const [existingImages, setExistingImages] = useState([])
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxImage, setLightboxImage] = useState(null)

  // Focus control dialog state
  const [focusDialogOpen, setFocusDialogOpen] = useState(false)
  const [selectedImageForFocus, setSelectedImageForFocus] = useState(null)
  const [tempFocusPoint, setTempFocusPoint] = useState('center')

  // Confirmation dialog for creating trip without dates
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [pendingSubmit, setPendingSubmit] = useState(null)

  useEffect(() => {
    const loadCategorias = async () => {
      try {
        setLoadingCategorias(true)
        const data = await categoriasAPI.getCategorias()
        if (data.success && data.data.categorias.length > 0) {
          setCategorias(data.data.categorias)
        } else {
          await createDefaultCategories()
        }
      } catch (error) {
        console.error("Error loading categories:", error)
        await createDefaultCategories()
      } finally {
        setLoadingCategorias(false)
      }
    }

    const createDefaultCategories = async () => {
      const defaultCategories = [
        { nombre: "Trekking", descripcion: "Caminatas y senderismo", activa: true, orden_visualizacion: 1 },
        { nombre: "Montañismo", descripcion: "Escalada y montañismo", activa: true, orden_visualizacion: 2 },
        { nombre: "Aventura", descripcion: "Actividades de aventura", activa: true, orden_visualizacion: 3 },
        { nombre: "Expedición", descripcion: "Expediciones largas", activa: true, orden_visualizacion: 4 },
      ]

      const createdCategories = []

      // ✅ Usar variable de entorno para la API
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3003/api"

      for (const category of defaultCategories) {
        try {
          const response = await fetch(`${API_BASE_URL}/categorias`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-bypass-auth": "true",
            },
            body: JSON.stringify(category),
          })

          if (response.ok) {
            const result = await response.json()
            if (result.success) {
              createdCategories.push(result.data.categoria)
            }
          }
        } catch (error) {
          console.error("Error creating category:", category.nombre, error)
        }
      }

      if (createdCategories.length > 0) {
        setCategorias(createdCategories)
      } else {
        setCategorias([
          { id_categoria: 1, nombre: "Trekking" },
          { id_categoria: 2, nombre: "Montañismo" },
          { id_categoria: 3, nombre: "Aventura" },
          { id_categoria: 4, nombre: "Expedición" },
        ])
      }
    }

    const loadDestinos = async () => {
      try {
        setLoadingDestinos(true)
        const response = await viajesAPI.getDestinos()
        if (response.success && response.data.destinos) {
          setDestinos(response.data.destinos)
        }
      } catch (error) {
        console.error("Error loading destinos:", error)
        setDestinos([])
      } finally {
        setLoadingDestinos(false)
      }
    }

    loadCategorias()
    loadDestinos()
  }, [])

  useEffect(() => {
    if (mode === "edit" && viaje) {
      setFormData({
        id_categoria: viaje.id_categoria || "",
        destino: viaje.destino?.nombre || "",
        titulo: viaje.titulo || "",
        descripcion_corta: viaje.descripcion_corta || "",
        descripcion_completa: viaje.descripcion_completa || "",
        dificultad: viaje.dificultad || "",
        duracion_dias: viaje.duracion_dias || "",
        precio_base: viaje.precio_base || "",
        minimo_participantes: viaje.minimo_participantes || "",
        maximo_participantes: viaje.maximo_participantes || "",
        incluye: viaje.incluye || "",
        no_incluye: viaje.no_incluye || "",
        recomendaciones: viaje.recomendaciones || "",
        activo: viaje.activo !== undefined ? viaje.activo : true,
        destacado: viaje.destacado !== undefined ? viaje.destacado : false,
      })

      // Load existing images if in edit mode
      if (viaje.imagenes && Array.isArray(viaje.imagenes)) {
        setExistingImages(viaje.imagenes)
      }
    }
  }, [viaje, mode])

  // Función para validar un campo individual
  const validateField = (name, value) => {
    let errorMessage = ""

    switch (name) {
      case "id_categoria":
        if (!value || value === "") {
          errorMessage = "Debe seleccionar una categoría"
        }
        break
      case "destino":
        if (!value || value.trim() === "") {
          errorMessage = "El destino es requerido"
        }
        break
      case "titulo":
        if (!value || value.trim() === "") {
          errorMessage = "El título es requerido"
        }
        break
      case "descripcion_corta":
        if (!value || value.trim() === "") {
          errorMessage = "La descripción corta es requerida"
        }
        break
      case "descripcion_completa":
        if (!value || value.trim() === "") {
          errorMessage = "La descripción completa es requerida"
        }
        break
      case "dificultad":
        if (!value || value === "") {
          errorMessage = "Debe seleccionar una dificultad"
        }
        break
      case "duracion_dias":
        if (!value || Number(value) <= 0) {
          errorMessage = "La duración debe ser mayor a 0"
        }
        break
      case "precio_base":
        if (!value || Number(value) <= 0) {
          errorMessage = "El precio debe ser mayor a 0"
        }
        break
      case "minimo_participantes":
        if (!value || Number(value) <= 0) {
          errorMessage = "El mínimo de participantes debe ser mayor a 0"
        }
        break
      case "maximo_participantes": {
        const minimo = Number(formData.minimo_participantes)
        const maximo = Number(value)
        if (!value || maximo <= 0) {
          errorMessage = "El máximo de participantes debe ser mayor a 0"
        } else if (minimo > 0 && maximo < minimo) {
          errorMessage = "El máximo debe ser mayor o igual al mínimo"
        }
        break
      }
      case "incluye":
        if (!value || value.trim() === "") {
          errorMessage = "Debe especificar qué incluye el viaje"
        }
        break
      case "no_incluye":
        if (!value || value.trim() === "") {
          errorMessage = "Debe especificar qué NO incluye el viaje"
        }
        break
      case "recomendaciones":
        if (!value || value.trim() === "") {
          errorMessage = "Las recomendaciones son requeridas"
        }
        break
      default:
        break
    }

    return errorMessage
  }

  // Función para validar todos los campos
  const validateAll = () => {
    const errors = {}

    // Validar cada campo obligatorio
    Object.keys(formData).forEach((key) => {
      if (key !== "activo") { // activo siempre tiene valor
        const error = validateField(key, formData[key])
        if (error) {
          errors[key] = error
        }
      }
    })

    // Validación especial: máximo >= mínimo
    if (formData.minimo_participantes && formData.maximo_participantes) {
      const minimo = Number(formData.minimo_participantes)
      const maximo = Number(formData.maximo_participantes)
      if (maximo < minimo) {
        errors.maximo_participantes = "El máximo debe ser mayor o igual al mínimo"
      }
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    // Convertir booleanos correctamente para el Select de activo
    let finalValue = type === "checkbox" ? checked : value

    if (name === "activo") {
      // Asegurar que el valor sea booleano
      finalValue = value === true || value === "true"
    }

    setFormData((prev) => ({
      ...prev,
      [name]: finalValue,
    }))

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  // Validación onBlur para campos individuales
  const handleBlur = (e) => {
    const { name, value } = e.target
    const error = validateField(name, value)

    if (error) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: error,
      }))
    }
  }

  // Image handling functions
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    setSelectedImages((prev) => [...prev, ...files])

    // Create preview URLs
    const newPreviews = files.map((file) => ({
      url: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
    }))
    setImagePreviews((prev) => [...prev, ...newPreviews])
  }

  const removeNewImage = (index) => {
    // Revoke the preview URL to free memory
    URL.revokeObjectURL(imagePreviews[index].url)

    setSelectedImages((prev) => prev.filter((_, i) => i !== index))
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
  }
  // Usar el servicio de API centralizado para eliminar la imagen
  const removeExistingImage = async (imageId) => {
    try {
      // 1. Llamar al nuevo método de API DELETE
      await viajesAPI.deleteImage(viaje.id_viaje, imageId)

      // 2. Si la llamada fue exitosa, actualizar el estado
      setExistingImages((prev) => prev.filter((img) => img.id_imagen_viaje !== imageId))
      setError("")
    } catch (error) {
      console.error("Error deleting image:", error)
      setError(error.message || "Error al eliminar la imagen")
    }
  }

  // Handler para abrir el diálogo de control de foco
  const openFocusDialog = (image) => {
    setSelectedImageForFocus(image)
    setTempFocusPoint(image.focus_point || 'center')
    setFocusDialogOpen(true)
  }

  // Handler para cerrar el diálogo
  const closeFocusDialog = () => {
    setFocusDialogOpen(false)
    setSelectedImageForFocus(null)
    setTempFocusPoint('center')
  }

  // Handler para guardar el punto focal
  const saveFocusPoint = async () => {
    if (!selectedImageForFocus) return

    try {
      // Actualizar vía API
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3003/api"
      const response = await fetch(
        `${API_BASE_URL}/viajes/${viaje.id_viaje}/imagenes/${selectedImageForFocus.id_imagen_viaje}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'x-bypass-auth': 'true',
          },
          body: JSON.stringify({ focus_point: tempFocusPoint })
        }
      )

      if (!response.ok) {
        throw new Error('Error al actualizar el punto focal')
      }

      // Actualizar el estado local
      setExistingImages(prev =>
        prev.map(img =>
          img.id_imagen_viaje === selectedImageForFocus.id_imagen_viaje
            ? { ...img, focus_point: tempFocusPoint }
            : img
        )
      )

      closeFocusDialog()
      setError('')
    } catch (error) {
      console.error('Error saving focus point:', error)
      setError(error.message || 'Error al guardar el punto focal')
    }
  }

  const uploadImages = async (viajeId, files) => {
    if (!files || files.length === 0) return []

    try {
      const result = await viajesAPI.uploadImages(viajeId, files)
      return result.data?.urls || []
    } catch (err) {
      console.error("Error uploading images:", err)
      throw err
    }
  }


  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validar todos los campos antes de enviar
    const isValid = validateAll()
    if (!isValid) {
      setError("Por favor, corrija los errores en el formulario antes de continuar")
      return
    }

    // Si es modo creación, verificar si tiene fechas disponibles
    // En modo edición, no mostramos el diálogo porque se pueden agregar fechas después
    if (mode === "create") {
      // Verificar si el viaje tiene fechas disponibles
      // Como estamos creando, nunca tendrá fechas, así que siempre mostramos confirmación
      setPendingSubmit(true)
      setConfirmDialogOpen(true)
      return
    }

    // Si es modo edición o el usuario confirmó, proceder normalmente
    await executeSubmit()
  }

  const executeSubmit = async () => {
    setLoading(true)
    setError("")

    try {
      // Prepara datos para el backend
      const submitData = {
        id_categoria: formData.id_categoria || null,
        destino: formData.destino?.trim() || "",
        titulo: formData.titulo?.trim() || "",
        descripcion_corta: formData.descripcion_corta?.trim() || "",
        descripcion_completa: formData.descripcion_completa?.trim() || "",
        dificultad: formData.dificultad || "",
        duracion_dias: formData.duracion_dias ? Number.parseInt(formData.duracion_dias, 10) : 0,
        precio_base: formData.precio_base ? Number.parseFloat(formData.precio_base) : 0,
        minimo_participantes: formData.minimo_participantes ? Number.parseInt(formData.minimo_participantes, 10) : 1,
        maximo_participantes: formData.maximo_participantes ? Number.parseInt(formData.maximo_participantes, 10) : null,
        incluye: formData.incluye?.trim() || "",
        no_incluye: formData.no_incluye?.trim() || "",
        recomendaciones: formData.recomendaciones?.trim() || "",
        activo: formData.activo === true || formData.activo === "true",
        destacado: formData.destacado === true || formData.destacado === "true",
        equipamiento: formData.equipamiento || [],
        servicios: formData.servicios || [],
      }

      console.log("[ViajeForm] Submit data:", submitData)
      console.log("[ViajeForm] Destino a enviar:", submitData.destino)

      // Llamada a API según modo
      let viajeId
      if (mode === "create") {
        console.log("[ViajeForm] Creando nuevo viaje con destino:", submitData.destino)
        const result = await viajesAPI.createViaje(submitData)
        viajeId = result.data?.viaje?.id_viaje
        console.log("[ViajeForm] Viaje creado exitosamente con ID:", viajeId)

        if (result.data?.viaje?.id_destino) {
          console.log("[ViajeForm] Destino asignado con ID:", result.data.viaje.id_destino)
        }
      } else {
        console.log("[ViajeForm] Actualizando viaje ID:", viaje.id_viaje)
        await viajesAPI.updateViaje(viaje.id_viaje, submitData)
        viajeId = viaje.id_viaje
        console.log("[ViajeForm] Viaje actualizado con ID:", viajeId)
      }

      // Subir imágenes si hay seleccionadas
      if (viajeId && selectedImages.length > 0) {
        console.log("[ViajeForm] Subiendo", selectedImages.length, "imágenes...")
        const uploadedUrls = await uploadImages(viajeId, selectedImages)

        // Actualizar estado de imágenes existentes para edit mode
        if (mode === "edit") {
          setExistingImages((prev) => [
            ...prev,
            ...uploadedUrls.map((url, index) => ({
              id_imagen: Date.now() + index, // temporal
              url_imagen: url,
            })),
          ])
          setSelectedImages([])
          setImagePreviews([])
        }
      }

      onSuccess()
    } catch (error) {
      console.error("[ViajeForm] Error completo:", error)
      console.error("[ViajeForm] Error message:", error.message)
      console.error("[ViajeForm] Error response:", error.response?.data)

      // Mostrar mensaje de error más detallado
      let errorMessage = "Error al guardar el viaje"

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.response?.data?.errors) {
        // Si hay errores de validación específicos
        const validationErrors = error.response.data.errors
        errorMessage = validationErrors.map(err => err.msg).join(", ")
      } else if (error.message) {
        errorMessage = error.message
      }

      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmNoDatesProceed = async () => {
    setConfirmDialogOpen(false)
    setPendingSubmit(false)
    await executeSubmit()
  }

  const handleConfirmNoDatesCancel = () => {
    setConfirmDialogOpen(false)
    setPendingSubmit(false)
  }


  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      {/* Alert de error global */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Sección 1: Información Básica */}
      <Card sx={{ mb: 4, p: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: "primary.main", mb: 3 }}>
            Información Básica
          </Typography>

          <Grid2 container spacing={3}>
            {/* Título - primera posición */}
            <Grid2 xs={12} md={12} sx={{ width: '100%' }}>
              <TextField
                fullWidth
                required
                name="titulo"
                label="Título del Viaje"
                value={formData.titulo}
                onChange={handleChange}
                onBlur={handleBlur}
                error={Boolean(fieldErrors.titulo)}
                helperText={fieldErrors.titulo || ""}
              />
            </Grid2>

            {/* Categoría y Dificultad en la misma fila */}
            <Grid2 xs={12} md={6}>
              <FormControl
                fullWidth
                required
                error={Boolean(fieldErrors.id_categoria)}
                sx={{ minWidth: 200 }}
              >
                <InputLabel>Categoría</InputLabel>
                <Select
                  name="id_categoria"
                  value={formData.id_categoria}
                  label="Categoría"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={loadingCategorias}
                  displayEmpty
                >
                  {categorias.map((categoria) => (
                    <MenuItem key={categoria.id_categoria} value={categoria.id_categoria}>
                      {categoria.nombre}
                    </MenuItem>
                  ))}
                </Select>
                {fieldErrors.id_categoria && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                    {fieldErrors.id_categoria}
                  </Typography>
                )}
              </FormControl>
            </Grid2>

            <Grid2 xs={12} md={6}>
              <FormControl
                fullWidth
                required
                error={Boolean(fieldErrors.dificultad)}
                sx={{ minWidth: 200 }}
              >
                <InputLabel>Dificultad</InputLabel>
                <Select
                  name="dificultad"
                  value={formData.dificultad}
                  label="Dificultad"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  displayEmpty
                >
                  <MenuItem value="facil">Fácil</MenuItem>
                  <MenuItem value="moderado">Moderado</MenuItem>
                  <MenuItem value="dificil">Difícil</MenuItem>
                  <MenuItem value="extremo">Extremo</MenuItem>
                </Select>
                {fieldErrors.dificultad && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                    {fieldErrors.dificultad}
                  </Typography>
                )}
              </FormControl>
            </Grid2>

            {/* Destino - full width */}
            <Grid2 xs={12} md={12} sx={{ width: '100%' }}>
              <Autocomplete
                freeSolo
                options={destinos}
                loading={loadingDestinos}
                getOptionLabel={(option) => {
                  if (typeof option === "string") return option
                  if (option.nombre) {
                    const parts = [option.nombre]
                    if (option.provincia) parts.push(option.provincia)
                    if (option.region) parts.push(option.region)
                    return parts.join(" - ")
                  }
                  return ""
                }}
                inputValue={formData.destino}
                onInputChange={(event, newInputValue, reason) => {
                  // Actualizar el valor del input
                  if (reason === 'input' || reason === 'clear') {
                    setFormData((prev) => ({
                      ...prev,
                      destino: newInputValue,
                    }))
                  }
                  // Limpiar error cuando el usuario escribe
                  if (newInputValue && fieldErrors.destino) {
                    setFieldErrors((prev) => {
                      const newErrors = { ...prev }
                      delete newErrors.destino
                      return newErrors
                    })
                  }
                }}
                onChange={(event, newValue) => {
                  // Manejar tanto selección de destino existente como texto libre
                  const destinoValue = typeof newValue === "string" ? newValue : newValue?.nombre || ""
                  setFormData((prev) => ({
                    ...prev,
                    destino: destinoValue,
                  }))
                }}
                onBlur={() => handleBlur({ target: { name: "destino", value: formData.destino } })}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Destino"
                    required
                    error={Boolean(fieldErrors.destino)}
                    helperText={fieldErrors.destino || "Seleccione un destino existente o ingrese uno nuevo (se creará automáticamente)"}
                    placeholder="Ej: El Chaltén, Bariloche, Aconcagua..."
                  />
                )}
              />
            </Grid2>

            {/* Descripción corta - full width */}
            <Grid2 xs={12} md={12} sx={{ width: '100%' }}>
              <TextField
                fullWidth
                required
                multiline
                rows={4}
                name="descripcion_corta"
                label="Descripción Corta"
                value={formData.descripcion_corta}
                onChange={handleChange}
                onBlur={handleBlur}
                error={Boolean(fieldErrors.descripcion_corta)}
                helperText={fieldErrors.descripcion_corta || "Descripción breve que aparecerá en las tarjetas de viajes"}
              />
            </Grid2>

            {/* Descripción completa - full width */}
            <Grid2 xs={12} md={12} sx={{ width: '100%' }}>
              <TextField
                fullWidth
                required
                multiline
                minRows={4}
                maxRows={20}
                name="descripcion_completa"
                label="Descripción Completa"
                value={formData.descripcion_completa}
                onChange={handleChange}
                onBlur={handleBlur}
                error={Boolean(fieldErrors.descripcion_completa)}
                helperText={fieldErrors.descripcion_completa || "Descripción detallada del viaje con toda la información relevante"}
              />
            </Grid2>
          </Grid2>
        </CardContent>
      </Card>

      {/* Sección 2: Detalles del Viaje */}
      <Card sx={{ mb: 4, p: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: "primary.main", mb: 3 }}>
            Detalles del Viaje
          </Typography>

          <Grid2 container spacing={3}>
            {/* Duración, Precio Base en la misma fila */}
            <Grid2 xs={12} md={6}>
              <TextField
                fullWidth
                required
                type="number"
                name="duracion_dias"
                label="Duración (días)"
                value={formData.duracion_dias}
                onChange={handleChange}
                onBlur={handleBlur}
                error={Boolean(fieldErrors.duracion_dias)}
                helperText={fieldErrors.duracion_dias || ""}
                slotProps={{
                  input: {
                    endAdornment: <InputAdornment position="end">días</InputAdornment>,
                  },
                }}
              />
            </Grid2>

            <Grid2 xs={12} md={6}>
              <TextField
                fullWidth
                required
                type="number"
                name="precio_base"
                label="Precio Base"
                value={formData.precio_base}
                onChange={handleChange}
                onBlur={handleBlur}
                error={Boolean(fieldErrors.precio_base)}
                helperText={fieldErrors.precio_base || ""}
                slotProps={{
                  input: {
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  },
                }}
              />
            </Grid2>

            {/* Estado y Destacado en la misma fila */}
            <Grid2 xs={12} md={6}>
              <FormControl fullWidth required sx={{ minWidth: 200 }}>
                <InputLabel>Estado</InputLabel>
                <Select
                  name="activo"
                  value={formData.activo}
                  label="Estado"
                  onChange={handleChange}
                >
                  <MenuItem value={true}>Activo</MenuItem>
                  <MenuItem value={false}>Inactivo</MenuItem>
                </Select>
              </FormControl>
            </Grid2>

            <Grid2 xs={12} md={6}>
              <FormControl fullWidth sx={{ minWidth: 200 }}>
                <InputLabel>Destacado</InputLabel>
                <Select
                  name="destacado"
                  value={formData.destacado}
                  label="Destacado"
                  onChange={handleChange}
                >
                  <MenuItem value={false}>No</MenuItem>
                  <MenuItem value={true}>Sí - Mostrar en "Aventuras Destacadas"</MenuItem>
                </Select>
              </FormControl>
            </Grid2>

            {/* Mínimo y Máximo participantes en la misma fila */}
            <Grid2 xs={12} md={6}>
              <TextField
                fullWidth
                required
                type="number"
                name="minimo_participantes"
                label="Mínimo de Participantes"
                value={formData.minimo_participantes}
                onChange={handleChange}
                onBlur={handleBlur}
                error={Boolean(fieldErrors.minimo_participantes)}
                helperText={fieldErrors.minimo_participantes || ""}
              />
            </Grid2>

            <Grid2 xs={12} md={6}>
              <TextField
                fullWidth
                required
                type="number"
                name="maximo_participantes"
                label="Máximo de Participantes"
                value={formData.maximo_participantes}
                onChange={handleChange}
                onBlur={handleBlur}
                error={Boolean(fieldErrors.maximo_participantes)}
                helperText={fieldErrors.maximo_participantes || ""}
              />
            </Grid2>
          </Grid2>
        </CardContent>
      </Card>

      {/* Sección 3: Información Adicional */}
      <Card sx={{ mb: 4, p: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: "primary.main", mb: 3 }}>
            Información Adicional
          </Typography>

          <Grid2 container spacing={3}>
            {/* Qué Incluye - full width */}
            <Grid2 xs={12} md={12} sx={{ width: '100%' }}>
              <TextField
                fullWidth
                required
                multiline
                minRows={4}
                maxRows={20}
                name="incluye"
                label="Qué Incluye"
                value={formData.incluye}
                onChange={handleChange}
                onBlur={handleBlur}
                error={Boolean(fieldErrors.incluye)}
                helperText={fieldErrors.incluye || "Servicios y elementos incluidos en el precio"}
                FormHelperTextProps={{
                  sx: { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }
                }}
              />
            </Grid2>

            {/* Qué NO Incluye - full width */}
            <Grid2 xs={12} md={12} sx={{ width: '100%' }}>
              <TextField
                fullWidth
                required
                multiline
                minRows={4}
                maxRows={20}
                name="no_incluye"
                label="Qué NO Incluye"
                value={formData.no_incluye}
                onChange={handleChange}
                onBlur={handleBlur}
                error={Boolean(fieldErrors.no_incluye)}
                helperText={fieldErrors.no_incluye || "Servicios y elementos NO incluidos"}
                FormHelperTextProps={{
                  sx: { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }
                }}
              />
            </Grid2>

            {/* Recomendaciones - full width */}
            <Grid2 xs={12} md={12} sx={{ width: '100%' }}>
              <TextField
                fullWidth
                required
                multiline
                minRows={4}
                maxRows={20}
                name="recomendaciones"
                label="Recomendaciones"
                value={formData.recomendaciones}
                onChange={handleChange}
                onBlur={handleBlur}
                error={Boolean(fieldErrors.recomendaciones)}
                helperText={fieldErrors.recomendaciones || "Recomendaciones importantes para los participantes"}
                FormHelperTextProps={{
                  sx: { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }
                }}
              />
            </Grid2>
          </Grid2>
        </CardContent>
      </Card>

      {/* Sección 4: Imágenes del Viaje */}
      <Card sx={{ mb: 4, p: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: "primary.main", mb: 3 }}>
            Imágenes del Viaje
          </Typography>

          <Grid2 container spacing={3}>
            {/* Botón de carga de imágenes */}
            <Grid2 xs={12}>
              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                fullWidth
                sx={{
                  minHeight: "56px",
                  fontSize: "1rem",
                  textTransform: "none",
                  borderStyle: "dashed",
                  borderWidth: 2,
                  "&:hover": {
                    borderWidth: 2,
                    borderStyle: "dashed",
                  },
                }}
              >
                Seleccionar Imágenes (Múltiples)
                <input type="file" hidden multiple accept="image/*" onChange={handleImageChange} />
              </Button>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                Formatos aceptados: JPG, PNG, WebP. Puede seleccionar múltiples imágenes.
              </Typography>
            </Grid2>

            {/* Imágenes existentes (solo en modo edición) */}
            {mode === "edit" && existingImages.length > 0 && (
              <Grid2 xs={12}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                  Imágenes Actuales ({existingImages.length})
                </Typography>
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                  {existingImages.map((image) => (
                    <Card key={image.id_imagen_viaje} sx={{ width: 150, position: "relative" }}>
                      <CardMedia
                        component="img"
                        height="120"
                        image={image.url}
                        alt={image.descripcion || "Imagen del viaje"}
                        sx={{
                          objectFit: "cover",
                          cursor: "pointer",
                          transition: "transform 0.2s",
                          "&:hover": {
                            transform: "scale(1.05)",
                          },
                        }}
                        onClick={() => {
                          setLightboxImage(image)
                          setLightboxOpen(true)
                        }}
                      />
                      {image.es_principal && (
                        <Chip
                          label="Principal"
                          color="primary"
                          size="small"
                          sx={{
                            position: "absolute",
                            top: 8,
                            left: 8,
                            fontWeight: 600,
                          }}
                        />
                      )}
                      <CardActions sx={{ justifyContent: "center", p: 0.5, gap: 0.5 }}>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => openFocusDialog(image)}
                          aria-label="Ajustar punto focal"
                          title="Ajustar punto focal"
                        >
                          <CenterFocusStrongIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => removeExistingImage(image.id_imagen_viaje)}
                          aria-label="Eliminar imagen"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </CardActions>
                    </Card>
                  ))}
                </Box>
              </Grid2>
            )}

            {/* Nuevas imágenes a subir */}
            {imagePreviews.length > 0 && (
              <Grid2 xs={12}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                  Nuevas Imágenes a Subir ({imagePreviews.length})
                </Typography>
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                  {imagePreviews.map((preview, index) => (
                    <Card key={index} sx={{ width: 150, position: "relative" }}>
                      <CardMedia
                        component="img"
                        height="120"
                        image={preview.url}
                        alt={preview.name}
                        sx={{ objectFit: "cover" }}
                      />
                      <Chip
                        icon={<ImageIcon />}
                        label={`${(preview.size / 1024).toFixed(0)} KB`}
                        size="small"
                        sx={{
                          position: "absolute",
                          top: 8,
                          left: 8,
                          backgroundColor: "rgba(0, 0, 0, 0.7)",
                          color: "white",
                        }}
                      />
                      <CardActions sx={{ justifyContent: "center", p: 0.5 }}>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => removeNewImage(index)}
                          aria-label="Quitar imagen"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </CardActions>
                    </Card>
                  ))}
                </Box>
              </Grid2>
            )}
          </Grid2>
        </CardContent>
      </Card>

      {/* Gestión de Fechas de Salida */}
      {mode === "edit" && viaje?.id_viaje ? (
        <Box sx={{ mt: 4 }}>
          <FechasViajeManager viajeId={viaje.id_viaje} />
        </Box>
      ) : (
        <Card sx={{ mt: 4, bgcolor: "info.lighter", borderColor: "info.main", borderWidth: 2, borderStyle: "dashed" }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 1 }}>
              <CalendarMonth color="info" />
              Fechas de Salida
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              Las fechas de salida y la asignación de guías se podrán agregar después de crear el viaje.
            </Alert>
            <Typography variant="body2" color="text.secondary">
              Una vez creado el viaje, podrás:
            </Typography>
            <Box component="ul" sx={{ mt: 1, pl: 2 }}>
              <Typography component="li" variant="body2" color="text.secondary">
                Agregar múltiples fechas de salida con diferentes rangos
              </Typography>
              <Typography component="li" variant="body2" color="text.secondary">
                Asignar uno o más guías a cada fecha (principal, asistente, especialista)
              </Typography>
              <Typography component="li" variant="body2" color="text.secondary">
                Configurar tarifas específicas para cada guía
              </Typography>
              <Typography component="li" variant="body2" color="text.secondary">
                Gestionar cupos y precios especiales por fecha
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Botones */}
      <Box display="flex" justifyContent="flex-end" gap={2} mt={4}>
        <Button onClick={onCancel} disabled={loading} size="large">
          Cancelar
        </Button>
        <Button type="submit" variant="contained" disabled={loading} size="large">
          {loading ? <CircularProgress size={24} /> : mode === "create" ? "Crear Viaje" : "Actualizar Viaje"}
        </Button>
      </Box>

      {/* Lightbox Dialog */}
      <Dialog
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              {lightboxImage?.descripcion || "Vista previa de imagen"}
            </Typography>
            <IconButton onClick={() => setLightboxOpen(false)} edge="end">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ display: "flex", justifyContent: "center", alignItems: "center", p: 3 }}>
          {lightboxImage && (
            <Box
              component="img"
              src={lightboxImage.url}
              alt={lightboxImage.descripcion || "Imagen del viaje"}
              sx={{
                maxWidth: "100%",
                maxHeight: "70vh",
                objectFit: "contain",
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Focus Control Dialog */}
      <Dialog
        open={focusDialogOpen}
        onClose={closeFocusDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              Ajustar Punto Focal
            </Typography>
            <IconButton onClick={closeFocusDialog} edge="end">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Selecciona el punto focal de la imagen para controlar qué parte se muestra cuando se recorta.
          </Typography>
          {selectedImageForFocus && (
            <ImageFocusControl
              imageUrl={selectedImageForFocus.url}
              currentFocus={tempFocusPoint}
              onChange={setTempFocusPoint}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeFocusDialog}>
            Cancelar
          </Button>
          <Button
            onClick={saveFocusPoint}
            variant="contained"
            startIcon={<CenterFocusStrongIcon />}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog for Creating Trip Without Dates */}
      <Dialog
        open={confirmDialogOpen}
        onClose={handleConfirmNoDatesCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Crear viaje sin fechas disponibles
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2">
              Este viaje no tiene fechas disponibles cargadas. Los viajes sin fechas futuras no se mostrarán en el sitio público.
            </Typography>
          </Alert>
          <Typography variant="body1" sx={{ mb: 2 }}>
            ¿Está seguro que desea crear este viaje sin fechas disponibles?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Podrá agregar fechas de salida después de crear el viaje desde la sección "Gestión de Fechas de Salida".
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleConfirmNoDatesCancel} variant="outlined">
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmNoDatesProceed}
            variant="contained"
            color="primary"
          >
            Crear sin fechas
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
