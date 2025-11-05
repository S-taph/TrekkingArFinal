import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Container, Typography, Button, CircularProgress, Alert } from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';
import CancelIcon from '@mui/icons-material/Cancel';

function PaymentFailure() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [paymentInfo, setPaymentInfo] = useState(null);

  useEffect(() => {
    // Extraer parámetros de Mercado Pago
    const paymentId = searchParams.get('payment_id');
    const status = searchParams.get('status');
    const externalReference = searchParams.get('external_reference');
    const statusDetail = searchParams.get('status_detail');

    console.log('Payment failure params:', {
      paymentId,
      status,
      externalReference,
      statusDetail,
    });

    setPaymentInfo({
      paymentId,
      status,
      externalReference,
      statusDetail,
    });

    setLoading(false);
  }, [searchParams]);

  const getErrorMessage = () => {
    if (!paymentInfo || !paymentInfo.statusDetail) {
      return 'Hubo un problema al procesar tu pago. Por favor, intenta nuevamente.';
    }

    const errorMessages = {
      cc_rejected_insufficient_amount: 'Fondos insuficientes en tu tarjeta.',
      cc_rejected_bad_filled_card_number: 'Número de tarjeta inválido.',
      cc_rejected_bad_filled_date: 'Fecha de vencimiento inválida.',
      cc_rejected_bad_filled_security_code: 'Código de seguridad inválido.',
      cc_rejected_call_for_authorize: 'Debes autorizar el pago con tu banco.',
      cc_rejected_card_disabled: 'Tu tarjeta está deshabilitada.',
      cc_rejected_duplicated_payment: 'Ya realizaste un pago similar recientemente.',
      cc_rejected_high_risk: 'Pago rechazado por motivos de seguridad.',
      cc_rejected_max_attempts: 'Superaste el límite de intentos permitidos.',
      cc_rejected_other_reason: 'Tu tarjeta rechazó el pago.',
    };

    return errorMessages[paymentInfo.statusDetail] || 'Tu pago fue rechazado. Por favor, intenta con otro método de pago.';
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
        {paymentInfo?.status === 'rejected' ? (
          <CancelIcon sx={{ fontSize: 80, color: 'error.main' }} />
        ) : (
          <ErrorIcon sx={{ fontSize: 80, color: 'error.main' }} />
        )}

        <Typography variant="h4" sx={{ mt: 3, mb: 2, fontWeight: 'bold' }}>
          Pago No Procesado
        </Typography>

        <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
          {getErrorMessage()}
        </Typography>

        {paymentInfo?.externalReference && (
          <Alert severity="info" sx={{ mb: 3, width: '100%' }}>
            <Typography variant="body2">
              <strong>Número de Compra:</strong> {paymentInfo.externalReference}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Tu reserva aún está disponible. Puedes intentar pagar nuevamente desde "Mis Reservas".
            </Typography>
          </Alert>
        )}

        <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/mis-reservas')}
          >
            Intentar Nuevamente
          </Button>
          <Button variant="outlined" onClick={() => navigate('/')}>
            Volver al Inicio
          </Button>
        </Box>

        <Alert severity="warning" sx={{ mt: 3, width: '100%' }}>
          <Typography variant="body2">
            <strong>¿Necesitas ayuda?</strong>
          </Typography>
          <Typography variant="body2">
            Si sigues teniendo problemas, contáctanos por WhatsApp o email.
          </Typography>
        </Alert>
      </Box>
    </Container>
  );
}

export default PaymentFailure;
