"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Container,
  Avatar,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Hiking as HikingIcon,
  PersonPin as GuideIcon,
  BookOnline as ReservasIcon,
  Logout as LogoutIcon,
  Email as EmailIcon,
  Campaign as CampaignIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { ThemeToggle } from "../ThemeToggle";

const drawerWidth = 240;

const menuItems = [
  { text: "Dashboard", icon: <DashboardIcon />, path: "/admin" },
  { text: "Usuarios", icon: <PeopleIcon />, path: "/admin/usuarios" },
  { text: "Viajes", icon: <HikingIcon />, path: "/admin/viajes" },
  { text: "Guías", icon: <GuideIcon />, path: "/admin/guias" },
  { text: "Reservas", icon: <ReservasIcon />, path: "/admin/reservas" },
  { text: "Suscriptores", icon: <EmailIcon />, path: "/admin/suscriptores" },
  { text: "Campañas Newsletter", icon: <CampaignIcon />, path: "/admin/campanias" },
];

export default function AdminLayout({ children, currentPath = "/admin", onNavigate }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const drawer = (
    <Box
      sx={(theme) => ({
        bgcolor: theme.palette.mode === "light" ? "#f5f5f5" : "#1E1E2F",
        color: theme.palette.mode === "light" ? "#333" : "#fff",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      })}
    >
      {/* HEADER DEL SIDEBAR */}
      <Box>
        <Toolbar>
          <Box
            display="flex"
            alignItems="center"
            gap={1}
            onClick={() => navigate("/")}
            sx={{
              cursor: "pointer",
              "&:hover": { opacity: 0.8 },
              transition: "opacity 0.2s",
            }}
          >
            <HikingIcon sx={{ color: "#90CAF9" }} />
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={(theme) => ({
                fontWeight: "bold",
                color: theme.palette.mode === "light" ? "#333" : "#fff"
              })}
            >
              TrekkingAR
            </Typography>
          </Box>
        </Toolbar>
        <Divider sx={(theme) => ({
          borderColor: theme.palette.mode === "light" ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)"
        })} />

        {/* MENÚ DE NAVEGACIÓN */}
        <List sx={{ mt: 1 }}>
          {menuItems.map((item) => {
            const selected = currentPath === item.path;
            return (
              <motion.div
                key={item.text}
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => onNavigate(item.path)}
                    sx={(theme) => ({
                      borderRadius: 2,
                      mx: 1,
                      my: 0.5,
                      color: selected
                        ? "#fff"
                        : theme.palette.mode === "light"
                          ? "#333"
                          : "rgba(255,255,255,0.8)",
                      backgroundColor: selected ? "#1976d2" : "transparent",
                      "&:hover": {
                        backgroundColor: selected
                          ? "#1565c0"
                          : theme.palette.mode === "light"
                            ? "rgba(0,0,0,0.05)"
                            : "rgba(255,255,255,0.1)",
                      },
                    })}
                  >
                    <ListItemIcon
                      sx={(theme) => ({
                        color: selected
                          ? "#fff"
                          : theme.palette.mode === "light"
                            ? "#666"
                            : "rgba(255,255,255,0.7)",
                        minWidth: 40,
                      })}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{ fontWeight: selected ? "bold" : 500 }}
                    />
                  </ListItemButton>
                </ListItem>
              </motion.div>
            );
          })}
        </List>
      </Box>

      {/* PERFIL Y LOGOUT */}
      <Box sx={(theme) => ({
        p: 2,
        borderTop: theme.palette.mode === "light"
          ? "1px solid rgba(0,0,0,0.1)"
          : "1px solid rgba(255,255,255,0.1)"
      })}>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar src={user?.avatar} sx={{ bgcolor: "#1976d2" }}>
            {user?.nombre?.charAt(0).toUpperCase() || "A"}
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: "bold" }}>
              {user?.nombre} {user?.apellido}
            </Typography>
            <Typography
              variant="caption"
              sx={(theme) => ({
                color: theme.palette.mode === "light"
                  ? "rgba(0,0,0,0.6)"
                  : "rgba(255,255,255,0.6)"
              })}
            >
              {user?.email}
            </Typography>
          </Box>
        </Box>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            mt: 2,
            borderRadius: 2,
            color: "#f44336",
            "&:hover": { backgroundColor: "rgba(244,67,54,0.1)" },
          }}
        >
          <ListItemIcon sx={{ color: "#f44336", minWidth: 40 }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Cerrar sesión" />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box
      sx={(theme) => ({
        display: "flex",
        minHeight: "100vh",
        bgcolor: theme.palette.mode === "light" ? "#F5F6FA" : "#121212",
      })}
    >
      {/* AppBar superior */}
      <AppBar
        position="fixed"
        sx={(theme) => ({
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: theme.palette.mode === "light" ? "#fff" : "#1E1E2F",
          color: theme.palette.mode === "light" ? "#333" : "#fff",
          boxShadow: "0px 2px 4px rgba(0,0,0,0.05)",
        })}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap sx={{ fontWeight: "bold", flexGrow: 1 }}>
            Panel de Administración
          </Typography>
          <ThemeToggle />
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": { width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>

        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box" },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Contenido principal */}
      <Box
        component={motion.main}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        <Container maxWidth="xl">{children}</Container>
      </Box>
    </Box>
  );
}
