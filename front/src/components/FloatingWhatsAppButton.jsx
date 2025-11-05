import React from 'react';
import { Fab, Tooltip } from '@mui/material';
import { WhatsApp } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

/**
 * FloatingWhatsAppButton - Botón flotante para consultas por WhatsApp
 * @param {Object} props
 * @param {String} props.tripId - ID del viaje
 * @param {String} props.tripName - Nombre del viaje
 * @param {Boolean} props.showOnMobile - Mostrar solo en mobile (default: true)
 */
const FloatingWhatsAppButton = ({
  tripId,
  tripName,
  showOnMobile = true
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    const queryParams = new URLSearchParams({
      tripId,
      tripName
    });
    navigate(`/contacto?${queryParams.toString()}`);
  };

  return (
    <Tooltip title="¿Tenés dudas? Hablanos" placement="left" arrow>
      <Fab
        color="secondary"
        aria-label="Consultar por WhatsApp"
        onClick={handleClick}
        sx={{
          position: 'fixed',
          bottom: { xs: 20, md: 24 },
          right: { xs: 20, md: 24 },
          zIndex: 1000,
          display: showOnMobile ? { xs: 'flex', md: 'none' } : 'flex',
          background: (theme) => `linear-gradient(135deg, ${theme.palette.adventure?.limeAccent || '#C7F464'}, #AEEB56)`,
          color: '#07220d',
          boxShadow: '0 6px 20px rgba(174, 213, 129, 0.4)',
          '&:hover': {
            background: (theme) => `linear-gradient(135deg, ${theme.palette.adventure?.limeAccent || '#C7F464'}, #9CCC65)`,
            boxShadow: '0 8px 24px rgba(174, 213, 129, 0.5)',
            transform: 'scale(1.05)',
          },
          transition: 'all 0.2s ease',
          // Animación de entrada
          animation: 'fadeInUp 0.4s ease-out',
          '@keyframes fadeInUp': {
            from: {
              opacity: 0,
              transform: 'translateY(20px)',
            },
            to: {
              opacity: 1,
              transform: 'translateY(0)',
            },
          },
        }}
      >
        <WhatsApp />
      </Fab>
    </Tooltip>
  );
};

export default FloatingWhatsAppButton;
