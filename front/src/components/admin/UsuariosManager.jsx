"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
  IconButton,
  Chip,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  TextField,
  Grid,
  Paper,
  InputAdornment,
  Avatar,
} from "@mui/material"
import { DataGrid } from "@mui/x-data-grid"
import { Edit, Search, ManageAccounts } from "@mui/icons-material"
import { usuariosAPI } from "../../services/api.js"
import RoleManager from "./RoleManager"

export default function UsuariosManager() {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [editDialog, setEditDialog] = useState({ open: false, usuario: null })
  const [roleDialog, setRoleDialog] = useState({ open: false, usuario: null })
  const [newRol, setNewRol] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  // Filtros
  const [searchTerm, setSearchTerm] = useState("")
  const [activeSearch, setActiveSearch] = useState("")
  const [filterRol, setFilterRol] = useState("")
  const [filterActivo, setFilterActivo] = useState("")
  const [orderBy, setOrderBy] = useState("apellido")

  // Cargar usuarios cuando cambien los filtros
  useEffect(() => {
    loadUsuarios()
  }, [activeSearch, filterRol, filterActivo, orderBy])

  const loadUsuarios = async () => {
    try {
      setLoading(true)
      setError("")

      // Construir parámetros de consulta
      const params = {}
      if (activeSearch) params.search = activeSearch
      if (filterRol) params.rol = filterRol
      if (filterActivo !== "") params.activo = filterActivo
      if (orderBy) {
        params.orderBy = orderBy
        params.orderDir = 'ASC'
      }

      const data = await usuariosAPI.getUsuarios(params)
      console.log('[UsuariosManager] Usuarios recibidos:', data)
      console.log('[UsuariosManager] Primer usuario (muestra):', data[0])
      setUsuarios(data)
    } catch (err) {
      console.error("Error al cargar usuarios:", err)
      setError(err.message || "Error al cargar usuarios")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setActiveSearch(searchTerm)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleClearFilters = () => {
    setSearchTerm("")
    setActiveSearch("")
    setFilterRol("")
    setFilterActivo("")
    setOrderBy("apellido")
  }

  const handleToggleActive = async (id) => {
    const usuario = usuarios.find((u) => u.id_usuarios === id)
    if (!usuario) return

    try {
      await usuariosAPI.updateUsuario(id, {
        activo: !usuario.activo,
      })

      setUsuarios((prev) =>
        prev.map((u) => (u.id_usuarios === id ? { ...u, activo: !u.activo } : u)),
      )
      setSuccessMessage("Estado del usuario actualizado correctamente")
    } catch (error) {
      console.error("Error actualizando usuario:", error)
      setError(error.message || "Error al actualizar el estado del usuario")
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
      await usuariosAPI.updateUsuario(editDialog.usuario.id_usuarios, {
        rol: newRol,
      })

      // Recargar usuarios desde el backend para reflejar el estado real de la base de datos
      await loadUsuarios()

      setSuccessMessage(`Rol actualizado a "${newRol}" correctamente`)
      handleCloseEditDialog()
    } catch (error) {
      console.error("Error actualizando rol:", error)
      setError(error.message || "Error al actualizar el rol del usuario")
    }
  }

  const handleOpenRoleDialog = (usuario) => {
    setRoleDialog({ open: true, usuario })
  }

  const handleCloseRoleDialog = () => {
    setRoleDialog({ open: false, usuario: null })
  }

  const handleRoleSuccess = (message) => {
    setSuccessMessage(message)
    loadUsuarios() // Recargar usuarios para actualizar roles
  }

  const columns = [
    { field: "id_usuarios", headerName: "ID", width: 90 },
    {
      field: "avatar",
      headerName: "Foto",
      width: 80,
      renderCell: (params) => (
        <Avatar
          src={params.row.avatar}
          sx={{ width: 40, height: 40 }}
        >
          {params.row.nombre?.charAt(0)}{params.row.apellido?.charAt(0)}
        </Avatar>
      ),
    },
    { field: "nombre", headerName: "Nombre", width: 150 },
    { field: "apellido", headerName: "Apellido", width: 150 },
    { field: "email", headerName: "Email", width: 200 },
    { field: "dni", headerName: "DNI", width: 120 },
    {
      field: "rol",
      headerName: "Roles",
      width: 200,
      renderCell: (params) => {
        const roles = params.row.rolesArray || [params.value]
        return (
          <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
            {roles.map((rol) => (
              <Chip
                key={rol}
                label={rol}
                size="small"
                color={rol === "admin" ? "primary" : rol === "guia" ? "secondary" : "default"}
              />
            ))}
          </Box>
        )
      },
    },
    {
      field: "activo",
      headerName: "Activo",
      width: 100,
      renderCell: (params) => (
        <Switch
          checked={params.value ?? false}
          onChange={() => handleToggleActive(params.row.id_usuarios)}
          color="primary"
        />
      ),
    },
    {
      field: "acciones",
      headerName: "Acciones",
      width: 150,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton
            size="small"
            onClick={() => handleOpenEditDialog(params.row)}
            sx={{ color: "#64b5f6" }}
            title="Editar rol principal"
          >
            <Edit />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleOpenRoleDialog(params.row)}
            sx={{ color: "#9c27b0" }}
            title="Gestionar múltiples roles"
          >
            <ManageAccounts />
          </IconButton>
        </Box>
      ),
    },
  ]

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress sx={{ color: "#64b5f6" }} />
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
        <Button onClick={loadUsuarios} sx={{ ml: 2, color: "#64b5f6" }}>
          Reintentar
        </Button>
      </Alert>
    )
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ color: "#64b5f6" }}>
        Gestión de Usuarios
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* Barra de búsqueda y filtros */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          {/* Barra de búsqueda */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Buscar por nombre, apellido, email o DNI..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={handleSearch}
                      sx={{ color: "#64b5f6" }}
                    >
                      <Search />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Filtro por rol */}
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Rol</InputLabel>
              <Select
                value={filterRol}
                label="Rol"
                onChange={(e) => setFilterRol(e.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="cliente">Cliente</MenuItem>
                <MenuItem value="guia">Guía</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Filtro por estado */}
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Estado</InputLabel>
              <Select
                value={filterActivo}
                label="Estado"
                onChange={(e) => setFilterActivo(e.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="true">Activos</MenuItem>
                <MenuItem value="false">Inactivos</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Ordenar por */}
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Ordenar por</InputLabel>
              <Select
                value={orderBy}
                label="Ordenar por"
                onChange={(e) => setOrderBy(e.target.value)}
              >
                <MenuItem value="apellido">Apellido</MenuItem>
                <MenuItem value="nombre">Nombre</MenuItem>
                <MenuItem value="dni">DNI</MenuItem>
                <MenuItem value="email">Email</MenuItem>
                <MenuItem value="rol">Rol</MenuItem>
                <MenuItem value="created_at">Fecha de registro</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Botón limpiar filtros */}
          <Grid item xs={12} sm={6} md={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={handleClearFilters}
              sx={{ color: "#64b5f6", borderColor: "#64b5f6" }}
            >
              Limpiar filtros
            </Button>
          </Grid>
        </Grid>

        {/* Contador de resultados */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Mostrando {usuarios.length} usuario{usuarios.length !== 1 ? 's' : ''}
          </Typography>
        </Box>
      </Paper>

      <Box sx={{ height: 500, width: "100%" }}>
        <DataGrid
          rows={usuarios}
          columns={columns}
          getRowId={(row) => row.id_usuarios}
          pageSize={10}
          rowsPerPageOptions={[10, 20, 50]}
          disableSelectionOnClick
        />
      </Box>

      {/* Dialog para editar rol */}
      <Dialog open={editDialog.open} onClose={handleCloseEditDialog}>
        <DialogTitle sx={{ color: "#64b5f6" }}>Editar Rol de Usuario</DialogTitle>
        <DialogContent sx={{ minWidth: 400, pt: 2 }}>
          {editDialog.usuario && (
            <>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Usuario: {editDialog.usuario.nombre} {editDialog.usuario.apellido}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Email: {editDialog.usuario.email}
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
          <Button onClick={handleSaveRol} variant="contained" sx={{ bgcolor: "#64b5f6" }}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de gestión de roles múltiples */}
      <RoleManager
        usuario={roleDialog.usuario}
        open={roleDialog.open}
        onClose={handleCloseRoleDialog}
        onSuccess={handleRoleSuccess}
      />

      {/* Snackbar de éxito */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage("")}
        message={successMessage}
      />
    </Box>
  )
}
