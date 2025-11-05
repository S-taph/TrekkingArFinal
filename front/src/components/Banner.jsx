import 'swiper/css';
import 'swiper/css/pagination';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import Box from '@mui/material/Box';

const bannerImages = [
  '/banner1.jpg',
  '/banner2.jpg',
  '/banner3.jpg',
  '/banner4.jpg',
  '/banner5.jpg',
  '/banner6.jpg'
];

const Banner = () => (
  <Box sx={{ width: '100%', mt: 2 }}>
    <Swiper
      modules={[Autoplay, Pagination]}
      autoplay={{ delay: 3000 }}
      pagination={{ clickable: true }}
      loop
    >
    {bannerImages.map((src, idx) => (
    <SwiperSlide key={idx}>
        <img
        src={src}
        alt={`Slide ${idx + 1}`}
        style={{
            width: '100%',
            height: '350px',
            objectFit: 'cover',
            borderRadius: '8px'
        }}
        />
    </SwiperSlide>
    ))}

    </Swiper>
  </Box>
);

export default Banner;