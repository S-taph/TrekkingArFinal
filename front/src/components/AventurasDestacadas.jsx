import { Grid, Typography, Container, Box, CircularProgress, Alert } from "@mui/material";
import { TripCard } from "./TripCard";
import { useViajes } from "../hooks/useViajes";

const AventurasDestacadas = () => {
  // Obtener solo los viajes marcados como destacados (máximo 6)
  const { viajes, loading, error } = useViajes({ limit: 6, activo: true, destacado: true });

  // Si no hay viajes destacados, no mostrar la sección
  if (!loading && !error && viajes.length === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        position: 'relative',
        py: { xs: 6, md: 8 },
        overflow: 'visible',
        // Fondo base neutral
        background: (theme) =>
          theme.palette.mode === 'dark'
            ? '#1a1a1a'
            : '#2d2d2d',
      }}
    >
      {/* Imagen de montañas */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          minHeight: '100%',
          height: '100%',
          backgroundImage: 'url(../public/mountain-background.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center bottom',
          backgroundRepeat: 'no-repeat',
          opacity: (theme) => theme.palette.mode === 'dark' ? 0.4 : 0.5,
          imageRendering: '-webkit-optimize-contrast',
          WebkitImageRendering: '-webkit-optimize-contrast',
          MozImageRendering: 'crisp-edges',
          msImageRendering: 'crisp-edges',
          zIndex: 1,
        }}
      />

      {/* Contenedor del contenido con z-index superior */}
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
        <Typography
          variant="h4"
          fontWeight="bold"
          gutterBottom
          align="center"
          sx={{
            color: '#FFFFFF',
            textShadow: '0 2px 8px rgba(0,0,0,0.8), 0 1px 3px rgba(0,0,0,0.6)',
            fontWeight: 900,
            letterSpacing: '0.5px',
          }}
        >
          Aventuras Destacadas
        </Typography>

        <Typography
          variant="body1"
          align="center"
          sx={{
            mb: 4,
            color: '#FFFFFF',
            textShadow: '0 2px 6px rgba(0,0,0,0.7), 0 1px 2px rgba(0,0,0,0.5)',
            fontSize: '1.2rem',
            fontWeight: 600,
            letterSpacing: '0.3px',
          }}
        >
          Descubre nuestras experiencias más populares y recomendadas
        </Typography>

      {/* Loading */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress sx={{ color: '#C7F464' }} />
        </Box>
      )}

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Grid de viajes destacados */}
      {!loading && !error && (
        <Grid
          container
          spacing={3}
          justifyContent="center"
        >
          {viajes.map((viaje) => (
            <Grid item key={viaje.id_viaje} xs={12} sm={6} md={4}>
              <TripCard trip={viaje} />
            </Grid>
          ))}
        </Grid>
      )}
      </Container>
    </Box>
  );
};

export default AventurasDestacadas;
