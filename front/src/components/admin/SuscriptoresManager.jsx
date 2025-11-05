import { useState, useEffect } from "react"
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@mui/material"
import EmailIcon from "@mui/icons-material/Email"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import CancelIcon from "@mui/icons-material/Cancel"
import TrendingUpIcon from "@mui/icons-material/TrendingUp"
import PeopleIcon from "@mui/icons-material/People"
import { newsletterAPI } from "../../services/api"

const SuscriptoresManager = () => {
  const [suscriptores, setSuscriptores] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState(null)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [totalSuscriptores, setTotalSuscriptores] = useState(0)
  const [filtroActivo, setFiltroActivo] = useState("all")

  // Cargar estadísticas
  const loadStats = async () => {
    try {
      const response = await newsletterAPI.getStats()
      setStats(response.data)
    } catch (err) {
      console.error("Error cargando estadísticas:", err)
    }
  }

  // Cargar suscriptores
  const loadSuscriptores = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = {
        page: page + 1,
        limit: rowsPerPage
      }

      if (filtroActivo !== "all") {
        params.activo = filtroActivo === "activos"
      }

      const response = await newsletterAPI.getSuscriptores(params)

      setSuscriptores(response.data)
      setTotalSuscriptores(response.pagination.total)
    } catch (err) {
      console.error("Error cargando suscriptores:", err)
      setError(err.message || "Error al cargar los suscriptores")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  useEffect(() => {
    loadSuscriptores()
  }, [page, rowsPerPage, filtroActivo])

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleFiltroChange = (event) => {
    setFiltroActivo(event.target.value)
    setPage(0)
  }

  const formatDate = (dateString) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleDateString("es-AR", {
      year: "numeric",
      month: "short",
      day: "numeric"
    })
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Gestión de Suscriptores
      </Typography>

      {/* Tarjetas de estadísticas */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <PeopleIcon sx={{ color: "primary.main", mr: 1 }} />
                  <Typography variant="h6" color="text.secondary">
                    Total
                  </Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 600 }}>
                  {stats.total}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <CheckCircleIcon sx={{ color: "success.main", mr: 1 }} />
                  <Typography variant="h6" color="text.secondary">
                    Activos
                  </Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 600, color: "success.main" }}>
                  {stats.activos}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <CancelIcon sx={{ color: "error.main", mr: 1 }} />
                  <Typography variant="h6" color="text.secondary">
                    Inactivos
                  </Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 600, color: "error.main" }}>
                  {stats.inactivos}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <TrendingUpIcon sx={{ color: "info.main", mr: 1 }} />
                  <Typography variant="h6" color="text.secondary">
                    Último mes
                  </Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 600, color: "info.main" }}>
                  {stats.nuevasUltimoMes}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filtros */}
      <Box sx={{ mb: 3 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Filtrar por estado</InputLabel>
          <Select
            value={filtroActivo}
            label="Filtrar por estado"
            onChange={handleFiltroChange}
          >
            <MenuItem value="all">Todos</MenuItem>
            <MenuItem value="activos">Activos</MenuItem>
            <MenuItem value="inactivos">Inactivos</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Tabla de suscriptores */}
      <Paper elevation={2}>
        {error && (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "grey.100" }}>
                    <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Nombre</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Origen</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Fecha Suscripción</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Fecha Desuscripción</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {suscriptores.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">
                          No hay suscriptores para mostrar
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    suscriptores.map((suscriptor) => (
                      <TableRow
                        key={suscriptor.id_suscriptor}
                        hover
                        sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                      >
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <EmailIcon sx={{ mr: 1, color: "text.secondary", fontSize: 20 }} />
                            {suscriptor.email}
                          </Box>
                        </TableCell>
                        <TableCell>{suscriptor.nombre || "-"}</TableCell>
                        <TableCell>
                          <Chip
                            label={suscriptor.activo ? "Activo" : "Inactivo"}
                            color={suscriptor.activo ? "success" : "default"}
                            size="small"
                            icon={suscriptor.activo ? <CheckCircleIcon /> : <CancelIcon />}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip label={suscriptor.origen} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell>{formatDate(suscriptor.fecha_suscripcion)}</TableCell>
                        <TableCell>{formatDate(suscriptor.fecha_desuscripcion)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={totalSuscriptores}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Filas por página:"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
              }
            />
          </>
        )}
      </Paper>
    </Box>
  )
}

export default SuscriptoresManager
