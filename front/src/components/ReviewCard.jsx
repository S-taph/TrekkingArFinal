import { Box, Typography, Paper, Rating, Avatar } from '@mui/material';
import { motion } from 'framer-motion';
import { LocationOn as LocationIcon } from '@mui/icons-material';

/**
 * ReviewCard - Tarjeta individual de review
 * @param {Object} review - Objeto del review
 * @param {number} index - Índice para animación escalonada
 */
export const ReviewCard = ({ review, index = 0 }) => {
  const { nombre, ubicacion, comentario, rating } = review;

  // Obtener iniciales para el avatar
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.1,
        ease: 'easeOut'
      }}
    >
      <Paper
        elevation={2}
        sx={{
          p: 3,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          borderRadius: 2,
          transition: 'all 0.3s ease',
          '&:hover': {
            elevation: 4,
            transform: 'translateY(-4px)',
          }
        }}
      >
        {/* Header con avatar y nombre */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{
              bgcolor: 'primary.main',
              width: 48,
              height: 48,
              fontWeight: 600
            }}
          >
            {getInitials(nombre)}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
              {nombre}
            </Typography>
            {ubicacion && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <LocationIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  {ubicacion}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* Rating */}
        <Rating value={rating} readOnly size="small" />

        {/* Comentario */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            flex: 1,
            lineHeight: 1.6,
            display: '-webkit-box',
            WebkitLineClamp: 4,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          "{comentario}"
        </Typography>
      </Paper>
    </motion.div>
  );
};

export default ReviewCard;
