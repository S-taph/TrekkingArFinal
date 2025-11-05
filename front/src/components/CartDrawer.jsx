import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  CircularProgress,
  Alert,
  ButtonGroup,
  Stack,
} from "@mui/material"
import {
  Close as CloseIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  ShoppingCart as CartIcon,
} from "@mui/icons-material"
import { useCart } from "../context/CartContext"
import { useAuth } from "../context/AuthContext"

export const CartDrawer = ({ open, onClose }) => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const {
    items,
    loading,
    error,
    itemCount,
    totalPrice,
    updateItemQuantity,
    removeItem,
    clearCart,
  } = useCart()

  const [updatingItems, setUpdatingItems] = useState({})

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return

    setUpdatingItems((prev) => ({ ...prev, [itemId]: true }))
    await updateItemQuantity(itemId, newQuantity)
    setUpdatingItems((prev) => ({ ...prev, [itemId]: false }))
  }

  const handleRemoveItem = async (itemId) => {
    setUpdatingItems((prev) => ({ ...prev, [itemId]: true }))
    await removeItem(itemId)
    setUpdatingItems((prev) => ({ ...prev, [itemId]: false }))
  }

  const handleClearCart = async () => {
    if (window.confirm("¿Estás seguro de que quieres vaciar el carrito?")) {
      await clearCart()
    }
  }

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 400, height: "100%", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <Box
          sx={{
            p: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            bgcolor: "primary.main",
            color: "primary.contrastText",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CartIcon />
            <Typography variant="h6">Carrito ({itemCount})</Typography>
          </Box>
          <IconButton onClick={onClose} sx={{ color: "inherit" }}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        )}

        {/* Content */}
        <Box sx={{ flex: 1, overflow: "auto", p: 2 }}>
          {loading && items.length === 0 ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : items.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <CartIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
              <Typography variant="body1" color="text.secondary">
                Tu carrito está vacío
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Agrega viajes para comenzar tu aventura
              </Typography>
            </Box>
          ) : (
            <List>
              {items.map((item) => (
                <Box key={item.id}>
                  <ListItem
                    sx={{
                      flexDirection: "column",
                      alignItems: "flex-start",
                      gap: 1,
                      py: 2,
                      opacity: updatingItems[item.id] ? 0.5 : 1,
                    }}
                  >
                    {/* Imagen y Título del viaje */}
                    <Box sx={{ width: "100%", display: "flex", gap: 2 }}>
                      {/* Imagen del viaje */}
                      {item.fechaViaje?.viaje?.imagen_principal_url && (
                        <Box
                          sx={{
                            width: 80,
                            height: 80,
                            borderRadius: 1,
                            overflow: 'hidden',
                            flexShrink: 0,
                            bgcolor: 'grey.200',
                          }}
                        >
                          <img
                            src={item.fechaViaje.viaje.imagen_principal_url}
                            alt={item.fechaViaje?.viaje?.titulo || 'Viaje'}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                        </Box>
                      )}

                      {/* Información del viaje */}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="subtitle1"
                          fontWeight={600}
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {item.fechaViaje?.viaje?.titulo || "Viaje"}
                        </Typography>
                        {item.fechaViaje && (
                          <Typography variant="body2" color="text.secondary">
                            Fecha:{" "}
                            {new Date(item.fechaViaje.fecha_inicio).toLocaleDateString()}
                          </Typography>
                        )}
                        <Typography variant="body2" color="primary" fontWeight={600}>
                          ${item.precio_unitario.toLocaleString()} x {item.cantidad}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Controles de cantidad */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        width: "100%",
                      }}
                    >
                      <ButtonGroup size="small" variant="outlined">
                        <IconButton
                          size="small"
                          onClick={() => handleUpdateQuantity(item.id, item.cantidad - 1)}
                          disabled={item.cantidad <= 1 || updatingItems[item.id]}
                        >
                          <RemoveIcon fontSize="small" />
                        </IconButton>
                        <Button disabled sx={{ minWidth: 50 }}>
                          {item.cantidad}
                        </Button>
                        <IconButton
                          size="small"
                          onClick={() => handleUpdateQuantity(item.id, item.cantidad + 1)}
                          disabled={updatingItems[item.id]}
                        >
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </ButtonGroup>

                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Typography variant="subtitle1" fontWeight={700}>
                          ${(item.precio_unitario * item.cantidad).toLocaleString()}
                        </Typography>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={updatingItems[item.id]}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  </ListItem>
                  <Divider />
                </Box>
              ))}
            </List>
          )}
        </Box>

        {/* Footer */}
        {items.length > 0 && (
          <Box sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
            {/* Total */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6">Total</Typography>
              <Typography variant="h5" color="primary" fontWeight={700}>
                ${totalPrice.toLocaleString()}
              </Typography>
            </Box>

            {/* Botones */}
            <Stack spacing={1}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                onClick={() => {
                  if (user) {
                    // Usuario autenticado - ir directo a checkout
                    onClose()
                    navigate("/checkout")
                  } else {
                    // Usuario no autenticado - guardar URL de retorno y redirigir a login
                    localStorage.setItem("redirectAfterLogin", "/checkout")
                    onClose()
                    navigate("/login")
                  }
                }}
              >
                Finalizar Compra
              </Button>
              <Button
                variant="outlined"
                color="error"
                size="small"
                fullWidth
                onClick={handleClearCart}
                disabled={loading}
              >
                Vaciar Carrito
              </Button>
            </Stack>
          </Box>
        )}
      </Box>
    </Drawer>
  )
}
