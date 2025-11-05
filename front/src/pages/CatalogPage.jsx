import { useState, useEffect } from "react"
import {
  Container,
  Grid,
  Typography,
  Box,
  Pagination,
  Alert,
  Skeleton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from "@mui/material"
import Header from "../components/Header"
import Footer from "../components/Footer"
import { CatalogFilters } from "../components/CatalogFilters"
import { TripCard } from "../components/TripCard"
import { useViajes } from "../hooks/useViajes"

/**
 * CatalogPage - Página del catálogo de viajes
 */
export default function CatalogPage() {
  const [filters, setFilters] = useState({ activo: true })
  const [sortBy, setSortBy] = useState("fecha_creacion")
  const { viajes, loading, error, pagination, refetch } = useViajes({ activo: true })

  // Actualizar título de la página
  useEffect(() => {
    document.title = "Catálogo de Viajes - TrekkingAR"
  }, [])

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
    refetch({ activo: true, ...newFilters, sortBy }, 1)
  }

  const handleClearFilters = () => {
    setFilters({})
    refetch({ activo: true, sortBy }, 1)
  }

  const handlePageChange = (event, page) => {
    refetch({ activo: true, ...filters, sortBy }, page)
    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleSortChange = (event) => {
    const newSortBy = event.target.value
    setSortBy(newSortBy)
    refetch({ activo: true, ...filters, sortBy: newSortBy }, pagination.page)
  }

  // Agrupar viajes por mes de salida - cada viaje puede aparecer en múltiples meses
  const groupTripsByMonth = (trips) => {
    const grouped = {}

    trips.forEach(trip => {
      // Obtener TODOS los meses donde el viaje tiene fechas disponibles
      if (trip.fechas_disponibles && trip.fechas_disponibles.length > 0) {
        const monthsSet = new Set()

        trip.fechas_disponibles.forEach(fecha => {
          const date = new Date(fecha.fecha_inicio)
          const monthKey = `${date.getFullYear()}-${date.getMonth()}`

          if (!monthsSet.has(monthKey)) {
            monthsSet.add(monthKey)
            const monthName = date.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })

            if (!grouped[monthKey]) {
              grouped[monthKey] = {
                month: monthName,
                trips: [],
                sortOrder: date.getTime()
              }
            }
            grouped[monthKey].trips.push(trip)
          }
        })
      } else {
        // Sin fechas disponibles
        if (!grouped['sin-fecha']) {
          grouped['sin-fecha'] = {
            month: 'Sin fechas disponibles',
            trips: [],
            sortOrder: Infinity
          }
        }
        grouped['sin-fecha'].trips.push(trip)
      }
    })

    // Ordenar grupos por fecha
    return Object.values(grouped).sort((a, b) => a.sortOrder - b.sortOrder)
  }

  return (
    <Box sx={{
      bgcolor: "background.default",
      minHeight: "100vh",
      overflowX: "hidden", // Evitar scroll horizontal
      overflowY: "auto", // Permitir scroll vertical normal
    }}>
      <Header />

      {/* Contenedor con padding-top para no solaparse con el header fijo */}
      <Container maxWidth="xl" sx={{ pt: { xs: 10, md: 12 }, pb: 4 }}>
        {/* Título principal "Salidas" */}
        <Box sx={{ mb: 2, mt: 2, textAlign: 'center' }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              fontSize: { xs: 36, md: 48 },
              mb: 1,
              background: (theme) =>
                theme.palette.mode === 'dark'
                  ? "linear-gradient(45deg, #ffffff 30%, #D9A86C 90%)"
                  : "linear-gradient(45deg, #000000 30%, #D9A86C 90%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Salidas
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Descubre experiencias únicas de trekking y aventura en la Argentina
          </Typography>
        </Box>

        {/* Mini-hero: Imagen panorámica */}
        <Box
          sx={{
            width: '100%',
            height: { xs: 150, md: 180 },
            mb: 5,
            backgroundImage: 'url(/miniHeroCatalog.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderRadius: 3,
            position: 'relative',
            overflow: 'hidden',
            boxShadow: 3,
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
              zIndex: 1,
            }
          }}
        />

        {/* Filtros */}
        <CatalogFilters
          onFilterChange={handleFilterChange}
          onClear={handleClearFilters}
        />

        {/* Header de resultados */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
            mt: 6,
          }}
        >
          <Typography variant="body1" color="text.secondary">
            {loading ? (
              "Cargando..."
            ) : (
              <>
                Mostrando {viajes.length} de {pagination.total} viajes
              </>
            )}
          </Typography>

          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Ordenar por</InputLabel>
            <Select value={sortBy} label="Ordenar por" onChange={handleSortChange}>
              <MenuItem value="fecha_creacion">Más recientes</MenuItem>
              <MenuItem value="precio_asc">Precio: menor a mayor</MenuItem>
              <MenuItem value="precio_desc">Precio: mayor a menor</MenuItem>
              <MenuItem value="duracion_asc">Duración: menor a mayor</MenuItem>
              <MenuItem value="duracion_desc">Duración: mayor a menor</MenuItem>
              <MenuItem value="popularidad">Más populares</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Error */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Grid de viajes agrupados por mes */}
        {loading ? (
          // Skeletons durante carga
          <Grid container spacing={3}>
            {Array.from(new Array(12)).map((_, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                <TripCard loading />
              </Grid>
            ))}
          </Grid>
        ) : viajes.length === 0 ? (
          // Sin resultados
          <Box
            sx={{
              textAlign: "center",
              py: 10,
              px: 2,
              borderRadius: 3,
              bgcolor: (theme) =>
                theme.palette.mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.02)'
                  : 'rgba(0, 0, 0, 0.02)',
            }}
          >
            <Typography variant="h2" sx={{ mb: 2, fontSize: 48 }}>
              🏞️
            </Typography>
            <Typography variant="h5" color="text.primary" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
              No encontramos salidas con esos filtros
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              ¡Prueba cambiar tu búsqueda!
            </Typography>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleClearFilters}
              sx={{ mt: 1 }}
            >
              Limpiar Filtros
            </Button>
          </Box>
        ) : (
          // Viajes agrupados por mes
          (() => {
            const groups = groupTripsByMonth(viajes)
            return (
              <>
                {groups.map((group, groupIndex) => (
                  <Box key={group.month} sx={{ mb: 6 }}>
                    {/* Título del mes */}
                    <Box
                      sx={{
                        mb: 3,
                        pb: 1,
                        borderBottom: (theme) => `2px solid ${theme.palette.primary.main}`,
                        textAlign: 'center',
                      }}
                    >
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 700,
                          color: "primary.main",
                          textTransform: "capitalize",
                        }}
                      >
                        {group.month}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {group.trips.length} {group.trips.length === 1 ? 'salida disponible' : 'salidas disponibles'}
                      </Typography>
                    </Box>

                    {/* Grid de viajes del mes */}
                    <Grid container spacing={3} justifyContent="center">
                      {group.trips.map((trip) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={trip.id_viaje}>
                          <TripCard trip={trip} />
                        </Grid>
                      ))}
                    </Grid>

                    {/* Separador entre grupos (excepto el último) */}
                    {groupIndex < groups.length - 1 && (
                      <Box sx={{ mt: 5, mb: 2 }}>
                        {/* Espacio visual entre grupos */}
                      </Box>
                    )}
                  </Box>
                ))}
              </>
            )
          })()
        )}

        {/* Paginación */}
        {!loading && pagination.totalPages > 1 && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <Pagination
              count={pagination.totalPages}
              page={pagination.page}
              onChange={handlePageChange}
              color="primary"
              size="large"
              showFirstButton
              showLastButton
            />
          </Box>
        )}
      </Container>

      <Footer />
    </Box>
  )
}
