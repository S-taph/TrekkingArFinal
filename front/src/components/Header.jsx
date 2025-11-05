"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useCart } from "../context/CartContext"
import { useTheme } from "../context/ThemeContext"
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Divider,
  Button,
  Badge,
  Stack,
  Menu,
  MenuItem,
  Avatar,
  Tooltip,
} from "@mui/material"
import { alpha } from "@mui/material/styles"
import MenuIcon from "@mui/icons-material/Menu"
import HomeIcon from "@mui/icons-material/Home"
import HikingIcon from "@mui/icons-material/Hiking"
import TourIcon from "@mui/icons-material/Tour"
import BackpackIcon from "@mui/icons-material/Backpack"
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary"
import ArticleIcon from "@mui/icons-material/Article"
import InfoIcon from "@mui/icons-material/Info"
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart"
import LoginIcon from "@mui/icons-material/Login"
import AccountCircleIcon from "@mui/icons-material/AccountCircle"
import LogoutIcon from "@mui/icons-material/Logout"
import ContactMailIcon from "@mui/icons-material/ContactMail"
import Brightness4Icon from "@mui/icons-material/Brightness4"
import Brightness7Icon from "@mui/icons-material/Brightness7"
import NotificationsIcon from "@mui/icons-material/Notifications"
import DashboardIcon from "@mui/icons-material/Dashboard"
import { CartDrawer } from "./CartDrawer"
import { NotificationCenter } from "./NotificationCenter"

export default function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const { itemCount } = useCart()
  const { mode, toggleTheme } = useTheme()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState(null)
  const [scrolled, setScrolled] = useState(false)
  const [hovered, setHovered] = useState(false)

  const isAdmin = user?.rol === "admin"
  const isInAdminPanel = location.pathname.startsWith("/admin")
  const isHomePage = location.pathname === "/"

  // Detectar scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }

    if (isHomePage) {
      window.addEventListener("scroll", handleScroll)
      return () => window.removeEventListener("scroll", handleScroll)
    }
  }, [isHomePage])

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open)
  }

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = async () => {
    await logout()
    handleMenuClose()
    navigate("/")
  }

  const menuItems = [
    { text: "Inicio", icon: <HomeIcon />, path: "/" },
    { text: "Trekkings", icon: <HikingIcon />, path: "/catalogo" },
    { text: "Galería", icon: <PhotoLibraryIcon />, path: "/galeria" },
    { text: "Nosotros", icon: <InfoIcon />, path: "/nosotros" },
    { text: "Contacto", icon: <ContactMailIcon />, path: "/contacto" },
  ]

  // Determinar si el header debe ser sólido (con fondo)
  const isSolid = !isHomePage || scrolled || hovered

  // Determinar colores según estado
  const getHeaderColors = () => {
    if (isHomePage && !isSolid) {
      // Transparente en HOME sin scroll/hover
      return {
        bg: "transparent",
        textColor: "white",
        iconColor: "white",
        shadow: "none",
      }
    } else if (isHomePage && isSolid) {
      // Sólido en HOME con scroll/hover
      return {
        bg: mode === "dark" ? "rgba(18, 18, 18, 0.95)" : "rgba(255, 255, 255, 0.95)",
        textColor: mode === "dark" ? "white" : "#1a1a1a",
        iconColor: mode === "dark" ? "white" : "#1a1a1a",
        shadow: mode === "dark" ? "0 2px 8px rgba(0,0,0,0.5)" : "0 2px 8px rgba(0,0,0,0.1)",
      }
    } else {
      // Resto de páginas
      return {
        bg: mode === "dark" ? "#121212" : "#ffffff",
        textColor: mode === "dark" ? "white" : "#1a1a1a",
        iconColor: mode === "dark" ? "white" : "#1a1a1a",
        shadow: mode === "dark" ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(0,0,0,0.1)",
      }
    }
  }

  const colors = getHeaderColors()

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        onMouseEnter={() => isHomePage && setHovered(true)}
        onMouseLeave={() => isHomePage && setHovered(false)}
        sx={{
          top: 0,
          left: 0,
          right: 0,
          backgroundColor: colors.bg,
          boxShadow: colors.shadow,
          zIndex: (theme) => theme.zIndex.appBar,
          padding: "0 1rem",
          margin: 0,
          backdropFilter: isSolid ? "blur(10px)" : "none",
          transition: "all 0.3s ease-in-out",
          border: "none",
          borderBottom: "none",
        }}
      >
        <Toolbar sx={{ display: "flex", alignItems: "center" }}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={toggleDrawer(true)}
            sx={{
              mr: 2,
              display: { md: "none" },
              color: colors.iconColor,
              backgroundColor: mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
              "&:hover": {
                backgroundColor: mode === "dark" ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)",
              },
            }}
          >
            <MenuIcon />
          </IconButton>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              flexGrow: 1,
              "&:hover": {
                opacity: 0.9,
              },
            }}
            onClick={() => navigate("/")}
          >
            <Box
              component="img"
              src="/mountain.png"
              alt="Logo TrekkingAr"
              sx={{
                height: 40,
                width: "auto",
                marginRight: 2,
                userSelect: "none",
                filter: isHomePage && !isSolid
                  ? "drop-shadow(0 2px 4px rgba(0,0,0,0.5))"
                  : mode === "dark"
                    ? "drop-shadow(0 2px 4px rgba(255,255,255,0.1))"
                    : "drop-shadow(0 2px 4px rgba(0,0,0,0.2))",
                transition: "filter 0.3s ease-in-out",
              }}
            />

            <Typography
              variant="h6"
              component="div"
              sx={{
                fontFamily: "'Russo One', sans-serif",
                fontWeight: "bold",
                letterSpacing: 1,
                color: colors.textColor,
                textShadow: isHomePage && !isSolid ? "0 2px 4px rgba(0,0,0,0.5)" : "none",
                transition: "all 0.3s ease-in-out",
              }}
            >
              TrekkingAr
            </Typography>
          </Box>

          {/* Iconos para móvil */}
          <Box sx={{ display: { xs: "flex", md: "none" }, alignItems: "center", gap: 0.5 }}>
            {user && (
              <Tooltip title="Carrito">
                <IconButton
                  onClick={() => setCartOpen(true)}
                  sx={{
                    color: colors.iconColor,
                    backgroundColor: mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
                    "&:hover": {
                      backgroundColor: mode === "dark" ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)",
                    },
                  }}
                >
                  <Badge badgeContent={itemCount} color="error">
                    <ShoppingCartIcon />
                  </Badge>
                </IconButton>
              </Tooltip>
            )}

            {user ? (
              <Tooltip title="Cuenta">
                <IconButton
                  onClick={handleMenuOpen}
                  sx={{
                    backgroundColor: mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
                    "&:hover": {
                      backgroundColor: mode === "dark" ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)",
                    },
                  }}
                >
                  <Avatar
                    src={user?.avatar}
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: "secondary.main",
                      color: "text.primary",
                    }}
                  >
                    {user.nombre?.charAt(0).toUpperCase() || "U"}
                  </Avatar>
                </IconButton>
              </Tooltip>
            ) : (
              <IconButton
                onClick={() => navigate("/login")}
                sx={{
                  color: colors.iconColor,
                  backgroundColor: mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
                  "&:hover": {
                    backgroundColor: mode === "dark" ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)",
                  },
                }}
              >
                <LoginIcon />
              </IconButton>
            )}
          </Box>

          <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 1 }}>
            <Stack direction="row" spacing={1}>
              {menuItems.map((item) => (
                <Button
                  key={item.text}
                  startIcon={item.icon}
                  onClick={() => navigate(item.path)}
                  sx={{
                    textTransform: "none",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    px: 1.5,
                    color: colors.textColor,
                    textShadow: isHomePage && !isSolid ? "0 1px 2px rgba(0,0,0,0.5)" : "none",
                    transition: "all 0.3s ease-in-out",
                    "&:hover": {
                      bgcolor: mode === "dark"
                        ? "rgba(255, 255, 255, 0.1)"
                        : "rgba(0, 0, 0, 0.05)",
                    },
                  }}
                >
                  {item.text}
                </Button>
              ))}
            </Stack>

            {/* Toggle tema */}
            <Tooltip title={`Modo ${mode === "light" ? "oscuro" : "claro"}`}>
              <IconButton
                onClick={toggleTheme}
                sx={{
                  ml: 2,
                  color: colors.iconColor,
                  transition: "all 0.3s ease-in-out",
                  "&:hover": {
                    bgcolor: mode === "dark"
                      ? "rgba(255, 255, 255, 0.1)"
                      : "rgba(0, 0, 0, 0.05)",
                  },
                }}
              >
                {mode === "light" ? <Brightness4Icon /> : <Brightness7Icon />}
              </IconButton>
            </Tooltip>

            {user && (
              <>
                {/* Carrito */}
                <Tooltip title="Carrito">
                  <IconButton
                    onClick={() => setCartOpen(true)}
                    sx={{
                      color: colors.iconColor,
                      transition: "all 0.3s ease-in-out",
                      "&:hover": {
                        bgcolor: mode === "dark"
                          ? "rgba(255, 255, 255, 0.1)"
                          : "rgba(0, 0, 0, 0.05)",
                      },
                    }}
                  >
                    <Badge badgeContent={itemCount} color="error">
                      <ShoppingCartIcon />
                    </Badge>
                  </IconButton>
                </Tooltip>

                {/* Notificaciones (solo admin en panel de administración) */}
                {isAdmin && isInAdminPanel && (
                  <Tooltip title="Notificaciones">
                    <IconButton
                      onClick={() => setNotificationsOpen(true)}
                      sx={{
                        color: colors.iconColor,
                        transition: "all 0.3s ease-in-out",
                        "&:hover": {
                          bgcolor: mode === "dark"
                            ? "rgba(255, 255, 255, 0.1)"
                            : "rgba(0, 0, 0, 0.05)",
                        },
                      }}
                    >
                      <NotificationsIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </>
            )}

            {user ? (
              <>
                <Tooltip title="Cuenta">
                  <IconButton
                    onClick={handleMenuOpen}
                    sx={{
                      ml: 1,
                    }}
                  >
                    <Avatar
                      src={user?.avatar}
                      sx={{
                        width: 36,
                        height: 36,
                        bgcolor: "secondary.main",
                        color: "text.primary",
                      }}
                    >
                      {user.nombre?.charAt(0).toUpperCase() || "U"}
                    </Avatar>
                  </IconButton>
                </Tooltip>
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                  <MenuItem disabled>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {user.nombre} {user.apellido}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {user.email}
                      </Typography>
                    </Box>
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={() => { handleMenuClose(); navigate("/perfil"); }}>
                    <AccountCircleIcon sx={{ mr: 1 }} fontSize="small" />
                    Mi Perfil
                  </MenuItem>
                  <MenuItem onClick={() => { handleMenuClose(); navigate("/mis-reservas"); }}>
                    Mis Reservas
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={handleLogout}>
                    <LogoutIcon sx={{ mr: 1 }} fontSize="small" />
                    Cerrar Sesión
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Button
                startIcon={<LoginIcon />}
                onClick={() => navigate("/login")}
                sx={{
                  textTransform: "none",
                  fontWeight: 500,
                  ml: 1,
                  color: colors.textColor,
                  border: mode === "dark"
                    ? "1px solid rgba(255, 255, 255, 0.3)"
                    : "1px solid rgba(0, 0, 0, 0.2)",
                  textShadow: isHomePage && !isSolid ? "0 1px 2px rgba(0,0,0,0.5)" : "none",
                  transition: "all 0.3s ease-in-out",
                  "&:hover": {
                    bgcolor: mode === "dark"
                      ? "rgba(255, 255, 255, 0.1)"
                      : "rgba(0, 0, 0, 0.05)",
                    borderColor: mode === "dark"
                      ? "rgba(255, 255, 255, 0.5)"
                      : "rgba(0, 0, 0, 0.3)",
                  },
                }}
              >
                Iniciar Sesión
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        <Box sx={{ width: 280 }} role="presentation">
          <Box
            sx={{
              bgcolor: "primary.main",
              color: "white",
              p: 2,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Box component="img" src="/mountain.png" alt="Logo" sx={{ height: 32, width: "auto" }} />
            <Typography variant="h6" sx={{ fontFamily: "'Russo One', sans-serif" }}>
              TrekkingAr
            </Typography>
          </Box>

          <List sx={{ pt: 0 }}>
            {menuItems.map((item) => (
              <ListItemButton
                key={item.text}
                onClick={() => {
                  navigate(item.path)
                  setDrawerOpen(false)
                }}
                sx={{
                  py: 1.5,
                  "&:hover": {
                    bgcolor: "primary.light",
                    color: "white",
                  },
                }}
              >
                <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: 500,
                    fontSize: "0.95rem",
                  }}
                />
              </ListItemButton>
            ))}
          </List>

          <Divider />

          {/* Toggle de tema en drawer móvil */}
          <Box sx={{ p: 2 }}>
            <ListItemButton
              onClick={toggleTheme}
              sx={{
                py: 1.5,
                borderRadius: 1,
                "&:hover": {
                  bgcolor: "primary.light",
                  color: "white",
                },
              }}
            >
              <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}>
                {mode === "light" ? <Brightness4Icon /> : <Brightness7Icon />}
              </ListItemIcon>
              <ListItemText
                primary={`Modo ${mode === "light" ? "oscuro" : "claro"}`}
                primaryTypographyProps={{
                  fontWeight: 500,
                  fontSize: "0.95rem",
                }}
              />
            </ListItemButton>
          </Box>

          <Divider />

          <Box sx={{ p: 2, bgcolor: "#f5f5f5", mt: "auto" }}>
            <Typography variant="body2" color="textSecondary" align="center">
              ¿Necesitas ayuda?
            </Typography>
            <Typography variant="body2" color="primary" align="center" sx={{ fontWeight: "bold" }}>
              +54 294 442-8765
            </Typography>
          </Box>
        </Box>
      </Drawer>

      {/* Cart Drawer */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      {/* Notification Center (solo para admins en panel de administración) */}
      {isAdmin && isInAdminPanel && (
        <NotificationCenter open={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
      )}
    </>
  )
}
