import { useNavigate } from "react-router-dom"
import {
  Drawer,
  Box,
  Typography,
  Button,
  IconButton,
} from "@mui/material"
import {
  Close as CloseIcon,
  CheckCircle,
  ShoppingCart,
} from "@mui/icons-material"

/**
 * AddedToCartDrawer - Drawer de confirmación cuando se agrega un producto al carrito
 * Se abre desde la izquierda mostrando la confirmación de agregado exitoso
 */
export const AddedToCartDrawer = ({ open, onClose, productData }) => {
  const navigate = useNavigate()

  const handleGoToCart = () => {
    onClose()
    navigate("/checkout")
  }

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: { xs: '100%', sm: 400 },
          maxWidth: 400,
        }
      }}
    >
      <Box sx={{
        width: '100%',
        height: "100%",
        display: "flex",
        flexDirection: "column",
        p: 3,
        position: 'relative'
      }}>
        {/* Botón cerrar */}
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            color: 'text.secondary'
          }}
        >
          <CloseIcon />
        </IconButton>

        {/* Contenido principal centrado */}
        <Box sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          gap: 3
        }}>
          {/* Icono de éxito con producto/imagen */}
          <Box sx={{ position: 'relative', display: 'inline-flex' }}>
            {productData?.image ? (
              <Box
                sx={{
                  width: 160,
                  height: 160,
                  borderRadius: 2,
                  border: 4,
                  borderColor: 'success.main',
                  overflow: 'hidden',
                  position: 'relative',
                  bgcolor: 'background.paper',
                }}
              >
                <img
                  src={productData.image}
                  alt={productData.title || 'Producto'}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </Box>
            ) : (
              <Box
                sx={{
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  border: 4,
                  borderColor: 'success.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'background.paper',
                  position: 'relative'
                }}
              >
                <ShoppingCart sx={{ fontSize: 56, color: 'text.secondary' }} />
              </Box>
            )}
            <CheckCircle
              sx={{
                position: 'absolute',
                bottom: -8,
                right: -8,
                fontSize: 48,
                color: 'success.main',
                bgcolor: 'background.paper',
                borderRadius: '50%',
              }}
            />
          </Box>

          {/* Texto de confirmación */}
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
              Agregaste a tu carrito
            </Typography>
            {productData && (
              <>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{
                    mb: 0.5,
                    maxWidth: 300,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {productData.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {productData.quantity} {productData.quantity === 1 ? 'unidad' : 'unidades'}
                </Typography>
              </>
            )}
          </Box>

          {/* Botón ir al carrito */}
          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={handleGoToCart}
            sx={{
              maxWidth: 300,
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
              borderRadius: 2,
              boxShadow: 2,
              '&:hover': {
                boxShadow: 4,
              }
            }}
          >
            Ir al carrito
          </Button>
        </Box>
      </Box>
    </Drawer>
  )
}

export default AddedToCartDrawer
