import { useState, useEffect } from "react"
import {
  Container,
  Box,
  Typography,
  ImageList,
  ImageListItem,
  Modal,
  IconButton,
  CircularProgress,
  Alert,
  useMediaQuery,
  useTheme,
  Fade,
  ToggleButtonGroup,
  ToggleButton,
  Paper,
} from "@mui/material"
import {
  Close as CloseIcon,
  NavigateBefore,
  NavigateNext,
  ZoomIn,
  Photo,
  VideoLibrary,
  Collections,
} from "@mui/icons-material"
import Header from "../components/Header"
import { viajesAPI } from "../services/api"

/**
 * GaleriaPage - Galería de imágenes de todos los viajes
 * Muestra todas las fotos en un diseño masonry con lightbox
 */
export default function GaleriaPage() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const isTablet = useMediaQuery(theme.breakpoints.down("md"))

  const [images, setImages] = useState([])
  const [allTripsImages, setAllTripsImages] = useState([]) // Images organized by trip ID
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedImage, setSelectedImage] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [mediaFilter, setMediaFilter] = useState("todos") // "todos", "fotos", "videos"

  // Helper function to determine if a URL is a video
  const isVideo = (url) => {
    const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.mkv', '.flv']
    return videoExtensions.some(ext => url.toLowerCase().endsWith(ext))
  }

  // Determine number of columns based on screen size
  const cols = isMobile ? 1 : isTablet ? 2 : 4

  // Organize images by trip - show all unique images without repetition
  const organizeImagesByTrip = () => {
    const organized = []
    const sortedTripIds = Object.keys(allTripsImages).sort((a, b) => Number(a) - Number(b))

    // Add all images from all trips, alternating between trips for variety
    sortedTripIds.forEach((tripId) => {
      const tripImages = allTripsImages[tripId] || []

      // Filter by media type
      const filteredTripImages = tripImages.filter((image) => {
        if (mediaFilter === "todos") return true
        if (mediaFilter === "fotos") return !isVideo(image.url)
        if (mediaFilter === "videos") return isVideo(image.url)
        return true
      })

      // Add all images from this trip (no duplicates)
      filteredTripImages.forEach((img) => {
        organized.push({...img})
      })
    })

    return organized
  }

  const filteredImages = allTripsImages && Object.keys(allTripsImages).length > 0
    ? organizeImagesByTrip()
    : []

  useEffect(() => {
    document.title = "Galería - TrekkingAR"
    fetchAllImages()
  }, [])

  const fetchAllImages = async () => {
    try {
      setLoading(true)
      setError(null)

      // Obtener todos los viajes con sus imágenes
      const response = await viajesAPI.getViajes({ limit: 100, activo: true })

      if (response.success) {
        // Sort trips by ID to ensure consistent ordering
        const sortedTrips = [...response.data.viajes].sort((a, b) => a.id_viaje - b.id_viaje)

        // Organize images by trip ID and extract all images
        const allImages = []
        const imagesByTrip = {}

        sortedTrips.forEach((viaje) => {
          const tripImages = []

          // Agregar imagen principal si existe
          if (viaje.imagen_principal_url) {
            const imgData = {
              url: viaje.imagen_principal_url,
              titulo: viaje.titulo,
              destino: viaje.destino,
              id_viaje: viaje.id_viaje,
            }
            tripImages.push(imgData)
            allImages.push(imgData)
          }

          // Agregar imágenes adicionales si existen
          if (viaje.imagenes && Array.isArray(viaje.imagenes)) {
            viaje.imagenes.forEach((imagen) => {
              const imgData = {
                url: typeof imagen === 'string' ? imagen : imagen.url,
                titulo: viaje.titulo,
                destino: viaje.destino,
                id_viaje: viaje.id_viaje,
              }
              tripImages.push(imgData)
              allImages.push(imgData)
            })
          }

          // Store images organized by trip ID
          if (tripImages.length > 0) {
            imagesByTrip[viaje.id_viaje] = tripImages
          }
        })

        setImages(allImages)
        setAllTripsImages(imagesByTrip)
      } else {
        throw new Error(response.message || "Error cargando imágenes")
      }
    } catch (err) {
      console.error("[GaleriaPage] Error:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleImageClick = (image, index) => {
    setSelectedImage(image)
    setCurrentIndex(index)
  }

  const handleClose = () => {
    setSelectedImage(null)
  }

  const handlePrevious = (e) => {
    e.stopPropagation()
    const newIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1
    setCurrentIndex(newIndex)
    setSelectedImage(images[newIndex])
  }

  const handleNext = (e) => {
    e.stopPropagation()
    const newIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0
    setCurrentIndex(newIndex)
    setSelectedImage(images[newIndex])
  }

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      <Header />

      <Container maxWidth="xl" sx={{ py: 4, mt: 8 }}>
        {/* Encabezado */}
        <Box sx={{ mb: 4, textAlign: "center" }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: 2,
              mb: 2,
              background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Galería de Aventuras
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Explora los paisajes más increíbles de nuestros trekkings
          </Typography>
          {filteredImages.length > 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {filteredImages.length} {filteredImages.length === 1 ? "imagen" : "imágenes"}
            </Typography>
          )}
        </Box>

        {/* Filter Buttons */}
        {!loading && images.length > 0 && (
          <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
            <Paper elevation={2} sx={{ p: 0.5, borderRadius: 2 }}>
              <ToggleButtonGroup
                value={mediaFilter}
                exclusive
                onChange={(event, newFilter) => {
                  if (newFilter !== null) {
                    setMediaFilter(newFilter)
                  }
                }}
                aria-label="Media type filter"
                size="small"
                sx={{
                  "& .MuiToggleButton-root": {
                    px: 3,
                    py: 1,
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    textTransform: "none",
                    border: "none",
                    "&.Mui-selected": {
                      bgcolor: "primary.main",
                      color: "white",
                      "&:hover": {
                        bgcolor: "primary.dark",
                      },
                    },
                  },
                }}
              >
                <ToggleButton value="todos" aria-label="Show all media">
                  <Collections sx={{ mr: 1, fontSize: "1.2rem" }} />
                  Todos
                </ToggleButton>
                <ToggleButton value="fotos" aria-label="Show photos only">
                  <Photo sx={{ mr: 1, fontSize: "1.2rem" }} />
                  Fotos
                </ToggleButton>
                <ToggleButton value="videos" aria-label="Show videos only">
                  <VideoLibrary sx={{ mr: 1, fontSize: "1.2rem" }} />
                  Videos
                </ToggleButton>
              </ToggleButtonGroup>
            </Paper>
          </Box>
        )}

        {/* Loading */}
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress size={60} />
          </Box>
        )}

        {/* Error */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Galería Grid */}
        {!loading && !error && filteredImages.length > 0 && (
          <Box sx={{ overflow: "hidden" }}>
            <ImageList
              cols={cols}
              gap={16}
              sx={{
                mb: 0,
                "& .MuiImageListItem-root": {
                  overflow: "hidden",
                  borderRadius: 2,
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  height: "250px !important", // Fixed height for consistent rows
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: theme.shadows[10],
                    "& .overlay": {
                      opacity: 1,
                    },
                  },
                },
              }}
            >
            {filteredImages.map((image, index) => (
              <ImageListItem
                key={`${image.id_viaje}-${index}`}
                onClick={() => handleImageClick(image, index)}
              >
                <img
                  src={image.url}
                  alt={image.titulo}
                  loading="lazy"
                  style={{
                    display: "block",
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
                {/* Overlay con información */}
                <Box
                  className="overlay"
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)",
                    color: "white",
                    p: 2,
                    opacity: 0,
                    transition: "opacity 0.3s ease",
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {image.titulo}
                  </Typography>
                  <Typography variant="caption" data-testid="gallery-item-destino">
                    {typeof image.destino === 'string'
                      ? image.destino
                      : image.destino?.nombre || 'Destino no especificado'}
                  </Typography>
                </Box>
              </ImageListItem>
            ))}
          </ImageList>
          </Box>
        )}

        {/* Sin imágenes */}
        {!loading && !error && filteredImages.length === 0 && (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              No hay imágenes disponibles
            </Typography>
          </Box>
        )}
      </Container>

      {/* Modal Lightbox */}
      <Modal
        open={Boolean(selectedImage)}
        onClose={handleClose}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "rgba(0,0,0,0.95)",
        }}
      >
        <Fade in={Boolean(selectedImage)}>
          <Box
            sx={{
              position: "relative",
              maxWidth: "95vw",
              maxHeight: "95vh",
              outline: "none",
            }}
            onClick={handleClose}
          >
            {/* Botón cerrar */}
            <IconButton
              onClick={handleClose}
              sx={{
                position: "absolute",
                top: 16,
                right: 16,
                bgcolor: "rgba(255,255,255,0.9)",
                color: "rgba(0,0,0,0.87)",
                "&:hover": {
                  bgcolor: "white",
                  transform: "scale(1.1)",
                },
                transition: "all 0.2s ease",
                zIndex: 2,
              }}
            >
              <CloseIcon />
            </IconButton>

            {/* Botón anterior */}
            {images.length > 1 && (
              <IconButton
                onClick={handlePrevious}
                sx={{
                  position: "absolute",
                  left: 16,
                  top: "50%",
                  transform: "translateY(-50%)",
                  bgcolor: "rgba(255,255,255,0.9)",
                  color: "rgba(0,0,0,0.87)",
                  "&:hover": {
                    bgcolor: "white",
                    transform: "translateY(-50%) scale(1.1)",
                  },
                  transition: "all 0.2s ease",
                  zIndex: 2,
                }}
              >
                <NavigateBefore fontSize="large" />
              </IconButton>
            )}

            {/* Botón siguiente */}
            {images.length > 1 && (
              <IconButton
                onClick={handleNext}
                sx={{
                  position: "absolute",
                  right: 16,
                  top: "50%",
                  transform: "translateY(-50%)",
                  bgcolor: "rgba(255,255,255,0.9)",
                  color: "rgba(0,0,0,0.87)",
                  "&:hover": {
                    bgcolor: "white",
                    transform: "translateY(-50%) scale(1.1)",
                  },
                  transition: "all 0.2s ease",
                  zIndex: 2,
                }}
              >
                <NavigateNext fontSize="large" />
              </IconButton>
            )}

            {/* Imagen ampliada */}
            {selectedImage && (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <img
                  src={selectedImage.url}
                  alt={selectedImage.titulo}
                  style={{
                    maxWidth: "95vw",
                    maxHeight: "85vh",
                    objectFit: "contain",
                    borderRadius: 8,
                  }}
                />
                {/* Información de la imagen */}
                <Box
                  sx={{
                    mt: 2,
                    bgcolor: "rgba(255,255,255,0.95)",
                    borderRadius: 2,
                    p: 2,
                    textAlign: "center",
                    maxWidth: "600px",
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5, color: "rgba(0,0,0,0.87)" }}>
                    {selectedImage.titulo}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "rgba(0,0,0,0.6)" }} data-testid="lightbox-destino">
                    {typeof selectedImage.destino === 'string'
                      ? selectedImage.destino
                      : selectedImage.destino?.nombre || 'Destino no especificado'}
                  </Typography>
                  <Typography variant="caption" sx={{ display: "block", mt: 1, color: "rgba(0,0,0,0.6)" }}>
                    Imagen {currentIndex + 1} de {images.length}
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        </Fade>
      </Modal>
    </Box>
  )
}
