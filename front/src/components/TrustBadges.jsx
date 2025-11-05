import React from 'react';
import { Stack, Typography, Box } from '@mui/material';
import { CheckCircle, EventAvailable, Lock } from '@mui/icons-material';

/**
 * TrustBadges - Badges de confianza debajo de los CTAs
 */
const TrustBadges = () => {
  const badges = [
    { icon: <CheckCircle fontSize="small" />, text: 'Guías certificados' },
    { icon: <EventAvailable fontSize="small" />, text: 'Cancelación flexible' },
    { icon: <Lock fontSize="small" />, text: 'Pago seguro' },
  ];

  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{
        mt: 2,
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 1.5,
      }}
    >
      {badges.map((badge, index) => (
        <Box
          key={index}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            px: 1.5,
            py: 0.5,
            bgcolor: (theme) => theme.palette.mode === 'dark'
              ? 'rgba(255, 255, 255, 0.1)'
              : 'rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.3)'}`,
          }}
        >
          <Box sx={{
            color: (theme) => theme.palette.mode === 'dark' ? '#C7F464' : '#fff',
            display: 'flex',
            alignItems: 'center',
          }}>
            {badge.icon}
          </Box>
          <Typography
            variant="caption"
            sx={{
              color: (theme) => theme.palette.mode === 'dark' ? '#fff' : '#fff',
              fontWeight: 600,
              fontSize: '0.75rem',
              whiteSpace: 'nowrap',
            }}
          >
            {badge.text}
          </Typography>
        </Box>
      ))}
    </Stack>
  );
};

export default TrustBadges;
