"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
  Button,
  Alert,
  CircularProgress,
  Divider,
  TextField,
} from "@mui/material"
import {
  People as PeopleIcon,
  Hiking as HikingIcon,
  PersonPin as GuideIcon,
  BookOnline as ReservasIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Percent as PercentIcon,
} from "@mui/icons-material"
import { viajesAPI, reservasAPI, guiasAPI, usuariosAPI } from "../../services/api"

const StatCard = ({ title, value, icon, trend, subtitle }) => (
  <Card elevation={2}>
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box flex={1}>
          <Typography color="textSecondary" gutterBottom variant="h6">
            {title}
          </Typography>
          <Typography variant="h4" component="h2" sx={{ color: "#64b5f6" }}>
            {value}
          </Typography>
          {trend !== undefined && trend !== null && (
            <Box display="flex" alignItems="center" mt={0.5}>
              {trend > 0 ? (
                <TrendingUpIcon sx={{ fontSize: 16, color: "success.main", mr: 0.5 }} />
              ) : trend < 0 ? (
                <TrendingDownIcon sx={{ fontSize: 16, color: "error.main", mr: 0.5 }} />
              ) : null}
              <Typography
                variant="caption"
                sx={{
                  color: trend > 0 ? "success.main" : trend < 0 ? "error.main" : "text.secondary",
                }}
              >
                {trend > 0 ? "+" : ""}{trend.toFixed(1)}% vs mes anterior
              </Typography>
            </Box>
          )}
          {subtitle && (
            <Typography variant="caption" color="textSecondary" display="block" mt={0.5}>
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box sx={{ color: "#64b5f6" }}>{icon}</Box>
      </Box>
    </CardContent>
  </Card>
)

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
    default:
      return "default"
  }
}

const getDificultadColor = (dificultad) => {
  switch (dificultad) {
    case "facil":
      return "success"
    case "moderado":
      return "warning"
    case "dificil":
      return "error"
    case "extremo":
      return "error"
    default:
      return "default"
  }
}

export default function Dashboard({ onNavigate }) {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Inicializar con el mes actual por defecto
  const getDefaultDateRange = () => {
    const now = new Date()
    const primerDiaMes = new Date(now.getFullYear(), now.getMonth(), 1)
    const ultimoDiaMes = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    return {
      fecha_desde: primerDiaMes.toISOString().split('T')[0],
      fecha_hasta: ultimoDiaMes.toISOString().split('T')[0],
    }
  }

  const [dateRange, setDateRange] = useState(getDefaultDateRange())
  const [tempDateRange, setTempDateRange] = useState(getDefaultDateRange())

  useEffect(() => {
    loadDashboardData()
  }, [dateRange])

  const handleApplyFilters = () => {
    setDateRange(tempDateRange)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleApplyFilters()
    }
  }

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      // Cargar datos en paralelo
      const [viajesResponse, reservasResponse, guiasResponse, usuariosResponse, todasReservasResponse] = await Promise.all([
        viajesAPI.getViajes().catch(() => ({ data: { viajes: [] } })),
        reservasAPI.getReservas({ limit: 1000 }).catch(() => ({ data: { reservas: [] } })),
        guiasAPI.getGuias().catch(() => ({ data: { guias: [] } })),
        usuariosAPI.getUsuarios({ limit: 1000 }).catch(() => ({ data: { usuarios: [] } })),
        reservasAPI.getReservas({ limit: 1000 }).catch(() => ({ data: { reservas: [] } })), // Todas las reservas para comparación
      ])

      const viajes = viajesResponse.data?.viajes || []
      let reservas = todasReservasResponse.data?.reservas || []
      const guias = guiasResponse.data?.guias || []
      const usuarios = usuariosResponse.data?.usuarios || []

      // Calcular fechas del mes anterior para comparación
      const now = new Date()
      const primerDiaMesAnterior = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const ultimoDiaMesAnterior = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

      // Reservas del mes anterior
      const reservasMesAnterior = reservas.filter((reserva) => {
        const fecha = new Date(reserva.fecha_reserva)
        return fecha >= primerDiaMesAnterior && fecha <= ultimoDiaMesAnterior
      })

      // Filtrar reservas por rango de fechas del mes actual
      let reservasPeriodo = reservas
      if (dateRange.fecha_desde || dateRange.fecha_hasta) {
        reservasPeriodo = reservas.filter((reserva) => {
          const fechaReserva = new Date(reserva.fecha_reserva)
          const desde = dateRange.fecha_desde ? new Date(dateRange.fecha_desde) : null
          const hasta = dateRange.fecha_hasta ? new Date(dateRange.fecha_hasta) : null

          if (desde && fechaReserva < desde) return false
          if (hasta) {
            const hastaFinal = new Date(hasta)
            hastaFinal.setHours(23, 59, 59, 999)
            if (fechaReserva > hastaFinal) return false
          }
          return true
        })
      }

      // Calcular ingresos del período actual
      const comprasUnicas = new Map()
      reservasPeriodo.forEach((reserva) => {
        if (["confirmada", "completada"].includes(reserva.estado_reserva) && reserva.compra) {
          const compraId = reserva.compra.id_compras
          const totalCompra = Number(reserva.compra.total_compra) || 0
          if (!comprasUnicas.has(compraId)) {
            comprasUnicas.set(compraId, totalCompra)
          }
        }
      })
      const ingresosMes = Array.from(comprasUnicas.values()).reduce((sum, total) => sum + total, 0)

      // Calcular ingresos del mes anterior
      const comprasMesAnterior = new Map()
      reservasMesAnterior.forEach((reserva) => {
        if (["confirmada", "completada"].includes(reserva.estado_reserva) && reserva.compra) {
          const compraId = reserva.compra.id_compras
          const totalCompra = Number(reserva.compra.total_compra) || 0
          if (!comprasMesAnterior.has(compraId)) {
            comprasMesAnterior.set(compraId, totalCompra)
          }
        }
      })
      const ingresosMesAnterior = Array.from(comprasMesAnterior.values()).reduce((sum, total) => sum + total, 0)

      // Calcular métricas adicionales
      const reservasConfirmadas = reservasPeriodo.filter((r) => ["confirmada", "completada"].includes(r.estado_reserva)).length
      const reservasCanceladas = reservasPeriodo.filter((r) => r.estado_reserva === "cancelada").length
      const totalReservasConEstado = reservasPeriodo.filter((r) => r.estado_reserva !== "pendiente").length

      const tasaConversion = totalReservasConEstado > 0 ? (reservasConfirmadas / totalReservasConEstado) * 100 : 0
      const tasaCancelacion = totalReservasConEstado > 0 ? (reservasCanceladas / totalReservasConEstado) * 100 : 0
      const ticketPromedio = reservasConfirmadas > 0 ? ingresosMes / reservasConfirmadas : 0

      // Comparación con mes anterior
      const cambioIngresos = ingresosMesAnterior > 0
        ? ((ingresosMes - ingresosMesAnterior) / ingresosMesAnterior) * 100
        : 0
      const cambioReservas = reservasMesAnterior.length > 0
        ? ((reservasPeriodo.length - reservasMesAnterior.length) / reservasMesAnterior.length) * 100
        : 0

      const estadisticas = {
        totalUsuarios: usuarios.length,
        totalViajes: viajes.length,
        totalGuias: guias.length,
        totalReservas: reservasPeriodo.length,
        ingresosMes,
        cambioIngresos,
        cambioReservas,
        tasaConversion,
        tasaCancelacion,
        ticketPromedio,
        reservasConfirmadas,
        reservasCanceladas,
      }

      const reservasPorEstado = ["pendiente", "confirmada", "cancelada", "completada"].map((estado) => ({
        estado,
        cantidad: reservasPeriodo.filter((r) => r.estado_reserva === estado).length,
      }))

      // Obtener próximas salidas reales con cupos
      const ahora = new Date()
      const en7Dias = new Date(ahora.getTime() + 7 * 24 * 60 * 60 * 1000)

      const proximasSalidas = []
      for (const viaje of viajes) {
        try {
          const fechasResponse = await viajesAPI.getFechasViaje(viaje.id_viaje)
          if (fechasResponse.success && fechasResponse.data.fechas) {
            fechasResponse.data.fechas.forEach((fecha) => {
              const fechaInicio = new Date(fecha.fecha_inicio)
              if (fechaInicio >= ahora && fechaInicio <= en7Dias) {
                proximasSalidas.push({
                  viaje: {
                    titulo: viaje.titulo,
                    dificultad: viaje.dificultad,
                  },
                  fecha_salida: fecha.fecha_inicio,
                  cupos_ocupados: fecha.cupos_ocupados || 0,
                  cupos_maximos: fecha.cupos_disponibles || viaje.maximo_participantes || 15,
                  duracion_dias: viaje.duracion_dias,
                  id_viaje: viaje.id_viaje,
                })
              }
            })
          }
        } catch (error) {
          console.error(`Error cargando fechas para viaje ${viaje.id_viaje}:`, error)
        }
      }

      // Ordenar por fecha y limitar a 5
      proximasSalidas.sort((a, b) => new Date(a.fecha_salida) - new Date(b.fecha_salida))
      const proximasSalidasLimitadas = proximasSalidas.slice(0, 5)

      // Viajes más populares (por cantidad de reservas)
      const viajesPorReservas = {}
      reservasPeriodo.forEach((reserva) => {
        const viajeId = reserva.fecha_viaje?.viaje?.id_viaje
        if (viajeId) {
          if (!viajesPorReservas[viajeId]) {
            viajesPorReservas[viajeId] = {
              viaje: reserva.fecha_viaje.viaje,
              cantidad: 0,
              ingresos: 0,
            }
          }
          viajesPorReservas[viajeId].cantidad++
          if (["confirmada", "completada"].includes(reserva.estado_reserva)) {
            viajesPorReservas[viajeId].ingresos += Number(reserva.compra?.total_compra || 0)
          }
        }
      })

      const viajesPopulares = Object.values(viajesPorReservas)
        .sort((a, b) => b.cantidad - a.cantidad)
        .slice(0, 5)

      // Alertas y notificaciones
      const alertas = []

      // Reservas pendientes hace más de 3 días
      const tresDiasAtras = new Date(ahora.getTime() - 3 * 24 * 60 * 60 * 1000)
      const reservasPendientesAntiguas = reservas.filter((r) =>
        r.estado_reserva === "pendiente" && new Date(r.fecha_reserva) < tresDiasAtras
      ).length

      if (reservasPendientesAntiguas > 0) {
        alertas.push({
          tipo: "warning",
          mensaje: `${reservasPendientesAntiguas} reserva(s) pendiente(s) hace más de 3 días`,
          icono: "warning",
        })
      }

      // Viajes próximos con baja ocupación (menos del 30%)
      const viajesBajaOcupacion = proximasSalidas.filter((salida) => {
        const ocupacion = (salida.cupos_ocupados / salida.cupos_maximos) * 100
        return ocupacion < 30
      }).length

      if (viajesBajaOcupacion > 0) {
        alertas.push({
          tipo: "info",
          mensaje: `${viajesBajaOcupacion} salida(s) próxima(s) con ocupación menor al 30%`,
          icono: "info",
        })
      }

      // Viajes con cupos casi completos (más del 80%)
      const viajesCasiCompletos = proximasSalidas.filter((salida) => {
        const ocupacion = (salida.cupos_ocupados / salida.cupos_maximos) * 100
        return ocupacion >= 80
      }).length

      if (viajesCasiCompletos > 0) {
        alertas.push({
          tipo: "success",
          mensaje: `${viajesCasiCompletos} salida(s) con más del 80% de ocupación`,
          icono: "success",
        })
      }

      setDashboardData({
        estadisticas,
        reservasPorEstado,
        proximasSalidas: proximasSalidasLimitadas,
        viajesPopulares,
        alertas,
      })
    } catch (err) {
      setError(err.message || "Error al cargar datos del dashboard")
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(amount)

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" })

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px"><CircularProgress sx={{ color: "#64b5f6" }} /></Box>

  if (error)
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
        <Button onClick={loadDashboardData} sx={{ ml: 2, color: "#64b5f6" }}>
          Reintentar
        </Button>
      </Alert>
    )

  const { estadisticas, reservasPorEstado, proximasSalidas, viajesPopulares, alertas } = dashboardData || {}

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ color: "#64b5f6" }}>
        Dashboard
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" gutterBottom>
        Resumen general del sistema
      </Typography>

      {/* Filtros de fecha */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              Filtrar por rango de fechas
            </Typography>
            <Chip
              label={dateRange.fecha_desde && dateRange.fecha_hasta ? "Mes actual" : "Todo el histórico"}
              color={dateRange.fecha_desde && dateRange.fecha_hasta ? "primary" : "default"}
              size="small"
            />
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Fecha desde"
                type="date"
                value={tempDateRange.fecha_desde}
                onChange={(e) => setTempDateRange({ ...tempDateRange, fecha_desde: e.target.value })}
                onKeyDown={handleKeyDown}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Fecha hasta"
                type="date"
                value={tempDateRange.fecha_hasta}
                onChange={(e) => setTempDateRange({ ...tempDateRange, fecha_hasta: e.target.value })}
                onKeyDown={handleKeyDown}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box display="flex" gap={1} height="100%">
                <Button
                  variant="contained"
                  onClick={handleApplyFilters}
                  sx={{ height: "56px", bgcolor: "#64b5f6", flex: 1 }}
                >
                  Aplicar
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setTempDateRange({ fecha_desde: "", fecha_hasta: "" })
                    setDateRange({ fecha_desde: "", fecha_hasta: "" })
                  }}
                  sx={{ height: "56px", color: "#64b5f6", borderColor: "#64b5f6" }}
                >
                  Ver todo
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    const defaultRange = getDefaultDateRange()
                    setTempDateRange(defaultRange)
                    setDateRange(defaultRange)
                  }}
                  sx={{ height: "56px", color: "#64b5f6", borderColor: "#64b5f6", minWidth: "100px" }}
                >
                  Mes actual
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Alertas */}
      {alertas && alertas.length > 0 && (
        <Box mb={3}>
          {alertas.map((alerta, index) => (
            <Alert key={index} severity={alerta.tipo} sx={{ mb: 1 }}>
              {alerta.mensaje}
            </Alert>
          ))}
        </Box>
      )}

      {/* Métricas Principales */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Usuarios"
            value={estadisticas?.totalUsuarios || 0}
            icon={<PeopleIcon fontSize="large" />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Viajes Activos"
            value={estadisticas?.totalViajes || 0}
            icon={<HikingIcon fontSize="large" />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Guías Activos"
            value={estadisticas?.totalGuias || 0}
            icon={<GuideIcon fontSize="large" />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Reservas"
            value={estadisticas?.totalReservas || 0}
            icon={<ReservasIcon fontSize="large" />}
            trend={estadisticas?.cambioReservas}
          />
        </Grid>
      </Grid>

      {/* Métricas de Negocio */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Tasa de Conversión"
            value={`${(estadisticas?.tasaConversion || 0).toFixed(1)}%`}
            icon={<CheckCircleIcon fontSize="large" />}
            subtitle={`${estadisticas?.reservasConfirmadas || 0} confirmadas`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Ticket Promedio"
            value={formatCurrency(estadisticas?.ticketPromedio || 0)}
            icon={<MoneyIcon fontSize="large" />}
            subtitle="Por reserva confirmada"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Tasa de Cancelación"
            value={`${(estadisticas?.tasaCancelacion || 0).toFixed(1)}%`}
            icon={<CancelIcon fontSize="large" />}
            subtitle={`${estadisticas?.reservasCanceladas || 0} canceladas`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Ingresos Totales"
            value={formatCurrency(estadisticas?.ingresosMes || 0)}
            icon={<MoneyIcon fontSize="large" />}
            trend={estadisticas?.cambioIngresos}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Viajes Más Populares */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Viajes Más Populares
              </Typography>
              {viajesPopulares && viajesPopulares.length > 0 ? (
                <List dense>
                  {viajesPopulares.map((item, index) => (
                    <ListItem key={index} sx={{ px: 0 }}>
                      <ListItemText
                        primary={
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="body1">{item.viaje?.titulo}</Typography>
                            <Box display="flex" gap={1} alignItems="center">
                              <Chip
                                label={`${item.cantidad} reservas`}
                                color="primary"
                                size="small"
                                variant="outlined"
                              />
                              <Typography variant="body2" color="textSecondary">
                                {formatCurrency(item.ingresos)}
                              </Typography>
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography color="textSecondary">No hay datos suficientes en este período</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Reservas por Estado */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Reservas por Estado</Typography>
              <List dense>
                {reservasPorEstado?.map((item, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemText
                      primary={
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="body1" sx={{ textTransform: "capitalize" }}>{item.estado}</Typography>
                          <Chip label={item.cantidad} color={getEstadoColor(item.estado)} size="small" variant="outlined" />
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Próximas Salidas (7 días)</Typography>
            {proximasSalidas?.length > 0 ? (
              <List>
                {proximasSalidas.map((salida, index) => (
                  <Box key={index}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText
                        primary={
                          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap">
                            <Typography variant="subtitle1" sx={{ fontWeight: "medium" }}>{salida.viaje?.titulo}</Typography>
                            <Box display="flex" gap={1} alignItems="center">
                              <Chip label={salida.viaje?.dificultad} color={getDificultadColor(salida.viaje?.dificultad)} size="small" sx={{ textTransform: "capitalize" }} />
                              <Typography variant="body2" color="textSecondary">{formatDate(salida.fecha_salida)}</Typography>
                            </Box>
                          </Box>
                        }
                        secondary={
                          <Box mt={1}>
                            <Typography variant="body2" color="textSecondary">
                              Cupos: {salida.cupos_ocupados || 0}/{salida.cupos_maximos || 0} • {salida.duracion_dias} días
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < proximasSalidas.length - 1 && <Divider />}
                  </Box>
                ))}
              </List>
            ) : (
              <Typography color="textSecondary">No hay salidas programadas para los próximos 7 días</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Acciones rápidas */}
      <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>Acciones Rápidas</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<HikingIcon />}
              sx={{ color: "#64b5f6", borderColor: "#64b5f6" }}
              onClick={() => onNavigate("/admin/viajes")}
            >
              Nuevo Viaje
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<GuideIcon />}
              sx={{ color: "#64b5f6", borderColor: "#64b5f6" }}
              onClick={() => onNavigate("/admin/guias")}
            >
              Nuevo Guía
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<ReservasIcon />}
              sx={{ color: "#64b5f6", borderColor: "#64b5f6" }}
              onClick={() => onNavigate("/admin/reservas")}
            >
              Ver Reservas
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<PeopleIcon />}
              sx={{ color: "#64b5f6", borderColor: "#64b5f6" }}
              onClick={() => onNavigate("/admin/usuarios")}
            >
              Gestionar Usuarios
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  )
}
