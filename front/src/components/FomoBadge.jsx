import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import { Whatshot as WhatshotIcon } from '@mui/icons-material';
import { track } from '../services/analytics';

/**
 * Determina si se debe mostrar el badge de FOMO
 * @param {Object} params
 * @param {Number} params.remaining - Cupos restantes
 * @param {Number} params.capacity - Capacidad total
 * @param {Number} params.reservasMes - Reservas del mes actual
 * @returns {Boolean}
 */
export const shouldShowFomo = ({ remaining, capacity, reservasMes = 0 }) => {
  // No mostrar si no hay datos o está agotado
  if (remaining === null || remaining === undefined || remaining === 0) {
    return false;
  }

  // Regla 1: Quedan 10 cupos o menos
  if (remaining <= 10) {
    return true;
  }

  // Regla 2: Menos del 15% de capacidad disponible
  if (capacity && capacity > 0) {
    const percentageRemaining = remaining / capacity;
    if (percentageRemaining < 0.15) {
      return true;
    }
  }

  // Regla 3: 5 o más reservas este mes
  if (reservasMes >= 5) {
    return true;
  }

  return false;
};

/**
 * FomoBadge - Badge de urgencia para aumentar conversión
 * @param {Object} props
 * @param {Number} props.remaining - Cupos restantes
 * @param {Number} props.capacity - Capacidad total
 * @param {Number} props.reservasMes - Reservas del mes
 * @param {String} props.mes - Nombre del mes (ej: "noviembre de 2025")
 * @param {String} props.tripId - ID del viaje (para analytics)
 * @param {Function} props.onClickAction - Función al hacer click (opcional)
 */
const FomoBadge = ({
  remaining,
  capacity,
  reservasMes = 0,
  mes,
  tripId,
  onClickAction
}) => {
  const [showPulse, setShowPulse] = useState(false);
  const hasTrackedRef = useRef(false);

  const shouldShow = shouldShowFomo({ remaining, capacity, reservasMes });

  // Track analytics cuando se muestra
  useEffect(() => {
    if (shouldShow && !hasTrackedRef.current) {
      track('fomo_shown', {
        tripId,
        remaining,
        capacity,
        reservasMes,
        mes
      });
      hasTrackedRef.current = true;
    }

    // Reset si cambian los datos
    return () => {
      if (!shouldShow) {
        hasTrackedRef.current = false;
      }
    };
  }, [shouldShow, tripId, remaining, capacity, reservasMes, mes]);

  // Pulse effect después de 6 segundos
  useEffect(() => {
    if (!shouldShow) return;

    const timer = setTimeout(() => {
      setShowPulse(true);
      // Remover el pulse después de 1 segundo
      setTimeout(() => setShowPulse(false), 1000);
    }, 6000);

    return () => clearTimeout(timer);
  }, [shouldShow]);

  const handleClick = () => {
    if (onClickAction) {
      track('fomo_click_to_reserve', {
        tripId,
        remaining,
        mes
      });
      onClickAction();
    }
  };

  if (!shouldShow) {
    return null;
  }

  return (
    <Box
      role="status"
      aria-live="polite"
      aria-label={`Quedan ${remaining} cupos para ${mes}`}
      onClick={onClickAction ? handleClick : undefined}
      className={showPulse ? 'fomo-pulse' : ''}
      sx={{
        background: (theme) =>
          `linear-gradient(90deg, ${theme.palette.fomo?.bgStart || '#FF9A3C'} 0%, ${theme.palette.fomo?.bgEnd || '#FF6A00'} 100%)`,
        color: (theme) => theme.palette.mode === 'dark' ? '#1A1A1A' : (theme.palette.fomo?.text || '#FFFFFF'),
        borderRadius: '12px',
        padding: '8px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        boxShadow: (theme) => theme.palette.mode === 'dark'
          ? '0 4px 12px rgba(255, 106, 0, 0.15)'
          : '0 4px 12px rgba(255, 106, 0, 0.25)',
        border: (theme) => `1px solid ${theme.palette.fomo?.border || 'rgba(0,0,0,0.08)'}`,
        cursor: onClickAction ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        animation: 'fomoEnter 0.5s ease-out',
        '&:hover': onClickAction ? {
          transform: 'scale(1.02)',
          boxShadow: '0 6px 16px rgba(255, 106, 0, 0.35)',
        } : {},
        '&.fomo-pulse': {
          animation: 'fomoPulse 1s ease-in-out',
        },
        '@keyframes fomoEnter': {
          from: {
            opacity: 0,
            transform: 'translateY(-10px)',
          },
          to: {
            opacity: 1,
            transform: 'translateY(0)',
          },
        },
        '@keyframes fomoPulse': {
          '0%, 100%': {
            transform: 'scale(1)',
          },
          '50%': {
            transform: 'scale(1.03)',
          },
        },
      }}
      tabIndex={onClickAction ? 0 : undefined}
      onKeyDown={onClickAction ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      } : undefined}
    >
      {/* Icono de fuego */}
      <WhatshotIcon sx={{
        fontSize: 24,
        color: (theme) => theme.palette.mode === 'dark' ? '#1A1A1A' : '#FFFFFF'
      }} />

      {/* Contenido de texto */}
      <Box sx={{ flex: 1 }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 700,
            fontSize: '1.05rem',
            lineHeight: 1.3,
            color: (theme) => theme.palette.mode === 'dark' ? '#1A1A1A' : '#FFFFFF',
          }}
        >
          {remaining === 1
            ? `¡Queda 1 cupo para ${mes || 'esta fecha'}!`
            : `¡Quedan ${remaining} cupos para ${mes || 'esta fecha'}!`
          }
        </Typography>

        {/* Subtexto opcional */}
        {reservasMes > 0 && (
          <Typography
            variant="caption"
            sx={{
              opacity: 0.9,
              fontSize: '0.875rem',
              fontWeight: 600,
              display: 'block',
              mt: 0.5,
              color: (theme) => theme.palette.mode === 'dark' ? '#1A1A1A' : '#FFFFFF',
            }}
          >
            {reservasMes} {reservasMes === 1 ? 'persona reservó' : 'personas reservaron'} este mes
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default FomoBadge;
