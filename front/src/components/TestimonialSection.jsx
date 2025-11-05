import React from 'react';
import { Box, Typography, Paper, Grid, Rating, Avatar } from '@mui/material';
import { FormatQuote } from '@mui/icons-material';

/**
 * TestimonialSection - Sección de testimonios con fotos
 * @param {Object} props
 * @param {Array} props.testimonials - Array de testimonios (opcional, usa mock data si no se provee)
 */
const TestimonialSection = ({ testimonials }) => {
  // Mock testimonials si no se proveen
  const defaultTestimonials = [
    {
      id: 1,
      nombre: 'María González',
      avatar: 'https://ui-avatars.com/api/?name=Maria+Gonzalez&background=3BA66B&color=fff&size=128',
      rating: 5,
      comentario: 'Una experiencia inolvidable. Los guías fueron excepcionales y los paisajes simplemente espectaculares. ¡Volveré sin dudas!',
      fecha: '15 de Octubre, 2024',
    },
    {
      id: 2,
      nombre: 'Carlos Martínez',
      avatar: 'https://ui-avatars.com/api/?name=Carlos+Martinez&background=2E8B57&color=fff&size=128',
      rating: 5,
      comentario: 'Organización impecable, todo salió perfecto. La atención al detalle y el profesionalismo del equipo superó nuestras expectativas.',
      fecha: '8 de Octubre, 2024',
    },
    {
      id: 3,
      nombre: 'Laura Rodríguez',
      avatar: 'https://ui-avatars.com/api/?name=Laura+Rodriguez&background=256A46&color=fff&size=128',
      rating: 5,
      comentario: 'La mejor aventura de mi vida. Cada momento fue mágico y los compañeros de viaje se convirtieron en amigos. Totalmente recomendable.',
      fecha: '1 de Octubre, 2024',
    },
  ];

  const displayTestimonials = testimonials || defaultTestimonials;

  if (!displayTestimonials || displayTestimonials.length === 0) {
    return null;
  }

  return (
    <Box sx={{
      mt: 6,
      py: 6,
      px: 3,
      backgroundColor: (theme) => theme.palette.mode === 'dark'
        ? theme.palette.background.paper
        : '#FFE8DC',
      borderRadius: 2,
    }}>
      {/* Título */}
      <Typography
        variant="h5"
        gutterBottom
        sx={{
          fontWeight: 700,
          mb: 3,
          textAlign: 'center',
        }}
      >
        Lo que dicen quienes ya lo vivieron
      </Typography>

      {/* Grid de testimonios */}
      <Grid container spacing={3}>
        {displayTestimonials.map((testimonial) => (
          <Grid item xs={12} md={4} key={testimonial.id}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                borderRadius: 3,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6,
                },
              }}
            >
              {/* Icono de comillas */}
              <FormatQuote
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  fontSize: 40,
                  color: 'primary.main',
                  opacity: 0.2,
                }}
              />

              {/* Header con avatar y nombre */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar
                  src={testimonial.avatar}
                  alt={testimonial.nombre}
                  sx={{
                    width: 56,
                    height: 56,
                    mr: 2,
                    border: '3px solid',
                    borderColor: 'primary.main',
                  }}
                />
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {testimonial.nombre}
                  </Typography>
                  <Rating value={testimonial.rating} readOnly size="small" />
                </Box>
              </Box>

              {/* Comentario */}
              <Typography
                variant="body2"
                sx={{
                  flex: 1,
                  lineHeight: 1.7,
                  color: 'text.secondary',
                  fontStyle: 'italic',
                  mb: 2,
                }}
              >
                "{testimonial.comentario}"
              </Typography>

              {/* Fecha */}
              <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                {testimonial.fecha}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default TestimonialSection;
