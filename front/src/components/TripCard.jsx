import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Chip,
  Box,
  Stack,
  IconButton,
  Skeleton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material"
import {
  AccessTime as DurationIcon,
  TrendingUp as DifficultyIcon,
  Place as LocationIcon,
  CalendarToday as DateIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
} from "@mui/icons-material"
import { getViajeMainImage, handleImageError } from "../utils/imageUrl"

/**
 * TripCard - Tarjeta de viaje para catálogo
 * @param {Object} trip - Objeto del viaje con sus propiedades
 * @param {boolean} loading - Estado de carga
 */
export const TripCard = ({ trip, loading = false }) => {
  const navigate = useNavigate()

  // All useState hooks must be at the top, before any conditional returns
  const [isFavorite, setIsFavorite] = useState(false)

  // Extract trip data before using in useState
  const {
    id_viaje,
    titulo,
    descripcion_corta,
    imagen_principal,
    destino,
    duracion_dias,
    dificultad,
    precio_base,
    precio_mas_bajo,
    fechas_disponibles = [],
    fechas = [],
  } = trip || {}

  // Normalizar fechas: usar fechas_disponibles si existe, sino fechas
  const fechasDisponibles = fechas_disponibles.length > 0 ? fechas_disponibles : fechas

  // Estado para la fecha seleccionada en el dropdown (must be before any returns)
  const [selectedFechaId, setSelectedFechaId] = useState(
    fechasDisponibles[0]?.id_fechas_viaje || fechasDisponibles[0]?.id || null
  )

  if (loading) {
    return (
      <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <Skeleton variant="rectangular" height={200} />
        <CardContent sx={{ flex: 1 }}>
          <Skeleton variant="text" height={32} />
          <Skeleton variant="text" height={20} />
          <Skeleton variant="text" height={20} />
        </CardContent>
      </Card>
    )
  }

  // Obtener la fecha seleccionada
  const fechaSeleccionada = fechasDisponibles.find(
    f => (f.id_fechas_viaje || f.id) === selectedFechaId
  )

  // Mostrar el precio de la fecha seleccionada, o el más bajo, o el base
  const precioFinal = fechaSeleccionada?.precio_fecha || fechaSeleccionada?.precio || precio_mas_bajo || precio_base

  // Mapa de colores para dificultad
  const dificultadColors = {
    facil: "success",     // Verde
    moderado: "warning",  // Naranja
    dificil: "error",     // Rojo
    extremo: "secondary", // Negro/Lila
  }

  const handleCardClick = () => {
    navigate(`/viajes/${id_viaje}`)
  }

  const handleFavoriteToggle = (e) => {
    e.stopPropagation()
    setIsFavorite(!isFavorite)
    // TODO: Integrar con backend para persistir favoritos
  }

  return (
    <Card
      sx={{
        height: "640px", // Altura aumentada para dropdown de fechas
        display: "flex",
        flexDirection: "column",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-8px)",
          boxShadow: 8,
        },
      }}
    >
      {/* Imagen principal */}
      <Box
        sx={{ position: "relative", cursor: "pointer" }}
        onClick={handleCardClick}
      >
        <CardMedia
          component="img"
          height="200"
          image={getViajeMainImage(trip)}
          alt={titulo}
          sx={{ objectFit: "cover" }}
          onError={(e) => {
            handleImageError(e)
            e.stopPropagation() // Prevenir propagación del evento
          }}
        />
        {/* Botón favorito */}
        <IconButton
          onClick={handleFavoriteToggle}
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            bgcolor: (theme) => theme.palette.mode === 'dark'
              ? "rgba(0,0,0,0.7)"
              : "rgba(255,255,255,0.9)",
            "&:hover": {
              bgcolor: (theme) => theme.palette.mode === 'dark'
                ? "rgba(0,0,0,0.85)"
                : "rgba(255,255,255,1)"
            },
          }}
          size="small"
        >
          {isFavorite ? (
            <FavoriteIcon color="error" />
          ) : (
            <FavoriteBorderIcon sx={{
              color: (theme) => theme.palette.mode === 'dark'
                ? theme.palette.primary.main
                : "inherit"
            }} />
          )}
        </IconButton>

        {/* Chip de dificultad */}
        <Chip
          label={dificultad}
          color={dificultadColors[dificultad?.toLowerCase()] || "default"}
          size="small"
          sx={{
            position: "absolute",
            top: 8,
            left: 8,
            textTransform: "capitalize",
            fontWeight: 600,
          }}
        />
      </Box>

      {/* Contenido */}
      <CardContent
        sx={{
          flex: 1,
          p: 2.5,
          pb: 1.5,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          cursor: "pointer",
        }}
        onClick={handleCardClick}
      >
        <Typography
          variant="h5"
          gutterBottom
          sx={{
            fontWeight: 700,
            fontSize: { xs: '1.25rem', md: '1.4rem' },
            minHeight: "64px", // Altura mínima para título
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {titulo}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            minHeight: "40px", // Altura mínima para descripción
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {descripcion_corta || descripcion}
        </Typography>

        {/* Metadata */}
        <Stack spacing={1} sx={{ mt: "auto" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <LocationIcon fontSize="small" color="action" />
            <Typography
              variant="body2"
              color="text.secondary"
              data-testid="tripcard-destino"
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {typeof destino === 'string'
                ? destino
                : destino?.nombre || 'Destino no especificado'}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <DurationIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {duracion_dias} {duracion_dias === 1 ? "día" : "días"}
            </Typography>
          </Box>

          {/* Selector de fecha */}
          {fechasDisponibles.length > 0 ? (
            <Box sx={{ mt: 1 }}>
              <FormControl fullWidth size="small">
                <InputLabel id={`fecha-select-label-${id_viaje}`}>
                  Fecha de salida
                </InputLabel>
                <Select
                  labelId={`fecha-select-label-${id_viaje}`}
                  value={selectedFechaId || ""}
                  label="Fecha de salida"
                  onChange={(e) => setSelectedFechaId(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  sx={{
                    bgcolor: (theme) => theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'background.paper'
                  }}
                >
                  {fechasDisponibles.map((fecha) => {
                    const fechaId = fecha.id_fechas_viaje || fecha.id
                    const cuposDisp = fecha.cupos_disponibles

                    // Determinar color según disponibilidad de cupos
                    const getCuposColor = (cupos) => {
                      if (cupos === undefined || cupos > 5) return 'text.secondary'
                      if (cupos <= 2) return '#D32F2F' // Rojo
                      if (cupos <= 5) return '#FF6B35' // Naranja
                      return 'text.secondary'
                    }

                    const cuposColor = getCuposColor(cuposDisp)
                    const showUrgencia = cuposDisp !== undefined && cuposDisp > 0 && cuposDisp <= 3

                    return (
                      <MenuItem key={fechaId} value={fechaId}>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {new Date(fecha.fecha_inicio).toLocaleDateString()} - {new Date(fecha.fecha_fin).toLocaleDateString()}
                          </Typography>
                          {cuposDisp !== undefined && (
                            <Box>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: cuposColor,
                                  fontWeight: cuposDisp <= 5 ? 600 : 400,
                                }}
                              >
                                {cuposDisp > 0
                                  ? `${cuposDisp} cupos disponibles`
                                  : 'Sin cupos'
                                }
                              </Typography>
                              {showUrgencia && (
                                <Typography
                                  variant="caption"
                                  sx={{
                                    display: 'block',
                                    color: cuposColor,
                                    fontWeight: 700,
                                    fontStyle: 'italic',
                                  }}
                                >
                                  ¡Últimos cupos!
                                </Typography>
                              )}
                            </Box>
                          )}
                        </Box>
                      </MenuItem>
                    )
                  })}
                </Select>
              </FormControl>
            </Box>
          ) : (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 1 }}>
              <DateIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                Sin fechas disponibles
              </Typography>
            </Box>
          )}
        </Stack>
      </CardContent>

      {/* Precio y acciones */}
      <Box
        sx={{
          px: 2,
          pb: 2,
          mt: "auto", // Empuja las acciones al fondo
        }}
      >
        {/* Precio arriba */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
            Desde
          </Typography>
          <Typography
            variant="h4"
            color="primary"
            sx={{
              fontWeight: 700,
              fontSize: { xs: '1.5rem', md: '1.75rem' },
            }}
          >
            ${precioFinal?.toLocaleString()}
          </Typography>
        </Box>

        {/* Botón Ver más - Usuario debe hacer clic para ver detalles y fechas */}
        <Button
          variant="contained"
          size="medium"
          fullWidth
          onClick={(e) => {
            e.stopPropagation()
            handleCardClick()
          }}
          sx={{
            bgcolor: "primary.main",
            "&:hover": {
              bgcolor: "primary.dark",
            },
          }}
        >
          Ver Detalles
        </Button>
      </Box>

    </Card>
  )
}
