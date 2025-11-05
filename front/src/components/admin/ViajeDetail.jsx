"use client"

import {
  Box,
  Typography,
  Chip,
  Grid2,
  Card,
  CardContent,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
} from "@mui/material"
import { Edit as EditIcon } from "@mui/icons-material"

const getDificultadColor = (dificultad) => {
  switch (dificultad) {
    case "facil":
      return "success"
    case "moderado":
      return "warning"
    case "dificil":
      return "error"
    case "extremo":
      return "error"
    default:
      return "default"
  }
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(amount)
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function ViajeDetail({ viaje, onEdit }) {
  if (!viaje) return null

  return (
    <Box sx={{ mt: 2 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
        <Box>
          <Typography variant="h5" gutterBottom>
            {viaje.titulo}
          </Typography>
          <Box display="flex" gap={1} mb={2}>
            <Chip label={viaje.activo ? "Activo" : "Inactivo"} color={viaje.activo ? "success" : "default"} />
            <Chip
              label={viaje.dificultad}
              color={getDificultadColor(viaje.dificultad)}
              sx={{ textTransform: "capitalize" }}
            />
            <Chip label={`${viaje.duracion_dias} días`} variant="outlined" />
          </Box>
        </Box>
        <Button variant="outlined" startIcon={<EditIcon />} onClick={onEdit}>
          Editar
        </Button>
      </Box>

      <Grid2 container spacing={3}>
        {/* Información principal */}
        <Grid2 item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Descripción
              </Typography>
              <Typography variant="body1" paragraph>
                {viaje.descripcion_completa || viaje.descripcion_corta || "Sin descripción"}
              </Typography>

              {viaje.incluye && (
                <>
                  <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                    Qué Incluye
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {viaje.incluye}
                  </Typography>
                </>
              )}

              {viaje.no_incluye && (
                <>
                  <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                    Qué NO Incluye
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {viaje.no_incluye}
                  </Typography>
                </>
              )}

              {viaje.recomendaciones && (
                <>
                  <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                    Recomendaciones
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {viaje.recomendaciones}
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid2>

        {/* Información lateral */}
        <Grid2 item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Detalles del Viaje
              </Typography>

              <List dense>
                <ListItem>
                  <ListItemText primary="Categoría" secondary={viaje.categoria?.nombre || "Sin categoría"} />
                </ListItem>
                <Divider />

                <ListItem>
                  <ListItemText primary="Precio Base" secondary={formatCurrency(viaje.precio_base)} />
                </ListItem>
                <Divider />

                <ListItem>
                  <ListItemText primary="Duración" secondary={`${viaje.duracion_dias} días`} />
                </ListItem>
                <Divider />

                <ListItem>
                  <ListItemText primary="Dificultad" secondary={viaje.dificultad} />
                </ListItem>
                <Divider />

                {viaje.minimo_participantes && (
                  <>
                    <ListItem>
                      <ListItemText primary="Mínimo Participantes" secondary={viaje.minimo_participantes} />
                    </ListItem>
                    <Divider />
                  </>
                )}

                {viaje.maximo_participantes && (
                  <>
                    <ListItem>
                      <ListItemText primary="Máximo Participantes" secondary={viaje.maximo_participantes} />
                    </ListItem>
                    <Divider />
                  </>
                )}

                <ListItem>
                  <ListItemText primary="Estado" secondary={viaje.activo ? "Activo" : "Inactivo"} />
                </ListItem>
                <Divider />

                <ListItem>
                  <ListItemText
                    primary="Fecha de Creación"
                    secondary={formatDate(viaje.fecha_creacion || viaje.createdAt)}
                  />
                </ListItem>

                {viaje.fecha_actualizacion && (
                  <>
                    <Divider />
                    <ListItem>
                      <ListItemText
                        primary="Última Actualización"
                        secondary={formatDate(viaje.fecha_actualizacion || viaje.updatedAt)}
                      />
                    </ListItem>
                  </>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid2>
      </Grid2>
    </Box>
  )
}
