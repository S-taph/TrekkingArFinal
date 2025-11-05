import { useState, useEffect } from "react"
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Paper,
  IconButton,
  Tooltip,
} from "@mui/material"
import {
  Event,
  Person,
  AttachMoney,
  Cancel,
  Search,
  Payment,
  Description,
  Support,
  ContentCopy,
  CheckCircle,
  AccessTime,
  WhatsApp,
  Download,
} from "@mui/icons-material"
import Header from "../components/Header"
import { useAuth } from "../context/AuthContext"
import { reservasAPI } from "../services/api"

const estadoColors = {
  pendiente: "warning",
  confirmada: "success",
  cancelada: "error",
  completada: "info",
}

const estadoLabels = {
  pendiente: "Pago Pendiente",
  confirmada: "Confirmada",
  cancelada: "Cancelada",
  completada: "Completada",
}

// Datos bancarios para transferencias (mock - deberían venir del backend)
const DATOS_BANCARIOS = {
  banco: "Banco Galicia",
  titular: "TrekkingAR S.A.",
  cbu: "0070999530000012345678",
  alias: "TREKKING.AR",
  cuit: "30-71234567-8",
}

/**
 * MyReservationsPage - Página de mis reservas mejorada
 * ✅ Conectado con backend real
 * ✅ Filtros por estado
 * ✅ Búsqueda
 * ✅ Gestión de pagos pendientes
 * ✅ Contacto con soporte
 */
export default function MyReservationsPage() {
  const { user } = useAuth()
  const [reservations, setReservations] = useState([])
  const [filteredReservations, setFilteredReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState(0) // 0: Activas, 1: Historial
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [copiedField, setCopiedField] = useState(null)

  useEffect(() => {
    document.title = "Mis Reservas - TrekkingAR"
    loadReservations()
  }, [])

  useEffect(() => {
    filterReservations()
  }, [reservations, searchQuery, activeTab])

  const loadReservations = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await reservasAPI.getMisReservas()

      if (response.success) {
        setReservations(response.data.reservas || [])
      }
    } catch (error) {
      console.error("Error cargando reservas:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const filterReservations = () => {
    let filtered = reservations

    // Filtrar por tab (Activas vs Historial)
    if (activeTab === 0) {
      // Activas: pendiente y confirmada
      filtered = filtered.filter(
        (r) => r.estado_reserva === "pendiente" || r.estado_reserva === "confirmada"
      )
    } else {
      // Historial: completada y cancelada
      filtered = filtered.filter(
        (r) => r.estado_reserva === "completada" || r.estado_reserva === "cancelada"
      )
    }

    // Filtrar por búsqueda
    if (searchQuery) {
      filtered = filtered.filter(
        (r) =>
          r.numero_reserva?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.fecha_viaje?.viaje?.titulo?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredReservations(filtered)
  }

  const handleCancel = async (id) => {
    if (!window.confirm("¿Estás seguro de cancelar esta reserva?")) return

    try {
      const response = await reservasAPI.cancelReserva(id)

      if (response.success) {
        await loadReservations()
        alert("Reserva cancelada exitosamente")
      }
    } catch (error) {
      console.error("Error cancelando reserva:", error)
      setError(error.message)
    }
  }

  const handleOpenPaymentDialog = (reservation) => {
    setSelectedPayment(reservation)
  }

  const handleClosePaymentDialog = () => {
    setSelectedPayment(null)
    setCopiedField(null)
  }

  const handleCopyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const handleContactSupport = (reservation) => {
    const mensaje = `Hola! Necesito ayuda con mi reserva ${reservation.numero_reserva} para el viaje "${reservation.fecha_viaje?.viaje?.titulo}".`
    const whatsappUrl = `https://wa.me/5491112345678?text=${encodeURIComponent(mensaje)}`
    window.open(whatsappUrl, "_blank")
  }

  const getDaysUntilTrip = (fechaInicio) => {
    if (!fechaInicio) return null
    const today = new Date()
    const tripDate = new Date(fechaInicio)
    const diffTime = tripDate - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const ReservationCard = ({ reservation }) => {
    const daysUntilTrip = getDaysUntilTrip(reservation.fecha_viaje?.fecha_inicio)
    const isPending = reservation.estado_reserva === "pendiente"
    const isConfirmed = reservation.estado_reserva === "confirmada"
    const isUpcoming = daysUntilTrip !== null && daysUntilTrip > 0

    return (
      <Card
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          border: isPending ? "2px solid" : "1px solid",
          borderColor: isPending ? "warning.main" : "divider",
        }}
      >
        {isPending && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bgcolor: "warning.main",
              color: "white",
              py: 0.5,
              px: 2,
              display: "flex",
              alignItems: "center",
              gap: 1,
              fontSize: "0.875rem",
            }}
          >
            <AccessTime fontSize="small" />
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              Pago pendiente - Completa tu reserva antes de 48 horas
            </Typography>
          </Box>
        )}

        <CardContent sx={{ flexGrow: 1, pt: isPending ? 5 : 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
              {reservation.fecha_viaje?.viaje?.titulo || "Viaje sin título"}
            </Typography>
            <Chip
              label={estadoLabels[reservation.estado_reserva] || reservation.estado_reserva}
              color={estadoColors[reservation.estado_reserva]}
              size="small"
            />
          </Box>

          <Typography variant="body2" color="text.secondary" gutterBottom>
            Reserva N° {reservation.numero_reserva}
          </Typography>

          {isConfirmed && isUpcoming && (
            <Alert severity="info" sx={{ mt: 1, mb: 2 }}>
              <Typography variant="caption">
                {daysUntilTrip === 1
                  ? "¡Tu viaje es mañana!"
                  : `Faltan ${daysUntilTrip} días para tu viaje`}
              </Typography>
            </Alert>
          )}

          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <Event fontSize="small" color="action" />
            <Typography variant="body2">
              {reservation.fecha_viaje?.fecha_inicio &&
                new Date(reservation.fecha_viaje.fecha_inicio).toLocaleDateString("es-AR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}{" "}
              -{" "}
              {reservation.fecha_viaje?.fecha_fin &&
                new Date(reservation.fecha_viaje.fecha_fin).toLocaleDateString("es-AR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <Person fontSize="small" color="action" />
            <Typography variant="body2">
              {reservation.cantidad_personas}{" "}
              {reservation.cantidad_personas === 1 ? "persona" : "personas"}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <AttachMoney fontSize="small" color="action" />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              ${Number(reservation.subtotal_reserva || 0).toLocaleString("es-AR")}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <AccessTime fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              Reservado:{" "}
              {reservation.fecha_reserva &&
                new Date(reservation.fecha_reserva).toLocaleDateString("es-AR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
            </Typography>
          </Box>

          {isPending && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="caption">
                Estado de pago:{" "}
                <strong>{reservation.compra?.estado_compra || "pendiente"}</strong>
              </Typography>
            </Alert>
          )}
        </CardContent>

        <CardActions sx={{ justifyContent: "space-between", px: 2, pb: 2, flexWrap: "wrap", gap: 1 }}>
          {isPending && (
            <>
              <Button
                size="small"
                variant="contained"
                color="warning"
                startIcon={<Payment />}
                onClick={() => handleOpenPaymentDialog(reservation)}
                fullWidth
                sx={{ mb: 1 }}
              >
                Pagar Ahora
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<Support />}
                onClick={() => handleContactSupport(reservation)}
              >
                Contactar Soporte
              </Button>
              <Button
                size="small"
                color="error"
                startIcon={<Cancel />}
                onClick={() => handleCancel(reservation.id_reserva)}
              >
                Cancelar
              </Button>
            </>
          )}

          {isConfirmed && (
            <>
              <Button
                size="small"
                variant="outlined"
                startIcon={<Description />}
                onClick={() => alert("Funcionalidad de descarga en desarrollo")}
              >
                Descargar Voucher
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<WhatsApp />}
                onClick={() => handleContactSupport(reservation)}
              >
                Contactar Guía
              </Button>
              <Button
                size="small"
                color="error"
                startIcon={<Cancel />}
                onClick={() => handleCancel(reservation.id_reserva)}
              >
                Cancelar
              </Button>
            </>
          )}

          {(reservation.estado_reserva === "completada" ||
            reservation.estado_reserva === "cancelada") && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<Download />}
              onClick={() => alert("Funcionalidad de descarga de factura en desarrollo")}
            >
              Descargar Factura
            </Button>
          )}
        </CardActions>
      </Card>
    )
  }

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      <Header />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Mis Reservas
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Gestiona tus reservas, pagos y próximos viajes
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Búsqueda */}
        <TextField
          fullWidth
          placeholder="Buscar por número de reserva o nombre del viaje..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />

        {/* Tabs: Activas / Historial */}
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
          <Tab
            label={`Reservas Activas (${
              reservations.filter(
                (r) => r.estado_reserva === "pendiente" || r.estado_reserva === "confirmada"
              ).length
            })`}
          />
          <Tab
            label={`Historial (${
              reservations.filter(
                (r) => r.estado_reserva === "completada" || r.estado_reserva === "cancelada"
              ).length
            })`}
          />
        </Tabs>

        {/* Lista de reservas */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : filteredReservations.length === 0 ? (
          <Alert severity="info">
            {searchQuery
              ? "No se encontraron reservas con ese criterio de búsqueda."
              : activeTab === 0
                ? "No tienes reservas activas. Explora nuestro catálogo para comenzar tu aventura."
                : "No tienes reservas en el historial."}
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {filteredReservations.map((reservation) => (
              <Grid item xs={12} md={6} key={reservation.id_reserva}>
                <ReservationCard reservation={reservation} />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* Dialog de información de pago */}
      <Dialog
        open={Boolean(selectedPayment)}
        onClose={handleClosePaymentDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Payment color="primary" />
            <Typography variant="h6">Completar Pago</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 3 }}>
            Realiza la transferencia bancaria por el monto indicado y luego contacta a soporte para
            validar tu pago.
          </Alert>

          <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: "grey.50" }}>
            <Typography variant="h6" color="primary" gutterBottom>
              Monto a pagar: ${Number(selectedPayment?.subtotal_reserva || 0).toLocaleString("es-AR")}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Reserva: {selectedPayment?.numero_reserva}
            </Typography>
          </Paper>

          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
            Datos Bancarios para Transferencia:
          </Typography>

          <List dense>
            <ListItem
              secondaryAction={
                <Tooltip title={copiedField === "cbu" ? "¡Copiado!" : "Copiar"}>
                  <IconButton
                    edge="end"
                    onClick={() => handleCopyToClipboard(DATOS_BANCARIOS.cbu, "cbu")}
                  >
                    {copiedField === "cbu" ? (
                      <CheckCircle color="success" />
                    ) : (
                      <ContentCopy />
                    )}
                  </IconButton>
                </Tooltip>
              }
            >
              <ListItemText primary="CBU" secondary={DATOS_BANCARIOS.cbu} />
            </ListItem>

            <ListItem
              secondaryAction={
                <Tooltip title={copiedField === "alias" ? "¡Copiado!" : "Copiar"}>
                  <IconButton
                    edge="end"
                    onClick={() => handleCopyToClipboard(DATOS_BANCARIOS.alias, "alias")}
                  >
                    {copiedField === "alias" ? (
                      <CheckCircle color="success" />
                    ) : (
                      <ContentCopy />
                    )}
                  </IconButton>
                </Tooltip>
              }
            >
              <ListItemText primary="Alias" secondary={DATOS_BANCARIOS.alias} />
            </ListItem>

            <Divider sx={{ my: 1 }} />

            <ListItem>
              <ListItemText primary="Titular" secondary={DATOS_BANCARIOS.titular} />
            </ListItem>

            <ListItem>
              <ListItemText primary="CUIT" secondary={DATOS_BANCARIOS.cuit} />
            </ListItem>

            <ListItem>
              <ListItemText primary="Banco" secondary={DATOS_BANCARIOS.banco} />
            </ListItem>
          </List>

          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="caption">
              ⏰ Tienes 48 horas para realizar el pago. Si no se confirma en ese plazo, la reserva
              será cancelada automáticamente.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePaymentDialog}>Cerrar</Button>
          <Button
            variant="contained"
            startIcon={<WhatsApp />}
            onClick={() => {
              handleContactSupport(selectedPayment)
              handleClosePaymentDialog()
            }}
          >
            Contactar para Validar Pago
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
