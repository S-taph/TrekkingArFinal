
"use client"

import { useState, useEffect } from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Button from "@mui/material/Button"
import IconButton from "@mui/material/IconButton"
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos"
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos"

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const slides = [
    {
      image: "../public/banner3.jpg",
      title: "VIAJÁ SEGURO",
      subtitle: "CON GUÍAS DE CONFIANZA",
      description: "Descubre aventuras únicas con nuestros guías expertos",
    },
    {
      image: "../public/banner2.jpg",
      title: "EXPLORA LA NATURALEZA",
      subtitle: "EXPERIENCIAS INOLVIDABLES",
      description: "Conecta con la naturaleza en cada paso del camino",
    },
    {
      image: "../public/banner1.jpg",
      title: "AVENTURAS ÉPICAS",
      subtitle: "PARA TODOS LOS NIVELES",
      description: "Desde principiantes hasta expertos, tenemos tu aventura ideal",
    },
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [slides.length])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: 0,
        padding: 0,
        top: 0,
      }}
    >
      {slides.map((slide, index) => (
        <Box
          key={index}
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundImage: `url(${slide.image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            imageRendering: "crisp-edges",
            WebkitImageRendering: "crisp-edges",
            MozImageRendering: "crisp-edges",
            msImageRendering: "crisp-edges",
            opacity: index === currentSlide ? 1 : 0,
            transition: "opacity 1s ease-in-out",
            zIndex: 1,
            margin: 0,
            padding: 0,
          }}
        />
      ))}

      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.4)",
          zIndex: 2,
        }}
      />

      <Box
        sx={{
          position: "relative",
          zIndex: 3,
          textAlign: "center",
          color: "white",
          maxWidth: "800px",
          px: 3,
          pt: 8, // Espacio para el header fijo
        }}
      >
        <Typography
          variant="h2"
          component="h1"
          sx={{
            fontFamily: "'Russo One', sans-serif",
            fontWeight: "bold",
            fontSize: { xs: "2.5rem", md: "4rem" },
            color: "#FFFFFF !important", // Forzar blanco puro
            textShadow: "0 4px 12px rgba(0,0,0,0.9), 0 2px 4px rgba(0,0,0,0.7)",
            mb: 1,
            lineHeight: 1.1,
          }}
        >
          {slides[currentSlide].title}
        </Typography>

        <Typography
          variant="h3"
          component="h2"
          sx={{
            fontFamily: "'Russo One', sans-serif",
            fontWeight: "bold",
            fontSize: { xs: "1.8rem", md: "2.5rem" },
            color: "#FFFFFF !important", // Forzar blanco puro
            textShadow: "0 4px 12px rgba(0,0,0,0.9), 0 2px 4px rgba(0,0,0,0.7)",
            mb: 3,
            lineHeight: 1.1,
          }}
        >
          {slides[currentSlide].subtitle}
        </Typography>

        <Typography
          variant="h6"
          sx={{
            fontSize: { xs: "1rem", md: "1.2rem" },
            color: "#FFFFFF !important", // Forzar blanco puro
            textShadow: "0 3px 8px rgba(0,0,0,0.9), 0 1px 3px rgba(0,0,0,0.7)",
            mb: 4,
            fontWeight: 400,
          }}
        >
          {slides[currentSlide].description}
        </Typography>

        <Button
          variant="contained"
          size="large"
          sx={{
            bgcolor: "#ff6b35",
            color: "white",
            px: 4,
            py: 1.5,
            fontSize: "1.1rem",
            fontWeight: "bold",
            textTransform: "none",
            borderRadius: 2,
            boxShadow: "0 4px 12px rgba(255, 107, 53, 0.4)",
            "&:hover": {
              bgcolor: "#e55a2b",
              boxShadow: "0 6px 16px rgba(255, 107, 53, 0.6)",
            },
          }}
        >
          Explorar Aventuras
        </Button>
      </Box>

      <IconButton
        onClick={prevSlide}
        sx={{
          position: "absolute",
          left: 20,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 4,
          color: "white",
          backgroundColor: "rgba(0, 0, 0, 0.3)",
          "&:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          },
        }}
      >
        <ArrowBackIosIcon />
      </IconButton>

      <IconButton
        onClick={nextSlide}
        sx={{
          position: "absolute",
          right: 20,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 4,
          color: "white",
          backgroundColor: "rgba(0, 0, 0, 0.3)",
          "&:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          },
        }}
      >
        <ArrowForwardIosIcon />
      </IconButton>

      <Box
        sx={{
          position: "absolute",
          bottom: 30,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 4,
          display: "flex",
          gap: 1,
        }}
      >
        {slides.map((_, index) => (
          <Box
            key={index}
            onClick={() => setCurrentSlide(index)}
            sx={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              backgroundColor: index === currentSlide ? "white" : "rgba(255, 255, 255, 0.5)",
              cursor: "pointer",
              transition: "all 0.3s ease",
              "&:hover": {
                backgroundColor: "white",
              },
            }}
          />
        ))}
      </Box>
    </Box>
  )
}
