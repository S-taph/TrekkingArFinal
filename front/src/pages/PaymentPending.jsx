import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Container, Typography, Button, CircularProgress, Alert } from '@mui/material';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';

function PaymentPending() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [paymentInfo, setPaymentInfo] = useState(null);

  useEffect(() => {
    // Extraer parámetros de Mercado Pago
    const paymentId = searchParams.get('payment_id');
    const status = searchParams.get('status');
    const externalReference = searchParams.get('external_reference');
    const paymentType = searchParams.get('payment_type_id');

    console.log('Payment pending params:', {
      paymentId,
      status,
      externalReference,
      paymentType,
    });

    setPaymentInfo({
      paymentId,
      status,
      externalReference,
      paymentType,
    });

    setLoading(false);
  }, [searchParams]);

  const getPendingMessage = () => {
    if (!paymentInfo || !paymentInfo.paymentType) {
      return 'Tu pago está siendo procesado. Te notificaremos cuando se confirme.';
    }

    const messages = {
      ticket: 'Recuerda pagar en el punto de pago antes de la fecha de vencimiento.',
      atm: 'Recuerda completar el pago en el cajero automático.',
      bank_transfer: 'Tu transferencia bancaria está siendo procesada.',
      credit_card: 'Tu pago con tarjeta está siendo verificado.',
      debit_card: 'Tu pago con tarjeta de débito está siendo procesado.',
    };

    return messages[paymentInfo.paymentType] || 'Tu pago está siendo procesado. Te notificaremos cuando se confirme.';
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
        <HourglassEmptyIcon sx={{ fontSize: 80, color: 'warning.main' }} />

        <Typography variant="h4" sx={{ mt: 3, mb: 2, fontWeight: 'bold' }}>
          Pago Pendiente
        </Typography>

        <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
          {getPendingMessage()}
        </Typography>

        {paymentInfo?.externalReference && (
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

        <Alert severity="warning" sx={{ mb: 3, width: '100%' }}>
          <Typography variant="body2">
            <strong>Importante:</strong>
          </Typography>
          <Typography variant="body2">
            Tu reserva quedará confirmada una vez que el pago sea acreditado.
            Te enviaremos un email cuando esto suceda.
          </Typography>
        </Alert>

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

export default PaymentPending;
