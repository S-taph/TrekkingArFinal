import React, { useEffect } from 'react';
import { Modal, Box, IconButton, Typography } from '@mui/material';
import { Close, NavigateBefore, NavigateNext } from '@mui/icons-material';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Keyboard, Zoom } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/zoom';

/**
 * ImageLightbox - Modal fullscreen para ver galería de imágenes
 * @param {Object} props
 * @param {Boolean} props.open - Estado del modal
 * @param {Function} props.onClose - Callback al cerrar
 * @param {Array} props.images - Array de URLs de imágenes
 * @param {Number} props.initialIndex - Índice inicial a mostrar
 * @param {String} props.title - Título para descripción
 */
const ImageLightbox = ({
  open,
  onClose,
  images = [],
  initialIndex = 0,
  title = ''
}) => {

  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  // Cerrar con tecla ESC
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (open) {
      window.addEventListener('keydown', handleEsc);
    }

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [open, onClose]);

  if (!open || images.length === 0) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{
        zIndex: 9999,
      }}
      aria-labelledby="image-gallery-modal"
      aria-describedby="fullscreen-image-gallery"
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.95)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header con título y botón cerrar */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 2,
            zIndex: 10,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: 'white',
              fontWeight: 600,
              fontSize: { xs: '1rem', sm: '1.25rem' },
            }}
          >
            {title}
          </Typography>
          <IconButton
            onClick={onClose}
            sx={{
              color: 'white',
              backgroundColor: 'rgba(255,255,255,0.1)',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.2)',
              }
            }}
            aria-label="Cerrar galería"
          >
            <Close />
          </IconButton>
        </Box>

        {/* Swiper Gallery */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: { xs: 1, sm: 2 },
            overflow: 'hidden',
          }}
        >
          <Swiper
            modules={[Navigation, Pagination, Keyboard, Zoom]}
            navigation={{
              prevEl: '.swiper-button-prev-custom',
              nextEl: '.swiper-button-next-custom',
            }}
            pagination={{
              type: 'fraction',
              el: '.swiper-pagination-custom',
            }}
            keyboard={{
              enabled: true,
              onlyInViewport: false,
            }}
            zoom={{
              maxRatio: 3,
              minRatio: 1,
            }}
            initialSlide={initialIndex}
            loop={images.length > 1}
            spaceBetween={20}
            style={{
              width: '100%',
              height: '100%',
            }}
          >
            {images.map((image, index) => (
              <SwiperSlide key={index}>
                <Box
                  sx={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  className="swiper-zoom-container"
                >
                  <Box
                    component="img"
                    src={image}
                    alt={`${title} - Imagen ${index + 1}`}
                    loading="lazy"
                    sx={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain',
                      userSelect: 'none',
                    }}
                  />
                </Box>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Custom Navigation Buttons */}
          {images.length > 1 && (
            <>
              <IconButton
                className="swiper-button-prev-custom"
                sx={{
                  position: 'absolute',
                  left: { xs: 8, sm: 24 },
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 10,
                  color: 'rgba(0,0,0,0.87)',
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  width: { xs: 40, sm: 56 },
                  height: { xs: 40, sm: 56 },
                  '&:hover': {
                    backgroundColor: 'white',
                    transform: 'translateY(-50%) scale(1.1)',
                  },
                  transition: 'all 0.2s ease',
                  '&.swiper-button-disabled': {
                    opacity: 0.3,
                  }
                }}
                aria-label="Imagen anterior"
              >
                <NavigateBefore fontSize="large" />
              </IconButton>

              <IconButton
                className="swiper-button-next-custom"
                sx={{
                  position: 'absolute',
                  right: { xs: 8, sm: 24 },
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 10,
                  color: 'rgba(0,0,0,0.87)',
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  width: { xs: 40, sm: 56 },
                  height: { xs: 40, sm: 56 },
                  '&:hover': {
                    backgroundColor: 'white',
                    transform: 'translateY(-50%) scale(1.1)',
                  },
                  transition: 'all 0.2s ease',
                  '&.swiper-button-disabled': {
                    opacity: 0.3,
                  }
                }}
                aria-label="Imagen siguiente"
              >
                <NavigateNext fontSize="large" />
              </IconButton>
            </>
          )}
        </Box>

        {/* Pagination (contador de imágenes) */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            padding: 2,
            zIndex: 10,
          }}
        >
          <Box
            className="swiper-pagination-custom"
            sx={{
              color: 'white',
              fontSize: '1rem',
              fontWeight: 600,
              backgroundColor: 'rgba(0,0,0,0.5)',
              padding: '8px 16px',
              borderRadius: 999,
              backdropFilter: 'blur(10px)',
            }}
          />
        </Box>

        {/* Instrucciones */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 80,
            left: '50%',
            transform: 'translateX(-50%)',
            display: { xs: 'none', sm: 'block' },
            textAlign: 'center',
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: 'rgba(255,255,255,0.6)',
              backgroundColor: 'rgba(0,0,0,0.5)',
              padding: '4px 12px',
              borderRadius: 999,
              backdropFilter: 'blur(10px)',
            }}
          >
            Usa las flechas del teclado o haz clic en las flechas para navegar • Haz clic en la imagen para zoom
          </Typography>
        </Box>
      </Box>
    </Modal>
  );
};

export default ImageLightbox;
