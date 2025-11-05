import { Grid, Typography, Container, Box, CircularProgress, Alert } from "@mui/material";
import { TripCard } from "./TripCard";
import { useViajes } from "../hooks/useViajes";

const ProximosViajes = () => {
  // Obtener solo los primeros 6 viajes activos
  const { viajes, loading, error } = useViajes({ limit: 6, activo: true });

  return (
    <Container sx={{ py: 6 }}>
      <Typography
        variant="h4"
        fontWeight="bold"
        gutterBottom
        align="center"
      >
        Próximos Viajes
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

      {/* Grid de viajes */}
      {!loading && !error && (
        <Grid
          container
          spacing={3}
          justifyContent="center"
        >
          {viajes.length === 0 ? (
            <Grid item xs={12}>
              <Typography variant="body1" color="text.secondary" align="center">
                No hay viajes disponibles en este momento
              </Typography>
            </Grid>
          ) : (
            viajes.map((viaje) => (
              <Grid item key={viaje.id_viaje} xs={12} sm={6} md={4}>
                <TripCard trip={viaje} />
              </Grid>
            ))
          )}
        </Grid>
      )}
    </Container>
  );
};

export default ProximosViajes;
