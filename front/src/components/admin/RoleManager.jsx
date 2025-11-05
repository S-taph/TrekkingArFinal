import { useState, useEffect } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Chip,
  Typography,
  Alert,
  CircularProgress,
  Stack,
  IconButton,
  Tooltip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
} from "@mui/material"
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  PersonAdd as PersonAddIcon,
  AdminPanelSettings as AdminIcon,
  Badge as BadgeIcon,
} from "@mui/icons-material"
import { rolesAPI } from "../../services/api"

const ROLES_CONFIG = {
  cliente: {
    label: "Cliente",
    color: "default",
    description: "Usuario cliente con permisos básicos",
  },
  guia: {
    label: "Guía",
    color: "secondary",
    description: "Guía certificado que puede dirigir viajes",
  },
  admin: {
    label: "Administrador",
    color: "primary",
    description: "Administrador con acceso completo al sistema",
  },
}

export default function RoleManager({ usuario, open, onClose, onSuccess }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [rolesInfo, setRolesInfo] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  // Estados para promover a guía
  const [showGuiaForm, setShowGuiaForm] = useState(false)
  const [guiaData, setGuiaData] = useState({
    matricula: "",
    especialidades: "",
    anos_experiencia: "",
    idiomas: "Español",
    certificaciones: "",
    tarifa_por_dia: "",
  })

  // Estado para asignar rol simple
  const [showAddRole, setShowAddRole] = useState(false)
  const [selectedRole, setSelectedRole] = useState("")

  useEffect(() => {
    if (open && usuario) {
      loadRolesInfo()
    }
  }, [open, usuario])

  const loadRolesInfo = async () => {
    try {
      setLoading(true)
      setError("")
      const response = await rolesAPI.getUserRoles(usuario.id_usuarios)
      setRolesInfo(response.data)
    } catch (err) {
      console.error("Error cargando roles:", err)
      setError(err.message || "Error al cargar información de roles")
    } finally {
      setLoading(false)
    }
  }

  const handleAddRole = async () => {
    if (!selectedRole) return

    try {
      setActionLoading(true)
      setError("")

      await rolesAPI.assignRole(usuario.id_usuarios, {
        rol: selectedRole,
        observaciones: `Rol asignado desde panel de administración`,
      })

      await loadRolesInfo()
      setShowAddRole(false)
      setSelectedRole("")
      onSuccess?.(`Rol "${ROLES_CONFIG[selectedRole].label}" asignado correctamente`)
    } catch (err) {
      setError(err.message || "Error al asignar rol")
    } finally {
      setActionLoading(false)
    }
  }

  const handleRemoveRole = async (rol) => {
    if (!confirm(`¿Estás seguro de remover el rol "${ROLES_CONFIG[rol].label}"?`)) {
      return
    }

    try {
      setActionLoading(true)
      setError("")

      await rolesAPI.removeRole(usuario.id_usuarios, { rol })
      await loadRolesInfo()
      onSuccess?.(`Rol "${ROLES_CONFIG[rol].label}" removido correctamente`)
    } catch (err) {
      setError(err.message || "Error al remover rol")
    } finally {
      setActionLoading(false)
    }
  }

  const handlePromoteToGuia = async () => {
    if (!guiaData.matricula.trim()) {
      setError("La matrícula es requerida")
      return
    }

    try {
      setActionLoading(true)
      setError("")

      const dataToSend = {
        matricula: guiaData.matricula,
        especialidades: guiaData.especialidades || null,
        anos_experiencia: guiaData.anos_experiencia ? parseInt(guiaData.anos_experiencia) : null,
        idiomas: guiaData.idiomas || "Español",
        certificaciones: guiaData.certificaciones || null,
        tarifa_por_dia: guiaData.tarifa_por_dia ? parseFloat(guiaData.tarifa_por_dia) : null,
      }

      await rolesAPI.promoteToGuia(usuario.id_usuarios, dataToSend)
      await loadRolesInfo()
      setShowGuiaForm(false)
      setGuiaData({
        matricula: "",
        especialidades: "",
        anos_experiencia: "",
        idiomas: "Español",
        certificaciones: "",
        tarifa_por_dia: "",
      })
      onSuccess?.("Usuario promovido a Guía exitosamente")
    } catch (err) {
      setError(err.message || "Error al promover a guía")
    } finally {
      setActionLoading(false)
    }
  }

  const handlePromoteToAdmin = async () => {
    if (!confirm("¿Estás seguro de promover este usuario a Administrador?")) {
      return
    }

    try {
      setActionLoading(true)
      setError("")

      await rolesAPI.promoteToAdmin(usuario.id_usuarios, {
        nivel: "admin",
        observaciones: "Promovido desde panel de administración",
      })

      await loadRolesInfo()
      onSuccess?.("Usuario promovido a Administrador exitosamente")
    } catch (err) {
      setError(err.message || "Error al promover a administrador")
    } finally {
      setActionLoading(false)
    }
  }

  const availableRoles = rolesInfo
    ? Object.keys(ROLES_CONFIG).filter((rol) => !rolesInfo.roles.includes(rol))
    : []

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ color: "#64b5f6", display: "flex", alignItems: "center", gap: 1 }}>
        <PersonAddIcon />
        Gestión de Roles - {usuario?.nombre} {usuario?.apellido}
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress sx={{ color: "#64b5f6" }} />
          </Box>
        ) : error ? (
          <Alert severity="error" onClose={() => setError("")}>
            {error}
          </Alert>
        ) : rolesInfo ? (
          <Stack spacing={3}>
            {/* Información del usuario */}
            <Box>
              <Typography variant="body2" color="text.secondary">
                Email: {rolesInfo.email}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Rol Principal: {ROLES_CONFIG[rolesInfo.primaryRole]?.label}
              </Typography>
            </Box>

            {/* Roles actuales */}
            <Box>
              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                Roles Activos
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                {rolesInfo.roles.map((rol) => (
                  <Chip
                    key={rol}
                    label={ROLES_CONFIG[rol].label}
                    color={ROLES_CONFIG[rol].color}
                    onDelete={
                      rolesInfo.roles.length > 1 ? () => handleRemoveRole(rol) : undefined
                    }
                    deleteIcon={
                      <Tooltip title="Remover rol">
                        <DeleteIcon />
                      </Tooltip>
                    }
                    disabled={actionLoading}
                  />
                ))}
              </Stack>
              {rolesInfo.roles.length === 1 && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                  * No se puede remover el único rol del usuario
                </Typography>
              )}
            </Box>

            <Divider />

            {/* Acciones rápidas */}
            <Box>
              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                Acciones Rápidas
              </Typography>

              <Stack spacing={2}>
                {/* Agregar rol simple */}
                {!showAddRole && availableRoles.length > 0 && (
                  <Button
                    startIcon={<AddIcon />}
                    variant="outlined"
                    onClick={() => setShowAddRole(true)}
                    disabled={actionLoading}
                    sx={{ borderColor: "#64b5f6", color: "#64b5f6" }}
                  >
                    Asignar Rol
                  </Button>
                )}

                {showAddRole && (
                  <Box sx={{ p: 2, bgcolor: "action.hover", borderRadius: 1 }}>
                    <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                      <InputLabel>Seleccionar Rol</InputLabel>
                      <Select
                        value={selectedRole}
                        label="Seleccionar Rol"
                        onChange={(e) => setSelectedRole(e.target.value)}
                      >
                        {availableRoles.map((rol) => (
                          <MenuItem key={rol} value={rol}>
                            {ROLES_CONFIG[rol].label} - {ROLES_CONFIG[rol].description}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        onClick={handleAddRole}
                        disabled={!selectedRole || actionLoading}
                        variant="contained"
                        sx={{ bgcolor: "#64b5f6" }}
                      >
                        Asignar
                      </Button>
                      <Button
                        size="small"
                        onClick={() => {
                          setShowAddRole(false)
                          setSelectedRole("")
                        }}
                        disabled={actionLoading}
                      >
                        Cancelar
                      </Button>
                    </Stack>
                  </Box>
                )}

                {/* Promover a Guía */}
                {!rolesInfo.isGuia && (
                  <>
                    {!showGuiaForm && (
                      <Button
                        startIcon={<BadgeIcon />}
                        variant="outlined"
                        onClick={() => setShowGuiaForm(true)}
                        disabled={actionLoading}
                        sx={{ borderColor: "#9c27b0", color: "#9c27b0" }}
                      >
                        Promover a Guía (con perfil)
                      </Button>
                    )}

                    {showGuiaForm && (
                      <Box sx={{ p: 2, bgcolor: "action.hover", borderRadius: 1 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Datos del Guía
                        </Typography>
                        <Stack spacing={2}>
                          <TextField
                            size="small"
                            label="Matrícula *"
                            value={guiaData.matricula}
                            onChange={(e) =>
                              setGuiaData({ ...guiaData, matricula: e.target.value })
                            }
                            placeholder="GUIA-12345"
                          />
                          <TextField
                            size="small"
                            label="Especialidades"
                            value={guiaData.especialidades}
                            onChange={(e) =>
                              setGuiaData({ ...guiaData, especialidades: e.target.value })
                            }
                            placeholder="Alta montaña, escalada..."
                          />
                          <TextField
                            size="small"
                            label="Años de experiencia"
                            type="number"
                            value={guiaData.anos_experiencia}
                            onChange={(e) =>
                              setGuiaData({ ...guiaData, anos_experiencia: e.target.value })
                            }
                          />
                          <TextField
                            size="small"
                            label="Idiomas"
                            value={guiaData.idiomas}
                            onChange={(e) =>
                              setGuiaData({ ...guiaData, idiomas: e.target.value })
                            }
                            placeholder="Español, Inglés"
                          />
                          <TextField
                            size="small"
                            label="Certificaciones"
                            value={guiaData.certificaciones}
                            onChange={(e) =>
                              setGuiaData({ ...guiaData, certificaciones: e.target.value })
                            }
                            multiline
                            rows={2}
                          />
                          <TextField
                            size="small"
                            label="Tarifa por día"
                            type="number"
                            value={guiaData.tarifa_por_dia}
                            onChange={(e) =>
                              setGuiaData({ ...guiaData, tarifa_por_dia: e.target.value })
                            }
                          />
                          <Stack direction="row" spacing={1}>
                            <Button
                              size="small"
                              onClick={handlePromoteToGuia}
                              disabled={!guiaData.matricula || actionLoading}
                              variant="contained"
                              sx={{ bgcolor: "#9c27b0" }}
                            >
                              {actionLoading ? "Procesando..." : "Promover a Guía"}
                            </Button>
                            <Button
                              size="small"
                              onClick={() => setShowGuiaForm(false)}
                              disabled={actionLoading}
                            >
                              Cancelar
                            </Button>
                          </Stack>
                        </Stack>
                      </Box>
                    )}
                  </>
                )}

                {/* Promover a Admin */}
                {!rolesInfo.isAdmin && (
                  <Button
                    startIcon={<AdminIcon />}
                    variant="outlined"
                    onClick={handlePromoteToAdmin}
                    disabled={actionLoading}
                    sx={{ borderColor: "#2196f3", color: "#2196f3" }}
                  >
                    Promover a Administrador
                  </Button>
                )}
              </Stack>
            </Box>

            {/* Información de perfiles */}
            {(rolesInfo.perfilGuia || rolesInfo.perfilAdmin) && (
              <>
                <Divider />
                <Box>
                  <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                    Perfiles Adicionales
                  </Typography>

                  {rolesInfo.perfilGuia && (
                    <Alert severity="info" sx={{ mb: 1 }}>
                      <Typography variant="body2" fontWeight="bold">
                        Perfil de Guía
                      </Typography>
                      <Typography variant="caption">
                        Matrícula: {rolesInfo.perfilGuia.matricula}
                      </Typography>
                      {rolesInfo.perfilGuia.especialidades && (
                        <Typography variant="caption" display="block">
                          Especialidades: {rolesInfo.perfilGuia.especialidades}
                        </Typography>
                      )}
                    </Alert>
                  )}

                  {rolesInfo.perfilAdmin && (
                    <Alert severity="warning">
                      <Typography variant="body2" fontWeight="bold">
                        Perfil de Administrador
                      </Typography>
                      <Typography variant="caption">
                        Nivel: {rolesInfo.perfilAdmin.nivel}
                      </Typography>
                    </Alert>
                  )}
                </Box>
              </>
            )}
          </Stack>
        ) : null}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={actionLoading}>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  )
}
