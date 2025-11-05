import { Grid, Typography, Container, Box, CircularProgress, Alert } from "@mui/material";
import { TripCard } from "./TripCard";
import { useViajes } from "../hooks/useViajes";

/**
 * ExperienciasDestacadas - Muestra viajes marcados como destacados
 */
const ExperienciasDestacadas = () => {
  // Obtener solo viajes destacados activos
  const { viajes, loading, error } = useViajes({ destacado: true, activo: true, limit: 3 });

  // Si no hay viajes destacados, no mostrar la sección
  if (!loading && viajes.length === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        py: { xs: 6, md: 8 },
      }}
    >
      <Container maxWidth="lg">
        <Typography
          variant="h4"
          fontWeight="bold"
          gutterBottom
          align="center"
          sx={{ mb: 6 }}
        >
          Experiencias Destacadas
        </Typography>

        {/* Loading */}
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
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

export default ExperienciasDestacadas;
