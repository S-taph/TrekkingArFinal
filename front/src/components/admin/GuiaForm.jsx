"use client"

import { useState, useEffect } from "react"
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Autocomplete,
  Grid2,
  MenuItem,
  Card,
  CardContent,
  Divider,
} from "@mui/material"
import { guiasAPI, usuariosAPI } from "../../services/api"

export default function GuiaForm({ guia, mode, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    id_usuario: "",
    matricula: "", // Added matricula field
    especialidades: "",
    experiencia_anos: "",
    certificaciones: "",
    idiomas: "",
    tarifa_por_dia: "",
    disponible: true,
    activo: true,
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Estado para validación por campo
  const [fieldErrors, setFieldErrors] = useState({})

  const [usuarios, setUsuarios] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loadingUsuarios, setLoadingUsuarios] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)

  useEffect(() => {
    fetchUsuarios()
  }, [])

  const fetchUsuarios = async (search = "") => {
    setLoadingUsuarios(true)
    try {
      const response = await usuariosAPI.getUsuarios({
        search,
        limit: 50,
      })
      console.log("[v0] Usuarios cargados:", response)
      setUsuarios(response.data?.usuarios || response.data || response)
    } catch (error) {
      console.error("Error cargando usuarios:", error)
      setUsuarios([])
    } finally {
      setLoadingUsuarios(false)
    }
  }

  useEffect(() => {
    if (selectedUser) return

    const timer = setTimeout(() => {
      if (searchTerm.trim() !== "") {
        fetchUsuarios(searchTerm)
      } else {
        fetchUsuarios()
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm, selectedUser])

  useEffect(() => {
    if (mode === "edit" && guia) {
      setFormData({
        id_usuario: guia.id_usuario || "",
        matricula: guia.matricula || "", // Added matricula to edit mode
        especialidades: guia.especialidades || "",
        experiencia_anos: guia.experiencia_anos || "",
        certificaciones: guia.certificaciones || "",
        idiomas: guia.idiomas || "",
        tarifa_por_dia: guia.tarifa_por_dia || "",
        disponible: guia.disponible !== undefined ? guia.disponible : true,
        activo: guia.activo !== undefined ? guia.activo : true,
      })

      if (guia.id_usuario && guia.usuario) {
        setUsuarios([guia.usuario])
        setSelectedUser(guia.usuario)
      }
    }
  }, [guia, mode])

  // Función para validar un campo individual
  const validateField = (name, value) => {
    let errorMessage = ""

    switch (name) {
      case "id_usuario":
        if (mode === "create" && !selectedUser) {
          errorMessage = "Debe seleccionar un usuario"
        }
        break
      case "matricula":
        if (!value || value.trim() === "") {
          errorMessage = "La matrícula es requerida"
        }
        break
      case "especialidades":
        if (!value || value.trim() === "") {
          errorMessage = "Las especialidades son requeridas"
        }
        break
      case "experiencia_anos":
        if (!value || Number(value) < 0) {
          errorMessage = "Los años de experiencia deben ser un número >= 0"
        }
        break
      case "certificaciones":
        if (!value || value.trim() === "") {
          errorMessage = "Las certificaciones son requeridas"
        }
        break
      case "idiomas":
        if (!value || value.trim() === "") {
          errorMessage = "Los idiomas son requeridos"
        }
        break
      case "tarifa_por_dia":
        if (!value || Number(value) < 0) {
          errorMessage = "La tarifa debe ser un número >= 0"
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
    const fieldsToValidate = [
      "id_usuario",
      "matricula",
      "especialidades",
      "experiencia_anos",
      "certificaciones",
      "idiomas",
      "tarifa_por_dia",
    ]

    fieldsToValidate.forEach((key) => {
      const error = validateField(key, formData[key])
      if (error) {
        errors[key] = error
      }
    })

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target

    // Convertir booleanos correctamente para los selects
    let finalValue = value

    if (name === "disponible" || name === "activo") {
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

  const handleUserSelect = (event, value) => {
    setSelectedUser(value)
    setFormData((prev) => ({
      ...prev,
      id_usuario: value ? value.id_usuarios : "",
    }))
    if (value) {
      setSearchTerm("")
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Validar todos los campos antes de enviar
      const isValid = validateAll()
      if (!isValid) {
        setError("Por favor, corrija los errores en el formulario antes de continuar")
        setLoading(false)
        return
      }

      console.log("[GuiaForm] Form data before processing:", formData)
      console.log("[GuiaForm] Selected user:", selectedUser)

      const submitData = {
        id_usuario: Number.parseInt(formData.id_usuario),
        matricula: formData.matricula.trim(),
        especialidades: formData.especialidades.trim(),
        anos_experiencia: Number.parseInt(formData.experiencia_anos) || 0,
        certificaciones: formData.certificaciones.trim(),
        idiomas: formData.idiomas.trim(),
        tarifa_por_dia: formData.tarifa_por_dia ? Number.parseFloat(formData.tarifa_por_dia) : 0,
        disponible: formData.disponible === true || formData.disponible === "true",
        activo: formData.activo === true || formData.activo === "true",
      }

      console.log("[GuiaForm] Submit data:", submitData)

      if (mode === "create") {
        console.log("[GuiaForm] Creating guia with data:", submitData)
        const response = await guiasAPI.createGuia(submitData)
        console.log("[GuiaForm] Create response:", response)
      } else {
        console.log("[GuiaForm] Updating guia:", guia.id_guia, "with data:", submitData)
        const response = await guiasAPI.updateGuia(guia.id_guia, submitData)
        console.log("[GuiaForm] Update response:", response)
      }

      onSuccess()
    } catch (error) {
      console.error("[GuiaForm] Error in handleSubmit:", error)
      setError(error.message || "Error al guardar el guía")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      {/* Alert de error global */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Sección 1: Información Básica (Selección/Edición de Usuario) */}
      <Card sx={{ mb: 4, p: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: "primary.main", mb: 3 }}>
            Información Básica
          </Typography>

          <Grid2 container spacing={3}>
            {/* Modo crear: Autocomplete para buscar usuario */}
            {mode === "create" && (
              <Grid2 xs={12}>
                <Autocomplete
                  options={usuarios}
                  getOptionLabel={(option) =>
                    `${option.nombre} ${option.apellido} (${option.email})${option.dni ? ` - DNI: ${option.dni}` : ""}`
                  }
                  value={selectedUser}
                  onChange={handleUserSelect}
                  onInputChange={(event, newInputValue, reason) => {
                    if (reason === "input" && !selectedUser) {
                      setSearchTerm(newInputValue)
                    }
                  }}
                  loading={loadingUsuarios}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      required
                      label="Buscar usuario para convertir en guía"
                      placeholder="Escribe nombre, apellido o email..."
                      error={Boolean(fieldErrors.id_usuario)}
                      helperText={fieldErrors.id_usuario || "Busca entre todos los usuarios registrados para asignar como guía"}
                      slotProps={{
                        input: {
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {loadingUsuarios ? <CircularProgress color="inherit" size={20} /> : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        },
                      }}
                    />
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props}>
                      <Box>
                        <Typography variant="body1">
                          {option.nombre} {option.apellido}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {option.email} {option.dni && `• DNI: ${option.dni}`}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  noOptionsText="No se encontraron usuarios"
                  filterOptions={(x) => x}
                />
              </Grid2>
            )}

            {/* Usuario seleccionado - Tarjeta informativa */}
            {selectedUser && mode === "create" && (
              <Grid2 xs={12}>
                <Card variant="outlined" sx={{ bgcolor: (theme) => theme.palette.mode === "dark" ? "grey.900" : "grey.50" }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="primary" sx={{ fontWeight: 600, mb: 2 }}>
                      Usuario Seleccionado
                    </Typography>
                    <Grid2 container spacing={2}>
                      <Grid2 xs={12} md={6}>
                        <Typography variant="body2" color="text.secondary">
                          Nombre Completo:
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {selectedUser.nombre} {selectedUser.apellido}
                        </Typography>
                      </Grid2>
                      <Grid2 xs={12} md={6}>
                        <Typography variant="body2" color="text.secondary">
                          Email:
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {selectedUser.email}
                        </Typography>
                      </Grid2>
                      {selectedUser.dni && (
                        <Grid2 xs={12} md={6}>
                          <Typography variant="body2" color="text.secondary">
                            DNI:
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {selectedUser.dni}
                          </Typography>
                        </Grid2>
                      )}
                      {selectedUser.telefono && (
                        <Grid2 xs={12} md={6}>
                          <Typography variant="body2" color="text.secondary">
                            Teléfono:
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {selectedUser.telefono}
                          </Typography>
                        </Grid2>
                      )}
                      {selectedUser.fecha_nacimiento && (
                        <Grid2 xs={12} md={6}>
                          <Typography variant="body2" color="text.secondary">
                            Fecha de Nacimiento:
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {new Date(selectedUser.fecha_nacimiento).toLocaleDateString()}
                          </Typography>
                        </Grid2>
                      )}
                      {selectedUser.direccion && (
                        <Grid2 xs={12} md={6}>
                          <Typography variant="body2" color="text.secondary">
                            Dirección:
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {selectedUser.direccion}
                          </Typography>
                        </Grid2>
                      )}
                      {selectedUser.nacionalidad && (
                        <Grid2 xs={12} md={6}>
                          <Typography variant="body2" color="text.secondary">
                            Nacionalidad:
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {selectedUser.nacionalidad}
                          </Typography>
                        </Grid2>
                      )}
                      {selectedUser.genero && (
                        <Grid2 xs={12} md={6}>
                          <Typography variant="body2" color="text.secondary">
                            Género:
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {selectedUser.genero}
                          </Typography>
                        </Grid2>
                      )}
                    </Grid2>
                    <Box sx={{ mt: 3 }}>
                      <Button
                        size="medium"
                        variant="outlined"
                        onClick={() => {
                          setSelectedUser(null)
                          setFormData((prev) => ({ ...prev, id_usuario: "" }))
                          setFieldErrors((prev) => {
                            const newErrors = { ...prev }
                            delete newErrors.id_usuario
                            return newErrors
                          })
                        }}
                      >
                        Cambiar Usuario
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid2>
            )}

            {/* Modo editar: Alert informativo */}
            {mode === "edit" && (
              <Grid2 xs={12}>
                <Alert severity="info">
                  <strong>Editando guía:</strong> {guia?.usuario?.nombre} {guia?.usuario?.apellido} ({guia?.usuario?.email})
                </Alert>
              </Grid2>
            )}
          </Grid2>
        </CardContent>
      </Card>

      {/* Sección 2: Información del Guía */}
      <Card sx={{ mb: 4, p: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: "primary.main", mb: 3 }}>
            Información del Guía
          </Typography>

          <Grid2 container spacing={3}>
            {/* Matrícula y Años de experiencia en la misma fila */}
            <Grid2 xs={12} md={6}>
              <TextField
                fullWidth
                required
                size="medium"
                name="matricula"
                label="Matrícula Profesional"
                value={formData.matricula}
                onChange={handleChange}
                onBlur={handleBlur}
                error={Boolean(fieldErrors.matricula)}
                helperText={fieldErrors.matricula || "Número de matrícula profesional del guía"}
                sx={{ "& .MuiInputBase-root": { minHeight: "56px" } }}
              />
            </Grid2>

            <Grid2 xs={12} md={6}>
              <TextField
                fullWidth
                required
                size="medium"
                type="number"
                name="experiencia_anos"
                label="Años de Experiencia"
                value={formData.experiencia_anos}
                onChange={handleChange}
                onBlur={handleBlur}
                error={Boolean(fieldErrors.experiencia_anos)}
                helperText={fieldErrors.experiencia_anos || ""}
                sx={{ "& .MuiInputBase-root": { minHeight: "56px" } }}
              />
            </Grid2>

            {/* Especialidades - full width */}
            <Grid2 xs={12}>
              <TextField
                fullWidth
                required
                size="medium"
                name="especialidades"
                label="Especialidades"
                value={formData.especialidades}
                onChange={handleChange}
                onBlur={handleBlur}
                error={Boolean(fieldErrors.especialidades)}
                helperText={fieldErrors.especialidades || "Ej: Montañismo, Trekking, Escalada (separadas por comas)"}
                sx={{ "& .MuiInputBase-root": { minHeight: "56px" } }}
              />
            </Grid2>

            {/* Tarifa e Idiomas en la misma fila */}
            <Grid2 xs={12} md={6}>
              <TextField
                fullWidth
                required
                size="medium"
                type="number"
                name="tarifa_por_dia"
                label="Tarifa por Día"
                value={formData.tarifa_por_dia}
                onChange={handleChange}
                onBlur={handleBlur}
                error={Boolean(fieldErrors.tarifa_por_dia)}
                helperText={fieldErrors.tarifa_por_dia || "Tarifa diaria en moneda local"}
                sx={{ "& .MuiInputBase-root": { minHeight: "56px" } }}
              />
            </Grid2>

            <Grid2 xs={12} md={6}>
              <TextField
                fullWidth
                required
                size="medium"
                name="idiomas"
                label="Idiomas"
                value={formData.idiomas}
                onChange={handleChange}
                onBlur={handleBlur}
                error={Boolean(fieldErrors.idiomas)}
                helperText={fieldErrors.idiomas || "Ej: Español, Inglés, Francés (separados por comas)"}
                sx={{ "& .MuiInputBase-root": { minHeight: "56px" } }}
              />
            </Grid2>

            {/* Certificaciones - full width, multiline */}
            <Grid2 xs={12}>
              <TextField
                fullWidth
                required
                multiline
                rows={5}
                size="medium"
                name="certificaciones"
                label="Certificaciones"
                value={formData.certificaciones}
                onChange={handleChange}
                onBlur={handleBlur}
                error={Boolean(fieldErrors.certificaciones)}
                helperText={fieldErrors.certificaciones || "Certificaciones, cursos y títulos relevantes (uno por línea o separados por comas)"}
              />
            </Grid2>
          </Grid2>
        </CardContent>
      </Card>

      {/* Sección 3: Estado y Disponibilidad */}
      <Card sx={{ mb: 4, p: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: "primary.main", mb: 3 }}>
            Estado y Disponibilidad
          </Typography>

          <Grid2 container spacing={3}>
            {/* Disponible y Activo en la misma fila */}
            <Grid2 xs={12} md={6}>
              <TextField
                fullWidth
                required
                select
                size="medium"
                name="disponible"
                label="Disponibilidad"
                value={formData.disponible}
                onChange={handleChange}
                sx={{ "& .MuiInputBase-root": { minHeight: "56px" } }}
              >
                <MenuItem value={true}>Disponible</MenuItem>
                <MenuItem value={false}>No Disponible</MenuItem>
              </TextField>
            </Grid2>

            <Grid2 xs={12} md={6}>
              <TextField
                fullWidth
                required
                select
                size="medium"
                name="activo"
                label="Estado"
                value={formData.activo}
                onChange={handleChange}
                sx={{ "& .MuiInputBase-root": { minHeight: "56px" } }}
              >
                <MenuItem value={true}>Activo</MenuItem>
                <MenuItem value={false}>Inactivo</MenuItem>
              </TextField>
            </Grid2>
          </Grid2>
        </CardContent>
      </Card>

      <Box display="flex" justifyContent="flex-end" gap={2} mt={4}>
        <Button onClick={onCancel} disabled={loading} size="large">
          Cancelar
        </Button>
        <Button type="submit" variant="contained" disabled={loading} size="large">
          {loading ? <CircularProgress size={24} /> : mode === "create" ? "Crear Guía" : "Actualizar Guía"}
        </Button>
      </Box>
    </Box>
  )
}
