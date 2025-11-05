import {
  Box,
  Typography,
  Container,
  Paper,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import PaymentsIcon from '@mui/icons-material/Payments';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const MediosPago = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
    rootMargin: '-50px'
  });

  const tarjetas = [
    {
      title: 'Todos los Medios de Pago',
      subtitle: 'Mediante Mercado Pago',
      icon: <CreditCardIcon sx={{ fontSize: 48, color: 'white' }} />,
      gradient: 'linear-gradient(135deg, #00b4ff 0%, #0077ff 100%)'
    },
    {
      title: 'Pagá en 3 y 6 Cuotas fijas',
      subtitle: 'Cuota Simple',
      icon: <PaymentsIcon sx={{ fontSize: 48, color: 'white' }} />,
      gradient: 'linear-gradient(135deg, #8a00ff 0%, #e300ff 100%)'
    },
    {
      title: '4 Cuotas Sin Interés',
      subtitle: 'Con Tarjeta Cordobesa',
      icon: <LocalAtmIcon sx={{ fontSize: 48, color: 'white' }} />,
      gradient: 'linear-gradient(135deg, #0f6b61 0%, #c28a00 100%)'
    }
  ];

  return (
    <Box
      ref={ref}
      sx={{
        bgcolor: 'background.default',
        py: { xs: 6, md: 8 },
      }}
    >
      <Container maxWidth="lg">
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          sx={{
            fontWeight: 'bold',
            mb: 6,
            color: 'text.primary'
          }}
        >
          Medios de Pago
        </Typography>

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 3,
            justifyContent: 'center',
            alignItems: 'stretch'
          }}
        >
          {tarjetas.map((tarjeta, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.6,
                delay: index * 0.15,
                ease: 'easeOut'
              }}
              style={{
                flex: 1,
                maxWidth: isMobile ? '100%' : '320px'
              }}
            >
              <Paper
                elevation={4}
                sx={{
                  height: '100%',
                  minHeight: '200px',
                  borderRadius: 3,
                  padding: 4,
                  background: tarjeta.gradient,
                  color: 'white',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 24px rgba(0,0,0,0.2)'
                  }
                }}
              >
                <Box sx={{ mb: 2 }}>
                  {tarjeta.icon}
                </Box>
                <Typography
                  variant="h6"
                  component="h3"
                  gutterBottom
                  sx={{
                    fontWeight: 700,
                    fontSize: isMobile ? '1.1rem' : '1.25rem',
                    lineHeight: 1.3
                  }}
                >
                  {tarjeta.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#000000',
                    fontSize: isMobile ? '0.875rem' : '1rem',
                    fontWeight: 600
                  }}
                >
                  {tarjeta.subtitle}
                </Typography>
              </Paper>
            </motion.div>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default MediosPago;
