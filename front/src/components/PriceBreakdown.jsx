import React, { useState } from 'react';
import { Box, Typography, Collapse, IconButton, Divider, Stack } from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';

/**
 * PriceBreakdown - Precio desglosado colapsable
 * @param {Object} props
 * @param {Number} props.pricePerPerson - Precio por persona
 * @param {Number} props.quantity - Cantidad de personas
 */
const PriceBreakdown = ({ pricePerPerson, quantity }) => {
  const [expanded, setExpanded] = useState(false);

  const subtotal = pricePerPerson * quantity;
  const taxes = Math.round(subtotal * 0.10); // 10% impuestos ejemplo
  const total = subtotal + taxes;

  return (
    <Box
      sx={{
        mb: 2,
        border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.3)'}`,
        borderRadius: '8px',
        overflow: 'hidden',
      }}
    >
      <Box
        onClick={() => setExpanded(!expanded)}
        sx={{
          p: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          bgcolor: (theme) => theme.palette.mode === 'dark'
            ? 'rgba(255, 255, 255, 0.05)'
            : 'rgba(255, 255, 255, 0.1)',
          '&:hover': {
            bgcolor: (theme) => theme.palette.mode === 'dark'
              ? 'rgba(255, 255, 255, 0.08)'
              : 'rgba(255, 255, 255, 0.15)',
          },
          transition: 'background-color 0.2s ease',
        }}
      >
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            color: (theme) => theme.palette.mode === 'dark' ? '#fff' : '#fff',
          }}
        >
          Ver desglose de precio
        </Typography>
        <IconButton
          size="small"
          sx={{
            color: (theme) => theme.palette.mode === 'dark' ? '#fff' : '#fff',
          }}
          aria-label={expanded ? "Ocultar desglose" : "Ver desglose"}
        >
          {expanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </Box>

      <Collapse in={expanded}>
        <Box sx={{
          p: 2,
          bgcolor: (theme) => theme.palette.mode === 'dark'
            ? 'rgba(0, 0, 0, 0.2)'
            : 'rgba(0, 0, 0, 0.1)',
        }}>
          <Stack spacing={1.5}>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" sx={{ color: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.9)' }}>
                Precio por persona
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: (theme) => theme.palette.mode === 'dark' ? '#fff' : '#fff' }}>
                ${pricePerPerson.toLocaleString()}
              </Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" sx={{ color: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.9)' }}>
                Cantidad de personas
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: (theme) => theme.palette.mode === 'dark' ? '#fff' : '#fff' }}>
                x{quantity}
              </Typography>
            </Stack>

            <Divider sx={{ borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)' }} />

            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" sx={{ color: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.9)' }}>
                Subtotal
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: (theme) => theme.palette.mode === 'dark' ? '#fff' : '#fff' }}>
                ${subtotal.toLocaleString()}
              </Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" sx={{ color: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.9)' }}>
                Impuestos (10%)
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: (theme) => theme.palette.mode === 'dark' ? '#fff' : '#fff' }}>
                ${taxes.toLocaleString()}
              </Typography>
            </Stack>

            <Divider sx={{ borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)' }} />

            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body1" sx={{ fontWeight: 700, color: (theme) => theme.palette.mode === 'dark' ? '#fff' : '#fff' }}>
                Total
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 900, color: (theme) => theme.palette.mode === 'dark' ? '#fff' : '#fff' }}>
                ${total.toLocaleString()}
              </Typography>
            </Stack>
          </Stack>
        </Box>
      </Collapse>
    </Box>
  );
};

export default PriceBreakdown;
