import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Container, Typography, Button, CircularProgress, Alert } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';

function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [paymentInfo, setPaymentInfo] = useState(null);

  useEffect(() => {
    // Extraer parámetros de Mercado Pago
    const paymentId = searchParams.get('payment_id');
    const status = searchParams.get('status');
    const externalReference = searchParams.get('external_reference');
    const merchantOrderId = searchParams.get('merchant_order_id');

    console.log('Payment callback params:', {
      paymentId,
      status,
      externalReference,
      merchantOrderId,
    });

    setPaymentInfo({
      paymentId,
      status,
      externalReference,
      merchantOrderId,
    });

    setLoading(false);
  }, [searchParams]);

  const getStatusIcon = () => {
    if (!paymentInfo) return null;

    switch (paymentInfo.status) {
      case 'approved':
        return <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main' }} />;
      case 'pending':
      case 'in_process':
        return <HourglassEmptyIcon sx={{ fontSize: 80, color: 'warning.main' }} />;
      default:
        return <ErrorIcon sx={{ fontSize: 80, color: 'error.main' }} />;
    }
  };

  const getStatusMessage = () => {
    if (!paymentInfo) return null;

    switch (paymentInfo.status) {
      case 'approved':
        return {
          title: 'Pago Exitoso',
          message: 'Tu pago ha sido procesado correctamente. Tu reserva está confirmada.',
          color: 'success',
        };
      case 'pending':
        return {
          title: 'Pago Pendiente',
          message: 'Tu pago está siendo procesado. Te notificaremos cuando se confirme.',
          color: 'warning',
        };
      case 'in_process':
        return {
          title: 'Pago en Proceso',
          message: 'Tu pago está siendo verificado. Este proceso puede tomar unos minutos.',
          color: 'info',
        };
      default:
        return {
          title: 'Pago Rechazado',
          message: 'Hubo un problema con tu pago. Por favor, intenta nuevamente.',
          color: 'error',
        };
    }
  };

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ textAlign: 'center', mt: 8 }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Verificando pago...
        </Typography>
      </Container>
    );
  }

  const statusMessage = getStatusMessage();

  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 8 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          p: 4,
          borderRadius: 2,
          boxShadow: 3,
          bgcolor: 'background.paper',
        }}
      >
        {getStatusIcon()}

        <Typography variant="h4" sx={{ mt: 3, mb: 2, fontWeight: 'bold' }}>
          {statusMessage.title}
        </Typography>

        <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
          {statusMessage.message}
        </Typography>

        {paymentInfo.externalReference && (
          <Alert severity="info" sx={{ mb: 3, width: '100%' }}>
            <Typography variant="body2">
              <strong>Número de Compra:</strong> {paymentInfo.externalReference}
            </Typography>
            {paymentInfo.paymentId && (
              <Typography variant="body2">
                <strong>ID de Pago:</strong> {paymentInfo.paymentId}
              </Typography>
            )}
          </Alert>
        )}

        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/mis-reservas')}
          >
            Ver Mis Reservas
          </Button>
          <Button variant="outlined" onClick={() => navigate('/')}>
            Volver al Inicio
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

export default PaymentSuccess;
