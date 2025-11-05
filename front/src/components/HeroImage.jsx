import React, { useState, useEffect } from 'react';
import { Box, Typography, Chip, Stack, IconButton, Button } from '@mui/material';
import { AccessTime, TrendingUp, Place, Collections } from '@mui/icons-material';

/**
 * HeroImage - Componente de imagen principal con overlay y thumbnails
 * @param {Object} props
 * @param {Array} props.images - Array de URLs de imágenes
 * @param {String} props.title - Título del viaje
 * @param {Number} props.duracion - Duración en días
 * @param {String} props.dificultad - Nivel de dificultad
 * @param {String} props.ubicacion - Ubicación/destino
 * @param {Function} props.onOpenGallery - Callback al abrir galería completa
 */
const HeroImage = ({
  images = [],
  title,
  duracion,
  dificultad,
  ubicacion,
  onOpenGallery
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  // Placeholder SVG si no hay imagen
  const placeholderImage = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1600' height='600'%3E%3Crect fill='%23308256' width='1600' height='600'/%3E%3Ctext fill='rgba(255,255,255,0.5)' font-family='Arial' font-size='24' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3ESin imagen disponible%3C/text%3E%3C/svg%3E`;

  const currentImageObj = images[currentImageIndex] || { url: placeholderImage, focus_point: 'center' };
  const currentImage = typeof currentImageObj === 'string' ? currentImageObj : (currentImageObj.url || placeholderImage);
  const currentFocus = typeof currentImageObj === 'object' ? (currentImageObj.focus_point || 'center') : 'center';
  const hasMultipleImages = images.length > 1;

  const handleThumbnailClick = (index) => {
    setCurrentImageIndex(index);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  // Mapeo de dificultad a colores
  const difficultyColors = {
    'Fácil': 'success',
    'Moderada': 'warning',
    'Difícil': 'error',
    'Muy Difícil': 'error',
  };

  return (
    <Box>
      {/* Hero Image Container */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: { xs: '320px', sm: '420px', md: '560px' },
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: 4,
        }}
      >
        {/* Main Image */}
        <Box
          component="img"
          src={imageError ? placeholderImage : currentImage}
          alt={title}
          onError={handleImageError}
          loading="lazy"
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: currentFocus,
            display: 'block',
            transition: 'object-position 0.3s ease',
          }}
        />

        {/* Overlay Gradient */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0) 100%)',
            pointerEvents: 'none',
          }}
        />

        {/* Content on Overlay */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: { xs: 2, sm: 3, md: 4 },
            zIndex: 2,
          }}
        >
          {/* Title */}
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.75rem' },
              marginBottom: 2,
              color: '#FFFFFF !important', // Blanco forzado para ambos modos
              textShadow: '2px 2px 8px rgba(0,0,0,0.8)',
              lineHeight: 1.2,
            }}
          >
            {title}
          </Typography>

          {/* Chips */}
          <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
            {duracion && (
              <Chip
                icon={<AccessTime />}
                label={`${duracion} ${duracion === 1 ? 'día' : 'días'}`}
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.25)',
                  backdropFilter: 'blur(10px)',
                  color: '#FFFFFF !important',
                  fontWeight: 600,
                  '& .MuiChip-icon': { color: '#FFFFFF !important' },
                  '& .MuiChip-label': { color: '#FFFFFF !important' }
                }}
              />
            )}
            {dificultad && (
              <Chip
                icon={<TrendingUp />}
                label={dificultad}
                color={difficultyColors[dificultad] || 'default'}
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.25)',
                  backdropFilter: 'blur(10px)',
                  color: '#FFFFFF !important',
                  fontWeight: 600,
                  '& .MuiChip-icon': { color: '#FFFFFF !important' },
                  '& .MuiChip-label': { color: '#FFFFFF !important' }
                }}
              />
            )}
            {ubicacion && (
              <Chip
                icon={<Place />}
                label={ubicacion}
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.25)',
                  backdropFilter: 'blur(10px)',
                  color: '#FFFFFF !important',
                  fontWeight: 600,
                  '& .MuiChip-icon': { color: '#FFFFFF !important' },
                  '& .MuiChip-label': { color: '#FFFFFF !important' }
                }}
              />
            )}
          </Stack>
        </Box>

        {/* Button to open gallery */}
        {hasMultipleImages && (
          <Button
            startIcon={<Collections />}
            onClick={onOpenGallery}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              backgroundColor: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(10px)',
              color: '#FFFFFF !important',
              fontWeight: 600,
              padding: '8px 16px',
              '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.8)',
              },
              '& .MuiButton-startIcon': {
                color: '#FFFFFF !important'
              }
            }}
          >
            Ver galería ({images.length} fotos)
          </Button>
        )}
      </Box>

      {/* Thumbnails */}
      {hasMultipleImages && (
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            mt: 2,
            overflowX: 'auto',
            pb: 1,
            '&::-webkit-scrollbar': {
              height: 6,
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(0,0,0,0.3)',
              borderRadius: 3,
            }
          }}
        >
          {images.slice(0, 6).map((image, index) => (
            <Box
              key={index}
              onClick={() => handleThumbnailClick(index)}
              sx={{
                minWidth: { xs: '80px', sm: '100px' },
                height: { xs: '60px', sm: '75px' },
                borderRadius: 2,
                overflow: 'hidden',
                cursor: 'pointer',
                border: currentImageIndex === index ? '3px solid' : '2px solid transparent',
                borderColor: currentImageIndex === index ? 'primary.main' : 'transparent',
                transition: 'all 0.2s ease',
                opacity: currentImageIndex === index ? 1 : 0.7,
                '&:hover': {
                  opacity: 1,
                  transform: 'scale(1.05)',
                },
                '&:focus': {
                  outline: '2px solid',
                  outlineColor: 'primary.main',
                  outlineOffset: 2,
                }
              }}
              tabIndex={0}
              role="button"
              aria-label={`Ver imagen ${index + 1}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleThumbnailClick(index);
                }
              }}
            >
              <Box
                component="img"
                src={typeof image === 'string' ? image : (image.url || image)}
                alt={`${title} - Imagen ${index + 1}`}
                loading="lazy"
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: typeof image === 'object' ? (image.focus_point || 'center') : 'center',
                }}
              />
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default HeroImage;
