import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  Container,
  Box,
  Typography,
  Button,
  Chip,
  Stack,
  Paper,
  Grid,
  IconButton,
  Alert,
  CircularProgress,
  Breadcrumbs,
  Link,
  Tabs,
  Tab,
  Divider,
} from "@mui/material"
import {
  AccessTime,
  TrendingUp,
  Place,
  CalendarToday,
  ShoppingCart,
  Share,
  Favorite,
  FavoriteBorder,
  ArrowBack,
  Add,
  Remove,
  People,
  CheckCircle,
  Info,
  CheckBox,
  Cancel,
  Map,
  Lightbulb,
  WhatsApp,
} from "@mui/icons-material"
import Header from "../components/Header"
import Footer from "../components/Footer"
import HeroImage from "../components/HeroImage"
import ImageLightbox from "../components/ImageLightbox"
import SimilarTripsCarousel from "../components/SimilarTripsCarousel"
import ImmersiveCarousel from "../components/ImmersiveCarousel"
import TestimonialSection from "../components/TestimonialSection"
import FloatingWhatsAppButton from "../components/FloatingWhatsAppButton"
import FomoBadge from "../components/FomoBadge"
import TotalRow from "../components/TotalRow"
import TrustBadges from "../components/TrustBadges"
import PriceBreakdown from "../components/PriceBreakdown"
import AddedToCartDrawer from "../components/AddedToCartDrawer"
import { useTrip } from "../hooks/useTrip"
import { useCart } from "../context/CartContext"
import { useAuth } from "../context/AuthContext"
import { track } from "../services/analytics"

/**
 * TripDetailPage - Página de detalle de un viaje (Estilo Aventura)
 */
export default function TripDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { trip, loading, error } = useTrip(id)
  const { addItem } = useCart()
  const { user } = useAuth()

  const [selectedFecha, setSelectedFecha] = useState(null)
  const [cantidad, setCantidad] = useState(1)
  const [addingToCart, setAddingToCart] = useState(false)
  const [activeTab, setActiveTab] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [addedToCartDrawerOpen, setAddedToCartDrawerOpen] = useState(false)
  const [addedProductData, setAddedProductData] = useState(null)

  useEffect(() => {
    if (trip) {
      document.title = `${trip.titulo} - TrekkingAR`
      // Seleccionar automáticamente la primera fecha disponible - NORMALIZADO COMO NUMBER
      if (trip.fechas_disponibles?.length > 0) {
        setSelectedFecha(Number(trip.fechas_disponibles[0].id))
      }
    }
  }, [trip])

  // Resetear cantidad cuando cambia la fecha seleccionada
  useEffect(() => {
    setCantidad(1)
  }, [selectedFecha])

  const handleAddToCart = async () => {
    if (!selectedFecha) return

    if (!user) {
      // Redirigir a login con retorno a esta página
      navigate("/login", { state: { from: `/viajes/${id}` } })
      return
    }

    setAddingToCart(true)
    try {
      const result = await addItem({
        id_viaje: parseInt(id),
        id_fecha_viaje: parseInt(selectedFecha),
        cantidad,
      })

      if (result.success) {
        console.log("Agregado al carrito exitosamente")

        // Obtener la imagen principal del viaje
        const tripImage = trip.imagenes?.[0]
          ? (typeof trip.imagenes[0] === 'string' ? trip.imagenes[0] : trip.imagenes[0].url)
          : trip.imagen_principal_url

        // Preparar datos para el drawer de confirmación
        setAddedProductData({
          title: trip.titulo,
          quantity: cantidad,
          image: tripImage,
        })

        // Abrir drawer de confirmación
        setAddedToCartDrawerOpen(true)
      }
    } catch (err) {
      console.error("Error al agregar al carrito:", err)
    } finally {
      setAddingToCart(false)
    }
  }

  if (loading) {
    return (
      <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
        <Header />
        <Container sx={{ py: 4, display: "flex", justifyContent: "center" }}>
          <CircularProgress />
        </Container>
      </Box>
    )
  }

  if (error || !trip) {
    return (
      <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
        <Header />
        <Container sx={{ py: 4 }}>
          <Alert severity="error">
            {error || "No se pudo cargar el viaje. Intenta de nuevo más tarde."}
          </Alert>
          <Button startIcon={<ArrowBack />} onClick={() => navigate("/catalogo")} sx={{ mt: 2 }}>
            Volver al catálogo
          </Button>
        </Container>
      </Box>
    )
  }

  // Normalizar comparación: selectedFecha ya es Number, comparar con Number(f.id)
  const selectedFechaData = trip.fechas_disponibles?.find(
    (f) => Number(f.id) === selectedFecha,
  )
  const precioFinal = selectedFechaData?.precio || trip.precio_base
  const cuposDisponibles = selectedFechaData?.cupos_disponibles || 0
  const maxPersonas = Math.min(cuposDisponibles, 20) // Límite de 20 personas o cupos disponibles

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      <Header />

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link underline="hover" color="inherit" onClick={() => navigate("/")} sx={{ cursor: "pointer" }}>
            Inicio
          </Link>
          <Link underline="hover" color="inherit" onClick={() => navigate("/catalogo")} sx={{ cursor: "pointer" }}>
            Catálogo
          </Link>
          <Typography color="text.primary">{trip.titulo}</Typography>
        </Breadcrumbs>

        {/* HERO IMAGE */}
        <Box sx={{ mb: 4 }}>
          <HeroImage
            images={
              trip.imagenes?.map(img =>
                typeof img === 'string'
                  ? { url: img, focus_point: 'center' }
                  : { url: img.url, focus_point: img.focus_point || 'center' }
              ).filter(img => img.url) ||
              (trip.imagen_principal_url ? [{ url: trip.imagen_principal_url, focus_point: 'center' }] : [])
            }
            title={trip.titulo}
            duracion={trip.duracion_dias}
            dificultad={trip.dificultad}
            ubicacion={typeof trip.destino === 'string' ? trip.destino : trip.destino?.nombre}
            onOpenGallery={() => setLightboxOpen(true)}
          />
        </Box>

        {/* LAYOUT CONDICIONAL: 1 o 2 columnas según contenido */}
        <Grid container spacing={4} alignItems="flex-start">
          {/* COLUMNA IZQUIERDA: Info básica (40%) */}
          <Grid item xs={12} md={5}>
            {/* Info básica del viaje */}
            <Box sx={{ mb: 3 }}>
              <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ mb: 2 }}>
                <Chip
                  icon={<AccessTime />}
                  label={`${trip.duracion_dias} días`}
                  sx={{ fontWeight: 600, fontSize: '0.95rem' }}
                />
                <Chip
                  icon={<TrendingUp />}
                  label={trip.dificultad}
                  color={
                    trip.dificultad === "facil"
                      ? "success"
                      : trip.dificultad === "moderada"
                        ? "warning"
                        : "error"
                  }
                  sx={{ fontWeight: 600, fontSize: '0.95rem' }}
                />
                {trip.categoria && (
                  <Chip
                    label={trip.categoria.nombre || trip.categoria}
                    variant="outlined"
                    sx={{ fontWeight: 600, fontSize: '0.95rem' }}
                  />
                )}
              </Stack>

              {/* Descripción corta */}
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                {trip.descripcion_corta || trip.descripcion_completa?.substring(0, 200) + '...' || ""}
              </Typography>
            </Box>

            {/* Badges de confianza */}
            <Paper elevation={1} sx={{ p: 2, bgcolor: 'background.paper' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
                ¿Por qué elegirnos?
              </Typography>
              <Stack spacing={1.5}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <CheckCircle fontSize="small" sx={{ color: 'primary.main' }} />
                  <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500 }}>
                    Guías certificados
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <CheckCircle fontSize="small" sx={{ color: 'primary.main' }} />
                  <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500 }}>
                    Seguro de viaje incluido
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <CheckCircle fontSize="small" sx={{ color: 'primary.main' }} />
                  <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500 }}>
                    Cancelación flexible
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <CheckCircle fontSize="small" sx={{ color: 'primary.main' }} />
                  <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500 }}>
                    Grupos reducidos
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <CheckCircle fontSize="small" sx={{ color: 'primary.main' }} />
                  <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500 }}>
                    Equipamiento incluido
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <CheckCircle fontSize="small" sx={{ color: 'primary.main' }} />
                  <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500 }}>
                    Fotografías del viaje
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <CheckCircle fontSize="small" sx={{ color: 'primary.main' }} />
                  <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500 }}>
                    Pago seguro garantizado
                  </Typography>
                </Stack>
              </Stack>
            </Paper>
          </Grid>

          {/* COLUMNA DERECHA: Card de reserva sticky (60%) */}
          <Grid item xs={12} md={7}>
            {/* CARD DE RESERVA STICKY */}
            <Paper
              elevation={4}
              sx={{
                p: 3,
                bgcolor: (theme) => theme.palette.mode === 'dark'
                  ? 'rgba(48, 130, 86, 0.95)' // Verde más oscuro para modo oscuro
                  : "primary.main",
                borderRadius: 2,
                // Sticky en desktop
                position: { xs: 'static', md: 'sticky' },
                top: { md: 96 },
                alignSelf: 'flex-start',
              }}
            >
              {/* FOMO Badge - Urgencia mejorado */}
              {selectedFechaData && (
                <Box sx={{ mb: 2 }}>
                  <FomoBadge
                    remaining={cuposDisponibles}
                    capacity={selectedFechaData.cupos_totales || selectedFechaData.cupos_disponibles}
                    reservasMes={selectedFechaData.cupos_ocupados || 0}
                    mes={new Date(selectedFechaData.fecha_inicio).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
                    tripId={id}
                    onClickAction={() => {
                      // Scroll al selector de fechas
                      const fechaSelector = document.querySelector('[aria-label="Seleccionar fecha de salida"]');
                      if (fechaSelector) {
                        fechaSelector.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }
                    }}
                  />
                </Box>
              )}

              {/* Precio grande */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h3" sx={{
                  fontWeight: 800,
                  mb: 0.5,
                  color: (theme) => theme.palette.mode === 'dark' ? '#fff' : '#ffffffff'
                }}>
                  ${precioFinal?.toLocaleString()}
                </Typography>
                <Typography variant="body2" sx={{
                  color: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.9)' : '#000',
                  fontWeight: 500
                }}>
                  Por persona
                </Typography>
              </Box>

              {/* Selector de fecha */}
              {trip.fechas_disponibles && trip.fechas_disponibles.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{
                    mb: 1,
                    fontWeight: 600,
                    color: (theme) => theme.palette.mode === 'dark' ? '#fff' : '#000'
                  }}>
                    Fecha de salida
                  </Typography>
                  <Stack spacing={1} aria-label="Seleccionar fecha de salida">
                    {trip.fechas_disponibles.map((fecha, index) => {
                      const fechaIdNumber = Number(fecha.id)
                      const isSelected = selectedFecha === fechaIdNumber

                      return (
                        <Button
                          key={fecha.id || `fecha-${index}`}
                          variant={isSelected ? "contained" : "outlined"}
                          onClick={() => setSelectedFecha(fechaIdNumber)}
                          data-testid={`fecha-${fecha.id ?? index}`}
                          aria-label={`Seleccionar fecha del ${new Date(fecha.fecha_inicio).toLocaleDateString()} al ${new Date(fecha.fecha_fin).toLocaleDateString()}`}
                          sx={{
                            justifyContent: "flex-start",
                            textAlign: "left",
                            bgcolor: (theme) => isSelected
                              ? (theme.palette.mode === 'dark' ? '#fff' : 'white')
                              : 'transparent',
                            borderColor: (theme) => isSelected
                              ? (theme.palette.mode === 'dark' ? '#fff' : 'white')
                              : (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.5)'),
                            borderWidth: isSelected ? 2 : 1,
                            "&:hover": {
                              bgcolor: (theme) => isSelected
                                ? (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.95)')
                                : (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(30, 122, 95, 0.08)'),
                              borderColor: (theme) => isSelected
                                ? (theme.palette.mode === 'dark' ? '#fff' : 'white')
                                : (theme.palette.mode === 'dark' ? '#fff' : 'rgba(255,255,255,0.8)'),
                            }
                          }}
                        >
                          <Box sx={{ flex: 1 }}>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <CalendarToday fontSize="small" sx={{
                                color: (theme) => isSelected
                                  ? '#000'
                                  : (theme.palette.mode === 'dark' ? '#fff' : '#fff')
                              }} />
                              <Typography
                                variant="body1"
                                sx={{
                                  color: (theme) => isSelected
                                    ? '#000'
                                    : (theme.palette.mode === 'dark' ? '#fff' : '#fff'),
                                  fontWeight: 600,
                                  fontSize: '1rem'
                                }}
                              >
                                {new Date(fecha.fecha_inicio).toLocaleDateString()} - {new Date(fecha.fecha_fin).toLocaleDateString()}
                              </Typography>
                            </Stack>
                            {fecha.cupos_disponibles !== undefined && (
                              <Typography
                                variant="body2"
                                sx={{
                                  color: (theme) => isSelected
                                    ? 'rgba(0,0,0,0.7)'
                                    : (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.7)'),
                                  display: "block",
                                  ml: 3.5,
                                  fontSize: '0.9rem'
                                }}
                              >
                                {fecha.cupos_disponibles} cupos disponibles
                              </Typography>
                            )}
                          </Box>
                        </Button>
                      )
                    })}
                  </Stack>
                </Box>
              )}

              {/* Selector de cantidad */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{
                  mb: 1,
                  fontWeight: 600,
                  color: (theme) => theme.palette.mode === 'dark' ? '#fff' : '#000'
                }}>
                  Cantidad de personas
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                  <IconButton
                    onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                    sx={{
                      bgcolor: "white",
                      color: "primary.main",
                      "&:hover": { bgcolor: "grey.200" }
                    }}
                  >
                    <Remove />
                  </IconButton>
                  <Typography variant="h5" sx={{
                    fontWeight: 700,
                    minWidth: 40,
                    textAlign: "center",
                    color: (theme) => theme.palette.mode === 'dark' ? '#fff' : '#000'
                  }}>
                    {cantidad}
                  </Typography>
                  <IconButton
                    onClick={() => setCantidad(Math.min(maxPersonas, cantidad + 1))}
                    disabled={cantidad >= maxPersonas}
                    sx={{
                      bgcolor: "white",
                      color: "primary.main",
                      "&:hover": { bgcolor: "grey.200" },
                      "&:disabled": { bgcolor: "grey.300", color: "grey.500" }
                    }}
                  >
                    <Add />
                  </IconButton>
                </Stack>
              </Box>

              {/* Alerta de cupos limitados */}
              {cuposDisponibles > 0 && cuposDisponibles <= 5 && (
                <Alert severity="warning" sx={{ mb: 2, bgcolor: "rgba(255, 152, 0, 0.2)" }}>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    ¡Solo quedan {cuposDisponibles} {cuposDisponibles === 1 ? "cupo" : "cupos"}!
                  </Typography>
                </Alert>
              )}

              {cuposDisponibles === 0 && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    No hay cupos disponibles para esta fecha
                  </Typography>
                </Alert>
              )}

              {/* Precio desglosado */}
              <PriceBreakdown pricePerPerson={precioFinal} quantity={cantidad} />

              {/* Total con count-up */}
              <TotalRow total={precioFinal * cantidad} />

              {/* Botón de reserva - Pill style con gradiente lime */}
              <Button
                variant="contained"
                size="large"
                fullWidth
                startIcon={<ShoppingCart />}
                onClick={() => {
                  track('reserve_click', {
                    tripId: id,
                    price: precioFinal * cantidad,
                    quantity: cantidad,
                  });
                  handleAddToCart();
                }}
                disabled={!selectedFecha || addingToCart || cuposDisponibles === 0}
                aria-disabled={!selectedFecha || addingToCart}
                aria-label="Reservar este viaje"
                data-testid="btn-reservar"
                title={
                  !selectedFecha
                    ? "Selecciona una fecha primero"
                    : !user
                      ? "Haz clic para iniciar sesión"
                      : addingToCart
                        ? "Procesando reserva..."
                        : "Reservar este viaje"
                }
                sx={{
                  background: (theme) => theme.palette.mode === 'dark'
                    ? 'linear-gradient(135deg, #C7F464 0%, #AEEB56 100%)'
                    : 'linear-gradient(135deg, #C7F464 0%, #AEEB56 100%)',
                  color: '#07220d',
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  py: 1.8,
                  borderRadius: '999px', // Pill shape
                  boxShadow: '0 4px 14px rgba(199, 244, 100, 0.4)',
                  transition: 'all 0.3s ease',
                  "&:hover": {
                    background: (theme) => theme.palette.mode === 'dark'
                      ? 'linear-gradient(135deg, #D4F685 0%, #C7F464 100%)'
                      : 'linear-gradient(135deg, #D4F685 0%, #C7F464 100%)',
                    boxShadow: '0 6px 20px rgba(199, 244, 100, 0.5)',
                    transform: 'scale(1.02)',
                  },
                  "&:disabled": {
                    background: (theme) => theme.palette.mode === "dark" ? "grey.700" : "grey.400",
                    color: (theme) => theme.palette.mode === "dark" ? "grey.500" : "grey.600",
                    cursor: "not-allowed",
                    opacity: 0.6,
                    boxShadow: 'none',
                  }
                }}
              >
                {addingToCart ? "PROCESANDO..." : "RESERVAR"}
              </Button>

              {/* Botón de consulta - Solo visible en desktop */}
              <Button
                variant="outlined"
                size="large"
                fullWidth
                startIcon={<WhatsApp />}
                onClick={() => {
                  track('whatsapp_click', { tripId: id });
                  const queryParams = new URLSearchParams({
                    tripId: id,
                    tripName: trip.titulo
                  });
                  navigate(`/contacto?${queryParams.toString()}`);
                }}
                aria-label="Consultar por WhatsApp sobre este viaje"
                data-testid="btn-consultar"
                sx={{
                  mt: 2,
                  display: { xs: 'none', md: 'flex' }, // Ocultar en mobile
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  py: 1.3,
                  borderColor: (theme) => theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.5)'
                    : 'rgba(255, 255, 255, 0.6)',
                  borderWidth: 2,
                  color: (theme) => theme.palette.mode === 'dark' ? '#fff' : '#fff',
                  backgroundColor: 'transparent',
                  transition: 'all 0.2s ease',
                  "&:hover": {
                    borderColor: (theme) => theme.palette.mode === 'dark'
                      ? '#fff'
                      : '#fff',
                    backgroundColor: (theme) => theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.1)'
                      : 'rgba(255, 255, 255, 0.15)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                ¿Tenés dudas? Hablanos
              </Button>

              {/* Trust Badges */}
              <TrustBadges />

              {!user && (
                <Alert severity="info" sx={{ mt: 2, bgcolor: "white", color: "text.primary" }}>
                  <strong>Nota:</strong> Inicia sesión para poder reservar este viaje
                </Alert>
              )}

              {/* Info adicional */}
              <Box sx={{ mt: 3, pt: 3, borderTop: "1px solid rgba(255,255,255,0.3)" }}>
                <Stack spacing={1}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CheckCircle fontSize="small" />
                    <Typography variant="body2" sx={{ color: '#000', fontWeight: 500 }}>
                      Cancelación gratuita hasta 7 días antes
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CheckCircle fontSize="small" />
                    <Typography variant="body2" sx={{ color: '#000', fontWeight: 500 }}>
                      Confirmación inmediata
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CheckCircle fontSize="small" />
                    <Typography variant="body2" sx={{ color: '#000', fontWeight: 500 }}>
                      Pago seguro
                    </Typography>
                  </Stack>
                </Stack>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* SECCIÓN DE TABS (Ancho Completo, Centrados con Iconos) */}
        <Box sx={{ mt: 6 }}>
          <Paper elevation={2}>
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                borderBottom: 1,
                borderColor: "divider",
                '& .MuiTabs-flexContainer': {
                  justifyContent: { xs: 'flex-start', md: 'center' },
                },
                '& .MuiTab-root': {
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  fontWeight: 600,
                  minHeight: 64,
                  textTransform: 'none',
                }
              }}
            >
              <Tab icon={<Info />} iconPosition="start" label="Información General" />
              <Tab icon={<CheckBox />} iconPosition="start" label="Incluye" />
              <Tab icon={<Cancel />} iconPosition="start" label="No Incluye" />
              <Tab icon={<Map />} iconPosition="start" label="Itinerario" />
              <Tab icon={<Lightbulb />} iconPosition="start" label="Recomendaciones" />
            </Tabs>

            <Box sx={{ p: 4 }}>
              {/* Tab 0: Información General */}
              {activeTab === 0 && (
                <Box>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, color: "text.primary" }}>
                    Sobre este viaje
                  </Typography>
                  <Typography variant="body1" paragraph color="text.primary" sx={{ lineHeight: 1.8 }}>
                    {trip.descripcion_completa || trip.descripcion_corta || "No hay descripción disponible"}
                  </Typography>
                </Box>
              )}

              {/* Tab 1: Incluye */}
              {activeTab === 1 && (
                <Box>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, color: "text.primary" }}>
                    ¿Qué incluye?
                  </Typography>
                  {trip.incluye ? (
                    Array.isArray(trip.incluye) ? (
                      <Box component="ul" sx={{ pl: 3, m: 0 }}>
                        {trip.incluye.map((item, index) => (
                          <Typography component="li" key={index} variant="body1" color="text.primary" sx={{ mb: 1, lineHeight: 1.8 }}>
                            {item}
                          </Typography>
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="body1" component="div" color="text.primary" sx={{ whiteSpace: "pre-line", lineHeight: 1.8 }}>
                        {trip.incluye}
                      </Typography>
                    )
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                      No hay información disponible
                    </Typography>
                  )}
                </Box>
              )}

              {/* Tab 2: No Incluye */}
              {activeTab === 2 && (
                <Box>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, color: "text.primary" }}>
                    ¿Qué NO incluye?
                  </Typography>
                  {trip.no_incluye ? (
                    Array.isArray(trip.no_incluye) ? (
                      <Box component="ul" sx={{ pl: 3, m: 0 }}>
                        {trip.no_incluye.map((item, index) => (
                          <Typography component="li" key={index} variant="body1" color="text.primary" sx={{ mb: 1, lineHeight: 1.8 }}>
                            {item}
                          </Typography>
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="body1" component="div" color="text.primary" sx={{ whiteSpace: "pre-line", lineHeight: 1.8 }}>
                        {trip.no_incluye}
                      </Typography>
                    )
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                      No hay información disponible
                    </Typography>
                  )}
                </Box>
              )}

              {/* Tab 3: Itinerario */}
              {activeTab === 3 && (
                <Box>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, color: "text.primary" }}>
                    Itinerario del viaje
                  </Typography>
                  {trip.itinerario_detallado ? (
                    <Typography variant="body1" component="div" color="text.primary" sx={{ whiteSpace: "pre-line", lineHeight: 1.8 }}>
                      {trip.itinerario_detallado}
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                      Itinerario próximamente
                    </Typography>
                  )}
                </Box>
              )}

              {/* Tab 4: Recomendaciones */}
              {activeTab === 4 && (
                <Box>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, color: "text.primary" }}>
                    Recomendaciones
                  </Typography>
                  {trip.recomendaciones ? (
                    Array.isArray(trip.recomendaciones) ? (
                      <Box component="ul" sx={{ pl: 3, m: 0 }}>
                        {trip.recomendaciones.map((item, index) => (
                          <Typography component="li" key={index} variant="body1" color="text.primary" sx={{ mb: 1, lineHeight: 1.8 }}>
                            {item}
                          </Typography>
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="body1" component="div" color="text.primary" sx={{ whiteSpace: "pre-line", lineHeight: 1.8 }}>
                        {trip.recomendaciones}
                      </Typography>
                    )
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                      No hay recomendaciones disponibles
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          </Paper>
        </Box>

        {/* SECCIÓN DE TESTIMONIOS */}
        <TestimonialSection />

        {/* CARRUSEL INMERSIVO CON EFECTO KEN BURNS */}
        <ImmersiveCarousel
          images={
            [...(trip.imagenes?.map(img =>
              typeof img === 'string'
                ? { url: img, focus_point: 'center' }
                : { url: img.url, focus_point: img.focus_point || 'center' }
            ).filter(img => img.url) ||
            (trip.imagen_principal_url ? [{ url: trip.imagen_principal_url, focus_point: 'center' }] : []))].reverse()
          }
          height={500}
        />

        {/* VIAJES SIMILARES */}
        <SimilarTripsCarousel viajeId={id} limit={6} />
      </Container>

      {/* IMAGE LIGHTBOX */}
      <ImageLightbox
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        images={
          trip.imagenes?.map(img => typeof img === 'string' ? img : img.url).filter(Boolean) ||
          (trip.imagen_principal_url ? [trip.imagen_principal_url] : [])
        }
        initialIndex={0}
        title={trip.titulo}
      />

      {/* FLOATING WHATSAPP BUTTON - Solo en mobile */}
      <FloatingWhatsAppButton
        tripId={id}
        tripName={trip.titulo}
        showOnMobile={true}
      />

      {/* DRAWER DE CONFIRMACIÓN DE AGREGADO AL CARRITO */}
      <AddedToCartDrawer
        open={addedToCartDrawerOpen}
        onClose={() => setAddedToCartDrawerOpen(false)}
        productData={addedProductData}
      />

      <Footer />
    </Box>
  )
}
