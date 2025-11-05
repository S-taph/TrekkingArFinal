import { useState } from 'react';
import { Button, CircularProgress, Alert, Box } from '@mui/material';
import PaymentIcon from '@mui/icons-material/Payment';
import { pagosAPI } from '../services/api';

/**
 * Componente para integrar Mercado Pago en el checkout
 * Redirige al usuario al checkout de Mercado Pago
 */
function MercadoPagoButton({ compraId, onError, disabled = false }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePagar = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Creando preferencia de Mercado Pago para compra:', compraId);

      // Crear preferencia de pago en Mercado Pago
      const response = await pagosAPI.crearPreferenciaMercadoPago(compraId);

      if (response.success && response.data.init_point) {
        console.log('Preferencia creada, redirigiendo a Mercado Pago...');

        // Redirigir al checkout de Mercado Pago
        window.location.href = response.data.init_point;
      } else {
        throw new Error('No se pudo crear la preferencia de pago');
      }
    } catch (err) {
      console.error('Error al crear preferencia de Mercado Pago:', err);
      const errorMessage = err.message || 'Error al procesar el pago con Mercado Pago';
      setError(errorMessage);

      if (onError) {
        onError(errorMessage);
      }

      setLoading(false);
    }
  };

  return (
    <Box>
      <Button
        variant="contained"
        color="primary"
        size="large"
        fullWidth
        onClick={handlePagar}
        disabled={disabled || loading}
        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PaymentIcon />}
        sx={{
          py: 1.5,
          fontSize: '1.1rem',
          fontWeight: 'bold',
          background: 'linear-gradient(45deg, #009ee3 30%, #00b0ff 90%)',
          '&:hover': {
            background: 'linear-gradient(45deg, #0082c3 30%, #0090df 90%)',
          },
        }}
      >
        {loading ? 'Procesando...' : 'Pagar con Mercado Pago'}
      </Button>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
}

export default MercadoPagoButton;
