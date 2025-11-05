import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography } from '@mui/material';

/**
 * TotalRow - Fila destacada del total con animación count-up
 * @param {Object} props
 * @param {Number} props.total - Monto total
 * @param {String} props.label - Label del total (default: "Total")
 */
const TotalRow = ({ total, label = "Total" }) => {
  const [displayValue, setDisplayValue] = useState(total);
  const previousValueRef = useRef(total);

  useEffect(() => {
    const previousValue = previousValueRef.current;
    const difference = total - previousValue;

    if (difference === 0) return;

    const duration = 400; // ms
    const steps = 20;
    const stepValue = difference / steps;
    const stepDuration = duration / steps;

    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        setDisplayValue(total);
        clearInterval(timer);
      } else {
        setDisplayValue(prev => Math.round(previousValue + (stepValue * currentStep)));
      }
    }, stepDuration);

    previousValueRef.current = total;

    return () => clearInterval(timer);
  }, [total]);

  return (
    <Box
      role="status"
      aria-live="polite"
      aria-label={`Total: $${total.toLocaleString()}`}
      sx={{
        mb: 3,
        p: 2,
        bgcolor: (theme) => theme.palette.mode === 'dark'
          ? 'rgba(0, 0, 0, 0.3)'
          : 'rgba(0, 0, 0, 0.15)',
        borderRadius: '10px',
        border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: (theme) => theme.palette.mode === 'dark' ? '#fff' : '#fff',
            letterSpacing: '0.5px',
          }}
        >
          {label}
        </Typography>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 900,
            color: (theme) => theme.palette.mode === 'dark' ? '#fff' : '#fff',
            transition: 'transform 0.2s ease',
            '&:hover': {
              transform: 'scale(1.05)',
            },
          }}
        >
          ${displayValue.toLocaleString()}
        </Typography>
      </Box>
    </Box>
  );
};

export default TotalRow;
