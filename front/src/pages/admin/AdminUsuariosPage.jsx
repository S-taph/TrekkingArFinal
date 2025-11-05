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
  IconButton,
  Chip,
  Switch,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material"
import { Edit } from "@mui/icons-material"
import { usuariosAPI } from "../../services/api"

/**
 * AdminUsuariosPage - Gestión de usuarios (admin)
 * ✅ Conectado con backend real
 */
export default function AdminUsuariosPage() {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editDialog, setEditDialog] = useState({ open: false, usuario: null })
  const [newRol, setNewRol] = useState("")

  useEffect(() => {
    loadUsuarios()
  }, [])

  const loadUsuarios = async () => {
    try {
      setLoading(true)
      setError(null)
      // ✅ Conectado con GET /api/usuarios
      const response = await usuariosAPI.getUsuarios()

      // Backend retorna array directo, no objeto con success
      if (Array.isArray(response)) {
        setUsuarios(response)
      } else if (response.success && response.data) {
        setUsuarios(response.data.usuarios || [])
      }
    } catch (error) {
      console.error("Error cargando usuarios:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleActive = async (id) => {
    const usuario = usuarios.find((u) => u.id_usuarios === id)
    if (!usuario) return

    try {
      // ✅ Conectado con PUT /api/usuarios/:id
      await usuariosAPI.updateUsuario(id, {
        activo: !usuario.activo,
      })

      // Actualizar estado local
      setUsuarios((prev) =>
        prev.map((u) => (u.id_usuarios === id ? { ...u, activo: !u.activo } : u)),
      )
    } catch (error) {
      console.error("Error actualizando usuario:", error)
      setError(error.message)
    }
  }

  const handleOpenEditDialog = (usuario) => {
    setEditDialog({ open: true, usuario })
    setNewRol(usuario.rol)
  }

  const handleCloseEditDialog = () => {
    setEditDialog({ open: false, usuario: null })
    setNewRol("")
  }

  const handleSaveRol = async () => {
    if (!editDialog.usuario) return

    try {
      // ✅ Conectado con PUT /api/usuarios/:id
      await usuariosAPI.updateUsuario(editDialog.usuario.id_usuarios, {
        rol: newRol,
      })

      // Actualizar estado local
      setUsuarios((prev) =>
        prev.map((u) =>
          u.id_usuarios === editDialog.usuario.id_usuarios ? { ...u, rol: newRol } : u
        )
      )

      handleCloseEditDialog()
    } catch (error) {
      console.error("Error actualizando rol:", error)
      setError(error.message)
    }
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
        Gestión de Usuarios
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
      ) : (
        <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {usuarios.map((usuario) => (
              <TableRow key={usuario.id_usuarios}>
                <TableCell>
                  {usuario.nombre} {usuario.apellido}
                </TableCell>
                <TableCell>{usuario.email}</TableCell>
                <TableCell>
                  <Chip label={usuario.rol} size="small" color={usuario.rol === "admin" ? "primary" : "default"} />
                </TableCell>
                <TableCell>
                  <Switch
                    checked={usuario.activo}
                    onChange={() => handleToggleActive(usuario.id_usuarios)}
                  />
                </TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => handleOpenEditDialog(usuario)}>
                    <Edit />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      )}

      {/* Dialog para editar rol */}
      <Dialog open={editDialog.open} onClose={handleCloseEditDialog}>
        <DialogTitle>Editar Rol de Usuario</DialogTitle>
        <DialogContent sx={{ minWidth: 400, pt: 2 }}>
          {editDialog.usuario && (
            <>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Usuario: {editDialog.usuario.nombre} {editDialog.usuario.apellido}
              </Typography>
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Rol</InputLabel>
                <Select value={newRol} label="Rol" onChange={(e) => setNewRol(e.target.value)}>
                  <MenuItem value="cliente">Cliente</MenuItem>
                  <MenuItem value="guia">Guía</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </FormControl>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancelar</Button>
          <Button onClick={handleSaveRol} variant="contained">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
