import React, { useState } from 'react';
import { Box, IconButton, Tooltip, Typography, Paper } from '@mui/material';
import {
  ArrowUpward,
  ArrowDownward,
  ArrowBack,
  ArrowForward,
  CenterFocusStrong
} from '@mui/icons-material';

/**
 * ImageFocusControl - Control para ajustar el punto focal de una imagen
 * @param {Object} props
 * @param {String} props.imageUrl - URL de la imagen
 * @param {String} props.currentFocus - Punto focal actual ('center', 'top', 'bottom', etc.)
 * @param {Function} props.onChange - Callback cuando cambia el foco
 */
const ImageFocusControl = ({ imageUrl, currentFocus = 'center', onChange }) => {
  const [previewFocus, setPreviewFocus] = useState(currentFocus);

  const focusOptions = [
    { value: 'top', label: 'Arriba', icon: <ArrowUpward />, position: { top: 0, left: '50%', transform: 'translateX(-50%)' } },
    { value: 'bottom', label: 'Abajo', icon: <ArrowDownward />, position: { bottom: 0, left: '50%', transform: 'translateX(-50%)' } },
    { value: 'left', label: 'Izquierda', icon: <ArrowBack />, position: { top: '50%', left: 0, transform: 'translateY(-50%)' } },
    { value: 'right', label: 'Derecha', icon: <ArrowForward />, position: { top: '50%', right: 0, transform: 'translateY(-50%)' } },
    { value: 'center', label: 'Centro', icon: <CenterFocusStrong />, position: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' } },
    { value: 'top left', label: 'Arriba Izquierda', icon: null, position: { top: 5, left: 5 } },
    { value: 'top right', label: 'Arriba Derecha', icon: null, position: { top: 5, right: 5 } },
    { value: 'bottom left', label: 'Abajo Izquierda', icon: null, position: { bottom: 5, left: 5 } },
    { value: 'bottom right', label: 'Abajo Derecha', icon: null, position: { bottom: 5, right: 5 } },
  ];

  const handleFocusChange = (newFocus) => {
    setPreviewFocus(newFocus);
    onChange(newFocus);
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 400 }}>
      {/* Preview de la imagen */}
      <Paper
        elevation={3}
        sx={{
          position: 'relative',
          width: '100%',
          height: 200,
          overflow: 'hidden',
          borderRadius: 2,
          mb: 2,
        }}
      >
        <Box
          component="img"
          src={imageUrl}
          alt="Preview"
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: previewFocus,
            transition: 'object-position 0.3s ease',
          }}
        />

        {/* Overlay con indicador de foco */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at var(--focus-x, 50%) var(--focus-y, 50%), transparent 20%, rgba(0,0,0,0.3) 80%)',
            pointerEvents: 'none',
          }}
        />
      </Paper>

      {/* Información actual */}
      <Typography variant="caption" display="block" gutterBottom sx={{ textAlign: 'center', mb: 2 }}>
        Foco actual: <strong>{currentFocus}</strong>
      </Typography>

      {/* Controles */}
      <Box sx={{ position: 'relative', height: 140, mx: 'auto', maxWidth: 180 }}>
        {/* Botón Centro */}
        <Tooltip title="Centro" arrow>
          <IconButton
            onClick={() => handleFocusChange('center')}
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              bgcolor: previewFocus === 'center' ? 'primary.main' : 'background.paper',
              color: previewFocus === 'center' ? 'white' : 'text.primary',
              transition: 'transform 0.2s ease, background-color 0.2s ease',
              '&:hover': {
                bgcolor: previewFocus === 'center' ? 'primary.dark' : 'grey.300',
                transform: 'translate(-50%, -50%) scale(1.15)',
              },
              boxShadow: 2,
            }}
          >
            <CenterFocusStrong />
          </IconButton>
        </Tooltip>

        {/* Botón Arriba */}
        <Tooltip title="Arriba" arrow>
          <IconButton
            onClick={() => handleFocusChange('top')}
            sx={{
              position: 'absolute',
              top: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              bgcolor: previewFocus === 'top' ? 'primary.main' : 'background.paper',
              color: previewFocus === 'top' ? 'white' : 'text.primary',
              transition: 'transform 0.2s ease, background-color 0.2s ease',
              '&:hover': {
                bgcolor: previewFocus === 'top' ? 'primary.dark' : 'grey.300',
                transform: 'translateX(-50%) scale(1.15)',
              },
              boxShadow: 2,
            }}
          >
            <ArrowUpward />
          </IconButton>
        </Tooltip>

        {/* Botón Abajo */}
        <Tooltip title="Abajo" arrow>
          <IconButton
            onClick={() => handleFocusChange('bottom')}
            sx={{
              position: 'absolute',
              bottom: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              bgcolor: previewFocus === 'bottom' ? 'primary.main' : 'background.paper',
              color: previewFocus === 'bottom' ? 'white' : 'text.primary',
              transition: 'transform 0.2s ease, background-color 0.2s ease',
              '&:hover': {
                bgcolor: previewFocus === 'bottom' ? 'primary.dark' : 'grey.300',
                transform: 'translateX(-50%) scale(1.15)',
              },
              boxShadow: 2,
            }}
          >
            <ArrowDownward />
          </IconButton>
        </Tooltip>

        {/* Botón Izquierda */}
        <Tooltip title="Izquierda" arrow>
          <IconButton
            onClick={() => handleFocusChange('left')}
            sx={{
              position: 'absolute',
              left: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              bgcolor: previewFocus === 'left' ? 'primary.main' : 'background.paper',
              color: previewFocus === 'left' ? 'white' : 'text.primary',
              transition: 'transform 0.2s ease, background-color 0.2s ease',
              '&:hover': {
                bgcolor: previewFocus === 'left' ? 'primary.dark' : 'grey.300',
                transform: 'translateY(-50%) scale(1.15)',
              },
              boxShadow: 2,
            }}
          >
            <ArrowBack />
          </IconButton>
        </Tooltip>

        {/* Botón Derecha */}
        <Tooltip title="Derecha" arrow>
          <IconButton
            onClick={() => handleFocusChange('right')}
            sx={{
              position: 'absolute',
              right: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              bgcolor: previewFocus === 'right' ? 'primary.main' : 'background.paper',
              color: previewFocus === 'right' ? 'white' : 'text.primary',
              transition: 'transform 0.2s ease, background-color 0.2s ease',
              '&:hover': {
                bgcolor: previewFocus === 'right' ? 'primary.dark' : 'grey.300',
                transform: 'translateY(-50%) scale(1.15)',
              },
              boxShadow: 2,
            }}
          >
            <ArrowForward />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Opciones de esquinas (si lo necesitas) */}
      <Typography variant="caption" display="block" sx={{ mt: 2, textAlign: 'center', color: 'text.secondary' }}>
        Ajusta el punto focal para mejorar la visualización en dispositivos móviles
      </Typography>
    </Box>
  );
};

export default ImageFocusControl;
