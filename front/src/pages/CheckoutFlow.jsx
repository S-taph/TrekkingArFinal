import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  Container,
  Box,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Button,
  Grid,
  TextField,
  Divider,
  List,
  ListItem,
  ListItemText,
  Alert,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Card,
  CardMedia,
  CardContent,
  Chip,
} from "@mui/material"
import {
  ArrowBack,
  ArrowForward,
  CheckCircle,
} from "@mui/icons-material"
import Header from "../components/Header"
import { useCart } from "../context/CartContext"
import { useAuth } from "../context/AuthContext"
import { reservasAPI, pagosAPI } from "../services/api"
import MercadoPagoButton from "../components/MercadoPagoButton"

const steps = ["Resumen del Carrito", "Datos del Pasajero", "Pago", "Confirmación"]

/**
 * CheckoutFlow - Flujo de checkout por pasos
 */
export default function CheckoutFlow() {
  const navigate = useNavigate()
  const { items, totalPrice, clearCart } = useCart()
  const { user } = useAuth()

  const [activeStep, setActiveStep] = useState(0)
  const [passengerData, setPassengerData] = useState({
    nombre: user?.nombre || "",
    apellido: user?.apellido || "",
    email: user?.email || "",
    telefono: user?.telefono || "",
    dni: user?.dni || "",
    direccion: "",
  })
  const [paymentMethod, setPaymentMethod] = useState("mercadopago")
  const [cardData, setCardData] = useState({
    numero: "",
    nombre: "",
    vencimiento: "",
    cvv: "",
  })
  const [errors, setErrors] = useState({})
  const [reservationNumber, setReservationNumber] = useState(null)
  const [tarjetasPrueba, setTarjetasPrueba] = useState([])
  const [processing, setProcessing] = useState(false)
  const [compraId, setCompraId] = useState(null)

  useEffect(() => {
    document.title = "Checkout - TrekkingAR"

    // Si el carrito está vacío, redirigir
    if (items.length === 0 && activeStep === 0) {
      navigate("/catalogo")
    }

    // Cargar tarjetas de prueba
    loadTarjetasPrueba()
  }, [items, activeStep, navigate])

  const loadTarjetasPrueba = async () => {
    try {
      const response = await pagosAPI.getTarjetasPrueba()
      if (response.success) {
        setTarjetasPrueba(response.data.tarjetas)
      }
    } catch (error) {
      console.error("Error cargando tarjetas de prueba:", error)
    }
  }

  const handleNext = () => {
    // Validar según el paso actual
    if (activeStep === 1 && !validatePassengerData()) {
      return
    }

    if (activeStep === 2 && !validatePaymentData()) {
      return
    }

    // Paso 3: Procesar pago y crear reserva
    if (activeStep === 2) {
      processCheckout()
    }

    setActiveStep((prevStep) => prevStep + 1)
  }

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1)
  }

  const validatePassengerData = () => {
    const newErrors = {}

    if (!passengerData.nombre) newErrors.nombre = "Nombre requerido"
    if (!passengerData.apellido) newErrors.apellido = "Apellido requerido"
    if (!passengerData.email) newErrors.email = "Email requerido"
    if (!passengerData.telefono) newErrors.telefono = "Teléfono requerido"
    if (!passengerData.dni) newErrors.dni = "DNI requerido"

    // Validar formato email
    if (passengerData.email && !/\S+@\S+\.\S+/.test(passengerData.email)) {
      newErrors.email = "Email inválido"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validatePaymentData = () => {
    // Mercado Pago y "pagar después" no requieren validación de tarjeta
    if (paymentMethod === "mercadopago" || paymentMethod === "pay_later") {
      return true
    }

    // Solo validar datos de tarjeta si el método es "card" (simulación)
    const newErrors = {}

    if (!cardData.numero || cardData.numero.length < 16) {
      newErrors.numero = "Número de tarjeta inválido"
    }
    if (!cardData.nombre) newErrors.nombre = "Nombre requerido"
    if (!cardData.vencimiento) newErrors.vencimiento = "Vencimiento requerido"
    if (!cardData.cvv || cardData.cvv.length < 3) {
      newErrors.cvv = "CVV inválido"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const processCheckout = async () => {
    setProcessing(true)
    try {
      // Paso 1: Crear reservas desde el carrito
      const reservaPromises = items.map((item) => {
        // El backend devuelve fechaViaje (camelCase) en el carrito
        const fechaViaje = item.fechaViaje || item.fecha_viaje
        return reservasAPI.createReserva({
          id_fecha_viaje: fechaViaje.id_fechas_viaje,
          cantidad_personas: item.cantidad,
          observaciones_reserva: `Reserva desde checkout - ${passengerData.nombre} ${passengerData.apellido}`,
        })
      })

      const reservasResults = await Promise.all(reservaPromises)

      // Todas las reservas deberían tener el mismo id_compra
      const firstReserva = reservasResults[0].data?.reserva
      if (!firstReserva) {
        throw new Error("No se pudo crear la reserva")
      }

      const idCompra = firstReserva.compra.id_compras
      setCompraId(idCompra)
      setReservationNumber(firstReserva.numero_reserva)

      // Si el método de pago es Mercado Pago, solo crear la compra y mostrar el botón
      if (paymentMethod === "mercadopago") {
        // No procesar el pago aún, solo guardar el ID de compra
        // El usuario será redirigido a Mercado Pago desde el paso de confirmación
        console.log("Compra creada para Mercado Pago:", idCompra)
      } else {
        // Paso 2: Procesar pago (para otros métodos)
        const pagoData = {
          id_compra: idCompra,
          metodo_pago: paymentMethod === "card" ? "tarjeta" : "pagar_despues",
        }

        // Si es pago con tarjeta, incluir datos de tarjeta
        if (paymentMethod === "card") {
          pagoData.card_data = {
            numero: cardData.numero,
            nombre: cardData.nombre,
            vencimiento: cardData.vencimiento,
            cvv: cardData.cvv,
          }
        }

        const pagoResponse = await pagosAPI.procesarPago(pagoData)

        if (!pagoResponse.success) {
          throw new Error(pagoResponse.message || "Error procesando el pago")
        }
      }

      // Limpiar carrito después de crear la compra
      await clearCart()
    } catch (error) {
      console.error("Error procesando checkout:", error)
      setErrors({
        checkout: error.message || "Error procesando la compra. Por favor intente nuevamente.",
      })
      // Retroceder un paso si hay error
      setActiveStep((prev) => prev - 1)
    } finally {
      setProcessing(false)
    }
  }

  const handlePassengerChange = (field, value) => {
    setPassengerData((prev) => ({ ...prev, [field]: value }))
    // Limpiar error del campo
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const handleCardChange = (field, value) => {
    setCardData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  // Renderizado de cada paso
  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return <StepCartSummary items={items} totalPrice={totalPrice} />

      case 1:
        return (
          <StepPassengerData
            data={passengerData}
            errors={errors}
            onChange={handlePassengerChange}
          />
        )

      case 2:
        return (
          <StepPayment
            paymentMethod={paymentMethod}
            cardData={cardData}
            errors={errors}
            tarjetasPrueba={tarjetasPrueba}
            onMethodChange={setPaymentMethod}
            onCardChange={handleCardChange}
          />
        )

      case 3:
        return (
          <StepConfirmation
            reservationNumber={reservationNumber}
            compraId={compraId}
            paymentMethod={paymentMethod}
          />
        )

      default:
        return null
    }
  }

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      <Header />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>
          Finalizar Reserva
        </Typography>

        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Contenido del paso actual */}
        <Paper sx={{ p: 4, mb: 3 }}>
          {errors.checkout && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {errors.checkout}
            </Alert>
          )}
          {renderStepContent(activeStep)}
        </Paper>

        {/* Botones de navegación */}
        {activeStep < steps.length - 1 && (
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              startIcon={<ArrowBack />}
            >
              Atrás
            </Button>
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={processing}
              endIcon={activeStep === 2 ? <CheckCircle /> : <ArrowForward />}
            >
              {processing ? "Procesando..." : activeStep === 2 ? "Confirmar Pago" : "Continuar"}
            </Button>
          </Box>
        )}

        {activeStep === steps.length - 1 && (
          <Box sx={{ textAlign: "center" }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate("/mis-reservas")}
            >
              Ver Mis Reservas
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  )
}

// Componentes de cada paso
function StepCartSummary({ items, totalPrice }) {
  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Resumen de tu compra
      </Typography>
      <Grid container spacing={3}>
        {items.map((item) => {
          const fechaViaje = item.fechaViaje || item.fecha_viaje
          const viaje = fechaViaje?.viaje || item.viaje
          const subtotal = item.precio_unitario * item.cantidad

          return (
            <Grid item xs={12} key={item.id}>
              <Card
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  boxShadow: 2,
                  '&:hover': { boxShadow: 4 },
                  transition: 'box-shadow 0.3s ease'
                }}
              >
                {/* Imagen del viaje */}
                {viaje?.imagen_principal_url && (
                  <CardMedia
                    component="img"
                    sx={{
                      width: { xs: '100%', sm: 200 },
                      height: { xs: 200, sm: 'auto' },
                      objectFit: 'cover'
                    }}
                    image={viaje.imagen_principal_url}
                    alt={viaje.titulo}
                  />
                )}

                {/* Contenido de la tarjeta */}
                <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <CardContent sx={{ flex: '1 0 auto' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" component="div" sx={{ fontWeight: 600, mb: 1 }}>
                          {viaje?.titulo || "Viaje"}
                        </Typography>

                        {/* Información del viaje */}
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                          {viaje?.dificultad && (
                            <Chip
                              label={viaje.dificultad.charAt(0).toUpperCase() + viaje.dificultad.slice(1)}
                              size="small"
                              color={
                                viaje.dificultad === 'facil' ? 'success' :
                                viaje.dificultad === 'moderado' ? 'warning' :
                                viaje.dificultad === 'dificil' ? 'error' : 'default'
                              }
                            />
                          )}
                          {viaje?.duracion_dias && (
                            <Chip
                              label={`${viaje.duracion_dias} días`}
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Box>

                        {/* Detalles de la reserva */}
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          <strong>Fecha de inicio:</strong> {new Date(fechaViaje?.fecha_inicio).toLocaleDateString('es-AR', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </Typography>

                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          <strong>Cantidad de personas:</strong> {item.cantidad}
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                          <strong>Precio por persona:</strong> ${item.precio_unitario.toLocaleString('es-AR')}
                        </Typography>
                      </Box>

                      {/* Precio total del item */}
                      <Box sx={{ textAlign: 'right', ml: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          Subtotal
                        </Typography>
                        <Typography variant="h5" color="primary" sx={{ fontWeight: 700 }}>
                          ${subtotal.toLocaleString('es-AR')}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Descripción corta si existe */}
                    {viaje?.descripcion_corta && (
                      <Typography variant="body2" color="text.secondary" sx={{
                        mt: 1,
                        fontStyle: 'italic',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}>
                        {viaje.descripcion_corta}
                      </Typography>
                    )}
                  </CardContent>
                </Box>
              </Card>
            </Grid>
          )
        })}
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* Total */}
      <Box sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        bgcolor: 'action.hover',
        p: 2,
        borderRadius: 1
      }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Total
        </Typography>
        <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>
          ${totalPrice.toLocaleString('es-AR')}
        </Typography>
      </Box>
    </Box>
  )
}

function StepPassengerData({ data, errors, onChange }) {
  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Datos del Pasajero Principal
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Nombre"
            value={data.nombre}
            onChange={(e) => onChange("nombre", e.target.value)}
            error={Boolean(errors.nombre)}
            helperText={errors.nombre}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Apellido"
            value={data.apellido}
            onChange={(e) => onChange("apellido", e.target.value)}
            error={Boolean(errors.apellido)}
            helperText={errors.apellido}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={data.email}
            onChange={(e) => onChange("email", e.target.value)}
            error={Boolean(errors.email)}
            helperText={errors.email}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Teléfono"
            value={data.telefono}
            onChange={(e) => onChange("telefono", e.target.value)}
            error={Boolean(errors.telefono)}
            helperText={errors.telefono}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="DNI"
            value={data.dni}
            onChange={(e) => onChange("dni", e.target.value)}
            error={Boolean(errors.dni)}
            helperText={errors.dni}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Dirección (opcional)"
            value={data.direccion}
            onChange={(e) => onChange("direccion", e.target.value)}
          />
        </Grid>
      </Grid>
    </Box>
  )
}

function StepPayment({ paymentMethod, cardData, errors, tarjetasPrueba, onMethodChange, onCardChange }) {
  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Método de Pago
      </Typography>

      <FormControl component="fieldset" sx={{ mb: 3 }}>
        <RadioGroup value={paymentMethod} onChange={(e) => onMethodChange(e.target.value)}>
          <FormControlLabel
            value="mercadopago"
            control={<Radio />}
            label="Mercado Pago (Todos los medios de pago)"
          />
          <FormControlLabel
            value="card"
            control={<Radio />}
            label="Tarjeta de crédito/débito (Simulación)"
          />
          <FormControlLabel
            value="pay_later"
            control={<Radio />}
            label="Pagar más tarde (reservar con seña del 30%)"
          />
        </RadioGroup>
      </FormControl>

      {paymentMethod === "mercadopago" && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Serás redirigido a Mercado Pago
          </Typography>
          <Typography variant="body2">
            Podrás pagar con tarjeta de crédito, débito, efectivo, transferencia bancaria y más.
            Acepta cuotas sin interés y todos los medios de pago disponibles en Argentina.
          </Typography>
        </Alert>
      )}

      {paymentMethod === "card" && (
        <>
          {/* Mostrar tarjetas de prueba */}
          {tarjetasPrueba.length > 0 && (
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                🧪 Tarjetas de Prueba Disponibles:
              </Typography>
              <Box component="ul" sx={{ margin: 0, paddingLeft: 2 }}>
                {tarjetasPrueba.map((tarjeta) => (
                  <li key={tarjeta.numero}>
                    <Typography variant="body2">
                      <strong>{tarjeta.numero}</strong> - {tarjeta.descripcion}
                    </Typography>
                  </li>
                ))}
              </Box>
              <Typography variant="caption" sx={{ display: "block", mt: 1 }}>
                Vencimiento: Cualquier fecha futura (ej: 12/25) • CVV: Cualquier 3 dígitos (ej: 123)
              </Typography>
            </Alert>
          )}

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Número de tarjeta"
                placeholder="1234 5678 9012 3456"
                value={cardData.numero}
                onChange={(e) => onCardChange("numero", e.target.value.replace(/\s/g, ""))}
                error={Boolean(errors.numero)}
                helperText={errors.numero || "Use una de las tarjetas de prueba de arriba"}
                inputProps={{ maxLength: 16 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nombre en la tarjeta"
                value={cardData.nombre}
                onChange={(e) => onCardChange("nombre", e.target.value)}
                error={Boolean(errors.nombre)}
                helperText={errors.nombre}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Vencimiento (MM/AA)"
                placeholder="12/25"
                value={cardData.vencimiento}
                onChange={(e) => onCardChange("vencimiento", e.target.value)}
                error={Boolean(errors.vencimiento)}
                helperText={errors.vencimiento}
                inputProps={{ maxLength: 5 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="CVV"
                value={cardData.cvv}
                onChange={(e) => onCardChange("cvv", e.target.value)}
                error={Boolean(errors.cvv)}
                helperText={errors.cvv}
                inputProps={{ maxLength: 4 }}
              />
            </Grid>
          </Grid>
        </>
      )}

      {paymentMethod === "pay_later" && (
        <Alert severity="info" sx={{ mt: 2 }}>
          Se enviará un email con las instrucciones para completar el pago. La reserva quedará
          confirmada al abonar la seña del 30%.
        </Alert>
      )}

      <Alert severity="success" sx={{ mt: 3 }}>
        ✓ Transacción segura • Protección de datos
      </Alert>
    </Box>
  )
}

function StepConfirmation({ reservationNumber, compraId, paymentMethod }) {
  const navigate = useNavigate()

  // Si el método de pago es Mercado Pago, mostrar botón de pago
  if (paymentMethod === "mercadopago") {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <CheckCircle sx={{ fontSize: 80, color: "success.main", mb: 2 }} />
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
          ¡Reserva Creada!
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Tu reserva ha sido creada exitosamente. Ahora completa el pago.
        </Typography>
        {reservationNumber && (
          <Paper sx={{ p: 2, bgcolor: "action.hover", display: "inline-block", mb: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Número de reserva
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {reservationNumber}
            </Typography>
          </Paper>
        )}

        <Alert severity="info" sx={{ mb: 3, textAlign: "left" }}>
          <Typography variant="body2">
            <strong>Importante:</strong> Tu reserva quedará confirmada una vez que completes el pago en Mercado Pago.
          </Typography>
        </Alert>

        <Box sx={{ maxWidth: 400, mx: "auto", mb: 3 }}>
          <MercadoPagoButton
            compraId={compraId}
            onError={(error) => {
              console.error("Error en Mercado Pago:", error)
            }}
          />
        </Box>

        <Button
          variant="text"
          onClick={() => navigate("/mis-reservas")}
          sx={{ mt: 2 }}
        >
          Ver Mis Reservas
        </Button>
      </Box>
    )
  }

  // Para otros métodos de pago, mostrar confirmación normal
  return (
    <Box sx={{ textAlign: "center", py: 4 }}>
      <CheckCircle sx={{ fontSize: 80, color: "success.main", mb: 2 }} />
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
        ¡Reserva Confirmada!
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Tu reserva ha sido procesada exitosamente
      </Typography>
      {reservationNumber && (
        <Paper sx={{ p: 2, bgcolor: "action.hover", display: "inline-block", mb: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Número de reserva
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {reservationNumber}
          </Typography>
        </Paper>
      )}
      <Typography variant="body2" color="text.secondary">
        Recibirás un email con los detalles de tu reserva y próximos pasos.
      </Typography>
    </Box>
  )
}
