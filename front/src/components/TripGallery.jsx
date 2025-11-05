import { useState, useEffect } from "react"
import { Box, IconButton, Stack } from "@mui/material"
import { NavigateBefore, NavigateNext, ZoomIn } from "@mui/icons-material"

// Placeholder inline (data URI SVG) para evitar requests HTTP
const PLACEHOLDER_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"%3E%3Crect fill="%23e0e0e0" width="800" height="600"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="32" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3ESin Im%C3%A1genes%3C/text%3E%3C/svg%3E'

/**
 * TripGallery - Galería de imágenes del viaje (Mejorada)
 * Muestra una imagen principal grande con navegación por flechas y thumbnails
 * @param {Array} images - Array de URLs de imágenes
 */
export const TripGallery = ({ images = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [imageError, setImageError] = useState(false)

  // Resetear cuando cambien las imágenes
  useEffect(() => {
    setCurrentIndex(0)
    setImageError(false)
  }, [images])

  // Navegación por teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (images.length <= 1) return

      if (e.key === "ArrowLeft") {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
        setImageError(false)
      } else if (e.key === "ArrowRight") {
        setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
        setImageError(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [images.length])

  const handlePrevious = () => {
    if (images.length <= 1) return
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
    setImageError(false)
  }

  const handleNext = () => {
    if (images.length <= 1) return
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
    setImageError(false)
  }

  const handleThumbnailClick = (index) => {
    setCurrentIndex(index)
    setImageError(false)
  }

  // Si no hay imágenes, mostrar placeholder
  if (!images || images.length === 0) {
    return (
      <Box
        sx={{
          width: "100%",
          height: { xs: 300, sm: 400, md: 500 },
          bgcolor: (theme) => theme.palette.mode === "dark" ? "grey.900" : "grey.200",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <img
          src={PLACEHOLDER_IMAGE}
          alt="Sin imágenes disponibles"
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: "contain",
          }}
        />
      </Box>
    )
  }

  const currentImage = images[currentIndex] || PLACEHOLDER_IMAGE

  return (
    <Box sx={{ width: "100%", maxWidth: "100%", overflow: "hidden", position: "relative" }}>
      {/* Imagen Principal */}
      <Box
        sx={{
          width: "100%",
          height: { xs: 300, sm: 400, md: 500 },
          bgcolor: (theme) => theme.palette.mode === "dark" ? "grey.900" : "grey.100",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img
          src={currentImage}
          alt={`Imagen ${currentIndex + 1} de ${images.length}`}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: imageError ? "none" : "block",
          }}
          onError={(e) => {
            e.target.src = PLACEHOLDER_IMAGE
            setImageError(true)
          }}
        />

        {/* Botón Anterior */}
        {images.length > 1 && (
          <IconButton
            onClick={handlePrevious}
            aria-label="Imagen anterior"
            sx={{
              position: "absolute",
              left: 16,
              top: "50%",
              transform: "translateY(-50%)",
              bgcolor: (theme) => theme.palette.mode === "dark" ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.9)",
              color: (theme) => theme.palette.mode === "dark" ? "white" : "black",
              "&:hover": {
                bgcolor: (theme) => theme.palette.mode === "dark" ? "rgba(0,0,0,0.9)" : "white",
                transform: "translateY(-50%) scale(1.1)",
              },
              transition: "all 0.2s ease",
              zIndex: 2,
            }}
          >
            <NavigateBefore fontSize="large" />
          </IconButton>
        )}

        {/* Botón Siguiente */}
        {images.length > 1 && (
          <IconButton
            onClick={handleNext}
            aria-label="Imagen siguiente"
            sx={{
              position: "absolute",
              right: 16,
              top: "50%",
              transform: "translateY(-50%)",
              bgcolor: (theme) => theme.palette.mode === "dark" ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.9)",
              color: (theme) => theme.palette.mode === "dark" ? "white" : "black",
              "&:hover": {
                bgcolor: (theme) => theme.palette.mode === "dark" ? "rgba(0,0,0,0.9)" : "white",
                transform: "translateY(-50%) scale(1.1)",
              },
              transition: "all 0.2s ease",
              zIndex: 2,
            }}
          >
            <NavigateNext fontSize="large" />
          </IconButton>
        )}

        {/* Indicador de posición */}
        {images.length > 1 && (
          <Box
            sx={{
              position: "absolute",
              bottom: 16,
              left: "50%",
              transform: "translateX(-50%)",
              bgcolor: (theme) => theme.palette.mode === "dark" ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.9)",
              px: 2,
              py: 0.5,
              borderRadius: 2,
              color: (theme) => theme.palette.text.primary,
              fontWeight: 600,
              fontSize: "0.875rem",
              zIndex: 2,
            }}
          >
            {currentIndex + 1} / {images.length}
          </Box>
        )}
      </Box>

      {/* Thumbnails (solo si hay más de 1 imagen) */}
      {images.length > 1 && (
        <Stack
          direction="row"
          spacing={1}
          sx={{
            mt: 2,
            width: "100%",
            maxWidth: "100%",
            overflowX: "auto",
            overflowY: "hidden",
            pb: 1,
            "&::-webkit-scrollbar": {
              height: 8,
            },
            "&::-webkit-scrollbar-track": {
              bgcolor: (theme) => theme.palette.mode === "dark" ? "grey.900" : "grey.200",
              borderRadius: 4,
            },
            "&::-webkit-scrollbar-thumb": {
              bgcolor: (theme) => theme.palette.mode === "dark" ? "grey.700" : "grey.400",
              borderRadius: 4,
              "&:hover": {
                bgcolor: (theme) => theme.palette.mode === "dark" ? "grey.600" : "grey.500",
              },
            },
          }}
        >
          {images.map((image, index) => (
            <Box
              key={index}
              onClick={() => handleThumbnailClick(index)}
              sx={{
                minWidth: 80,
                height: 60,
                borderRadius: 1,
                overflow: "hidden",
                cursor: "pointer",
                border: (theme) =>
                  currentIndex === index
                    ? `3px solid ${theme.palette.primary.main}`
                    : `1px solid ${theme.palette.mode === "dark" ? theme.palette.grey[700] : theme.palette.grey[300]}`,
                opacity: currentIndex === index ? 1 : 0.6,
                transition: "all 0.2s ease",
                "&:hover": {
                  opacity: 1,
                  transform: "scale(1.05)",
                },
              }}
            >
              <img
                src={image}
                alt={`Miniatura ${index + 1}`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
                onError={(e) => {
                  e.target.src = PLACEHOLDER_IMAGE
                }}
              />
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  )
}
