"use client"

import { Box, Typography, Grid, Card, CardContent, Chip, Avatar } from "@mui/material"

const GuiaDetail = ({ guia }) => {
  if (!guia) return null

  const getInitials = (nombre, apellido) =>
    `${nombre?.[0] || ""}${apellido?.[0] || ""}`.toUpperCase()

  return (
    <Box>
      {/* Header: Avatar y Nombre */}
      <Box display="flex" flexDirection="column" alignItems="center" mb={4}>
        <Avatar src={guia.usuario?.avatar} sx={{ width: 80, height: 80, bgcolor: "primary.main", mb: 2 }}>
          {getInitials(guia.usuario?.nombre, guia.usuario?.apellido)}
        </Avatar>
        <Typography variant="h5" fontWeight="bold">
          {guia.usuario?.nombre} {guia.usuario?.apellido}
        </Typography>
        <Box display="flex" gap={1} mt={1}>
          <Chip
            label={guia.activo ? "Activo" : "Inactivo"}
            color={guia.activo ? "success" : "default"}
            size="small"
          />
          <Chip
            label={guia.disponible ? "Disponible" : "No disponible"}
            color={guia.disponible ? "success" : "error"}
            size="small"
          />
        </Box>
      </Box>

      {/* Información General */}
      <Section title="Información General">
        <Grid container spacing={2}>
          <DetailCard label="ID del Guía" value={guia.id_guia} />
          <DetailCard label="Años de Experiencia" value={guia.anos_experiencia || "No especificado"} />
          <DetailCard label="Idiomas" value={guia.idiomas || "No especificado"} />
          <DetailCard
            label="Tarifa por Día"
            value={guia.tarifa_por_dia ? `$${guia.tarifa_por_dia}` : "No especificado"}
          />
        </Grid>
      </Section>

      {/* Actividad */}
      <Section title="Actividad">
        <Grid container spacing={2}>
          <DetailCard
            label="Calificación Promedio"
            value={guia.calificacion_promedio ? `${guia.calificacion_promedio}/5` : "Sin calificar"}
          />
          <DetailCard
            label="Total Viajes Guiados"
            value={guia.total_viajes_guiados || 0}
          />
        </Grid>
      </Section>

      {/* Registro y Actualización */}
      <Section title="Registro y Actualización">
        <Grid container spacing={2}>
          <DetailCard
            label="Fecha de Registro"
            value={
              guia.fecha_registro
                ? new Date(guia.fecha_registro).toLocaleDateString()
                : "No disponible"
            }
          />
          <DetailCard
            label="Última Actualización"
            value={
              guia.fecha_actualizacion
                ? new Date(guia.fecha_actualizacion).toLocaleDateString()
                : "No disponible"
            }
          />
        </Grid>
      </Section>

      {/* Campos largos */}
      <Section title="Información Adicional">
        <DetailBlock label="Certificaciones" value={guia.certificaciones || "No especificado"} />
        <DetailBlock label="Especialidades" value={guia.especialidades || "No especificado"} />
      </Section>
    </Box>
  )
}

/* Subcomponente: Sección con título */
const Section = ({ title, children }) => (
  <Box mb={3}>
    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
      {title}
    </Typography>
    {children}
  </Box>
)

/* Subcomponente: Detalles cortos dentro de Grid */
const DetailCard = ({ label, value }) => (
  <Grid item xs={12} sm={6}>
    <Card variant="outlined">
      <CardContent>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="body1" fontWeight="medium">
          {value}
        </Typography>
      </CardContent>
    </Card>
  </Grid>
)

/* Subcomponente: Bloques largos */
const DetailBlock = ({ label, value }) => (
  <Card variant="outlined" sx={{ mb: 2 }}>
    <CardContent>
      <Typography variant="caption" color="text.secondary" gutterBottom>
        {label}
      </Typography>
      <Typography variant="body1">{value}</Typography>
    </CardContent>
  </Card>
)

export default GuiaDetail
