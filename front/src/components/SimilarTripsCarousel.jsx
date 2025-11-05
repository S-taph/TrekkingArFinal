import React from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import { TripCard } from './TripCard';
import useSimilarTrips from '../hooks/useSimilarTrips';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';

/**
 * SimilarTripsCarousel - Carrusel de viajes similares
 * @param {Object} props
 * @param {Number} props.viajeId - ID del viaje actual
 * @param {Number} props.limit - Cantidad de viajes a mostrar (default: 6)
 */
const SimilarTripsCarousel = ({ viajeId, limit = 6 }) => {
  const { trips, loading, error } = useSimilarTrips(viajeId, limit);

  // No mostrar nada si está cargando inicialmente
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // No mostrar nada si hay error
  if (error) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        No se pudieron cargar los viajes similares
      </Alert>
    );
  }

  // No mostrar nada si no hay viajes similares
  if (!trips || trips.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mt: 6 }}>
      {/* Título */}
      <Typography
        variant="h5"
        gutterBottom
        sx={{
          fontWeight: 700,
          mb: 3,
          textAlign: 'center',
        }}
      >
        Si te gustó este viaje, también te puede interesar...
      </Typography>

      {/* Carrusel */}
      <Box
        sx={{
          position: 'relative',
          px: { xs: '50px', sm: '60px' }, // Padding horizontal para dar espacio a las flechas
          '& .swiper': {
            paddingBottom: '20px',
          },
          '& .swiper-button-prev, & .swiper-button-next': {
            color: 'primary.main',
            backgroundColor: 'background.paper',
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            boxShadow: 2,
            '&:after': {
              fontSize: '20px',
              fontWeight: 'bold',
            },
            '&.swiper-button-disabled': {
              opacity: 0.3,
            },
            '&:hover': {
              backgroundColor: 'primary.main',
              color: 'white',
            },
            transition: 'all 0.2s ease',
          },
          '& .swiper-button-prev': {
            left: { xs: '0px', sm: '5px' },
          },
          '& .swiper-button-next': {
            right: { xs: '0px', sm: '5px' },
          },
        }}
      >
        <Swiper
          modules={[Navigation, Autoplay]}
          spaceBetween={24}
          slidesPerView={1}
          breakpoints={{
            640: {
              slidesPerView: 2,
              spaceBetween: 20,
            },
            1024: {
              slidesPerView: 3,
              spaceBetween: 24,
            },
          }}
          navigation
          autoplay={{
            delay: 4000,
            disableOnInteraction: true,
            pauseOnMouseEnter: true,
          }}
          loop={trips.length > 3}
        >
          {trips.map((trip) => (
            <SwiperSlide key={trip.id_viaje}>
              <TripCard trip={trip} />
            </SwiperSlide>
          ))}
        </Swiper>
      </Box>
    </Box>
  );
};

export default SimilarTripsCarousel;
