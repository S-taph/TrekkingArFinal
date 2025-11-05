import { useState, useEffect } from "react"
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Avatar,
  Paper,
  Divider,
  Stack,
  Chip,
  CircularProgress,
} from "@mui/material"
import {
  Hiking as HikingIcon,
  EmojiEvents as TrophyIcon,
  Favorite as HeartIcon,
  Public as GlobeIcon,
  Groups as GroupsIcon,
  VerifiedUser as VerifiedIcon,
} from "@mui/icons-material"
import Header from "../components/Header"
import Footer from "../components/Footer"
import { guiasAPI } from "../services/api"

/**
 * NosotrosPage - Página "Sobre Nosotros"
 * Muestra información de la empresa y el equipo de guías
 */
export default function NosotrosPage() {
  const [guias, setGuias] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.title = "Nosotros - TrekkingAR"
    fetchGuias()
  }, [])

  const fetchGuias = async () => {
    try {
      setLoading(true)
      const response = await guiasAPI.getGuias({ activo: true })

      if (response.success) {
        // Filtrar solo guías que tienen foto de perfil subida (no de Google OAuth)
        const guiasConFoto = (response.data.guias || []).filter((guia) => {
          const avatar = guia.usuario?.avatar
          // Solo mostrar guías con fotos subidas localmente (excluir fotos de Google)
          return avatar && avatar.includes('/uploads/avatars/')
        })
        setGuias(guiasConFoto)
      }
    } catch (error) {
      console.error("[NosotrosPage] Error cargando guías:", error)
    } finally {
      setLoading(false)
    }
  }

  const valores = [
    {
      icon: <HeartIcon sx={{ fontSize: 40 }} />,
      title: "Pasión por la Naturaleza",
      description: "Amamos las montañas y queremos compartir esa pasión contigo",
    },
    {
      icon: <VerifiedIcon sx={{ fontSize: 40 }} />,
      title: "Seguridad Primero",
      description: "Todos nuestros guías están certificados y capacitados",
    },
    {
      icon: <GroupsIcon sx={{ fontSize: 40 }} />,
      title: "Comunidad",
      description: "Creamos experiencias compartidas que duran toda la vida",
    },
    {
      icon: <GlobeIcon sx={{ fontSize: 40 }} />,
      title: "Sustentabilidad",
      description: "Respetamos y protegemos los espacios naturales que visitamos",
    },
  ]

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      <Header />

      {/* Hero Section */}
      <Box
        sx={{
          position: "relative",
          height: "400px",
          backgroundImage: "linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('/mountain-background.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mt: 8,
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            sx={{
              color: "white",
              fontWeight: 800,
              textAlign: "center",
              textTransform: "uppercase",
              letterSpacing: 3,
              textShadow: "0 4px 8px rgba(0,0,0,0.5)",
            }}
          >
            Sobre Nosotros
          </Typography>
          <Typography
            variant="h5"
            sx={{
              color: "white",
              textAlign: "center",
              mt: 2,
              textShadow: "0 2px 4px rgba(0,0,0,0.5)",
            }}
          >
            Conectando personas con la naturaleza desde 2015
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 8 }}>
        {/* Nuestra Historia */}
        <Paper elevation={3} sx={{ p: 4, mb: 6, borderRadius: 3 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              mb: 3,
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <HikingIcon color="primary" sx={{ fontSize: 40 }} />
            Nuestra Historia
          </Typography>
          <Typography variant="body1" paragraph sx={{ fontSize: "1.1rem", lineHeight: 1.8 }}>
            TrekkingAR nació en 2015 con una misión simple pero poderosa: llevar a las personas a descubrir
            la belleza natural de Argentina de una manera segura, responsable y memorable.
          </Typography>
          <Typography variant="body1" paragraph sx={{ fontSize: "1.1rem", lineHeight: 1.8 }}>
            Desde nuestros humildes comienzos con un pequeño grupo de amigos apasionados por el montañismo,
            hemos crecido hasta convertirnos en una de las empresas de trekking más confiables del país,
            llevando a más de 10,000 aventureros a explorar desde los glaciares patagónicos hasta las
            quebradas del noroeste.
          </Typography>
          <Typography variant="body1" sx={{ fontSize: "1.1rem", lineHeight: 1.8 }}>
            Hoy, seguimos comprometidos con ofrecer experiencias auténticas que respeten la naturaleza
            y fomenten una conexión profunda con el entorno.
          </Typography>
        </Paper>

        {/* Misión y Visión */}
        <Grid container spacing={4} sx={{ mb: 6 }}>
          <Grid item xs={12} md={6}>
            <Paper
              elevation={3}
              sx={{
                p: 4,
                height: "100%",
                borderRadius: 3,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                🎯 Nuestra Misión
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                Inspirar y guiar a las personas a explorar la naturaleza, promoviendo el turismo
                sustentable y creando recuerdos inolvidables en cada aventura.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper
              elevation={3}
              sx={{
                p: 4,
                height: "100%",
                borderRadius: 3,
                background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                color: "white",
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                🔭 Nuestra Visión
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                Ser la empresa líder en experiencias de trekking en Latinoamérica, reconocida por
                nuestra excelencia, compromiso ambiental y pasión por la aventura.
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Valores */}
        <Box sx={{ mb: 6 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              mb: 4,
              textAlign: "center",
              textTransform: "uppercase",
              letterSpacing: 2,
            }}
          >
            Nuestros Valores
          </Typography>
          <Grid container spacing={4}>
            {valores.map((valor, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 3,
                    height: "100%",
                    textAlign: "center",
                    borderRadius: 3,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-8px)",
                      boxShadow: 6,
                    },
                  }}
                >
                  <Box sx={{ color: "primary.main", mb: 2 }}>{valor.icon}</Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    {valor.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {valor.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Divider sx={{ my: 6 }} />

        {/* Equipo de Guías */}
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              mb: 4,
              textAlign: "center",
              textTransform: "uppercase",
              letterSpacing: 2,
            }}
          >
            Nuestro Equipo de Guías
          </Typography>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : guias.length > 0 ? (
            <Grid container spacing={4}>
              {guias.map((guia) => (
                <Grid item xs={12} sm={6} md={4} key={guia.id_guia}>
                  <Card
                    elevation={3}
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      borderRadius: 3,
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-8px)",
                        boxShadow: 8,
                      },
                    }}
                  >
                    <Box sx={{ position: "relative" }}>
                      <CardMedia
                        component="div"
                        sx={{
                          height: 200,
                          bgcolor: "primary.main",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Avatar
                          src={guia.usuario?.avatar}
                          alt={`${guia.usuario?.nombre} ${guia.usuario?.apellido}`}
                          sx={{
                            width: 120,
                            height: 120,
                            border: "4px solid white",
                            boxShadow: 3,
                            fontSize: "3rem",
                            bgcolor: "secondary.main",
                          }}
                        >
                          {guia.usuario?.nombre?.[0]}{guia.usuario?.apellido?.[0]}
                        </Avatar>
                      </CardMedia>
                      {guia.certificaciones && (
                        <Chip
                          icon={<VerifiedIcon />}
                          label="Certificado"
                          color="success"
                          size="small"
                          sx={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            fontWeight: 600,
                          }}
                        />
                      )}
                    </Box>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                        {guia.usuario?.nombre} {guia.usuario?.apellido}
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                        <Chip
                          label={`${guia.anos_experiencia || 0} años exp.`}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                        {guia.especialidad && (
                          <Chip
                            label={guia.especialidad}
                            size="small"
                            color="secondary"
                            variant="outlined"
                          />
                        )}
                      </Stack>
                      {guia.biografia && (
                        <Typography variant="body2" color="text.secondary">
                          {guia.biografia.substring(0, 150)}
                          {guia.biografia.length > 150 ? "..." : ""}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Paper sx={{ p: 4, textAlign: "center" }}>
              <Typography variant="body1" color="text.secondary">
                Información del equipo próximamente...
              </Typography>
            </Paper>
          )}
        </Box>

        {/* Estadísticas */}
        <Paper elevation={3} sx={{ p: 4, mt: 6, borderRadius: 3, bgcolor: "primary.main", color: "white" }}>
          <Grid container spacing={4} sx={{ textAlign: "center" }}>
            <Grid item xs={12} sm={3}>
              <TrophyIcon sx={{ fontSize: 50, mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                10+
              </Typography>
              <Typography variant="body1">Años de Experiencia</Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
              <GroupsIcon sx={{ fontSize: 50, mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                10,000+
              </Typography>
              <Typography variant="body1">Aventureros</Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
              <HikingIcon sx={{ fontSize: 50, mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                50+
              </Typography>
              <Typography variant="body1">Rutas Diferentes</Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
              <VerifiedIcon sx={{ fontSize: 50, mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                100%
              </Typography>
              <Typography variant="body1">Seguro y Certificado</Typography>
            </Grid>
          </Grid>
        </Paper>
      </Container>

      <Footer />
    </Box>
  )
}
