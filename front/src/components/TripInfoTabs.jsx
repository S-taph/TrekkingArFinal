import { useState } from "react"
import {
  Box,
  Tabs,
  Tab,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Rating,
  Avatar,
  Divider,
  Paper,
} from "@mui/material"
import {
  Check as CheckIcon,
  Close as CloseIcon,
  Map as MapIcon,
  Star as StarIcon,
} from "@mui/icons-material"

/**
 * TripInfoTabs - Pestañas con información del viaje
 */
export const TripInfoTabs = ({ trip }) => {
  const [activeTab, setActiveTab] = useState(0)

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  // Mock reviews - TODO: Integrar con backend GET /api/viajes/:id/reviews
  const mockReviews = [
    {
      id: 1,
      usuario: "María González",
      avatar: null,
      rating: 5,
      fecha: "2025-09-15",
      comentario:
        "Experiencia increíble! El guía fue muy profesional y la ruta espectacular. Totalmente recomendado.",
    },
    {
      id: 2,
      usuario: "Carlos Pérez",
      avatar: null,
      rating: 4,
      fecha: "2025-08-20",
      comentario:
        "Muy buena organización, paisajes hermosos. Solo mejoraría un poco la comida.",
    },
  ]

  return (
    <Box sx={{ width: "100%" }}>
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ borderBottom: 1, borderColor: "divider" }}
      >
        <Tab label="Descripción" />
        <Tab label="Incluye / No Incluye" />
        <Tab label="Itinerario" />
        <Tab label="Reseñas" />
      </Tabs>

      {/* Tab 0: Descripción */}
      <TabPanel value={activeTab} index={0}>
        <Typography variant="body1" paragraph>
          {trip?.descripcion || "Sin descripción disponible."}
        </Typography>

        {trip?.descripcion_larga && (
          <Typography variant="body1" color="text.secondary">
            {trip.descripcion_larga}
          </Typography>
        )}
      </TabPanel>

      {/* Tab 1: Incluye / No Incluye */}
      <TabPanel value={activeTab} index={1}>
        <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 4 }}>
          {/* Incluye */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: "success.main" }}>
              Qué incluye
            </Typography>
            <List dense>
              {trip?.incluye?.map((item, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <CheckIcon color="success" />
                  </ListItemIcon>
                  <ListItemText primary={item} />
                </ListItem>
              )) || (
                <>
                  <ListItem>
                    <ListItemIcon>
                      <CheckIcon color="success" />
                    </ListItemIcon>
                    <ListItemText primary="Guía profesional certificado" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckIcon color="success" />
                    </ListItemIcon>
                    <ListItemText primary="Equipo de seguridad" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckIcon color="success" />
                    </ListItemIcon>
                    <ListItemText primary="Comidas durante el trekking" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckIcon color="success" />
                    </ListItemIcon>
                    <ListItemText primary="Seguro de viaje" />
                  </ListItem>
                </>
              )}
            </List>
          </Box>

          {/* No Incluye */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: "error.main" }}>
              Qué no incluye
            </Typography>
            <List dense>
              {trip?.no_incluye?.map((item, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <CloseIcon color="error" />
                  </ListItemIcon>
                  <ListItemText primary={item} />
                </ListItem>
              )) || (
                <>
                  <ListItem>
                    <ListItemIcon>
                      <CloseIcon color="error" />
                    </ListItemIcon>
                    <ListItemText primary="Traslados hasta el punto de encuentro" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CloseIcon color="error" />
                    </ListItemIcon>
                    <ListItemText primary="Equipo personal (mochila, botas, etc.)" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CloseIcon color="error" />
                    </ListItemIcon>
                    <ListItemText primary="Propinas" />
                  </ListItem>
                </>
              )}
            </List>
          </Box>
        </Box>
      </TabPanel>

      {/* Tab 2: Itinerario */}
      <TabPanel value={activeTab} index={2}>
        {trip?.itinerario ? (
          <Box>
            {trip.itinerario.map((dia, index) => (
              <Box key={index} sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Día {index + 1}: {dia.titulo}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {dia.descripcion}
                </Typography>
                {index < trip.itinerario.length - 1 && <Divider sx={{ mt: 2 }} />}
              </Box>
            ))}
          </Box>
        ) : (
          <Typography variant="body1" color="text.secondary">
            Itinerario detallado disponible al confirmar la reserva.
          </Typography>
        )}
      </TabPanel>

      {/* Tab 3: Reseñas */}
      <TabPanel value={activeTab} index={3}>
        {/* TODO: Integrar con GET /api/viajes/:id/reviews */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Reseñas de viajeros ({mockReviews.length})
          </Typography>
          <Typography variant="caption" color="text.secondary">
            (Datos de ejemplo - pendiente integración con backend)
          </Typography>
        </Box>

        {mockReviews.map((review, index) => (
          <Paper key={review.id} sx={{ p: 2, mb: 2 }} elevation={1}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
              <Avatar>{review.usuario.charAt(0)}</Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {review.usuario}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Rating value={review.rating} readOnly size="small" />
                  <Typography variant="caption" color="text.secondary">
                    {new Date(review.fecha).toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {review.comentario}
            </Typography>
          </Paper>
        ))}
      </TabPanel>
    </Box>
  )
}

// Helper component for tab panels
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  )
}
