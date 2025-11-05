import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  CardActions,
  Button,
  Rating,
  Box,
  Chip,
} from '@mui/material';

const ProductCard = ({ product }) => {
  const { name, image, price, rating, tag } = product;

  return (
    <Card sx={{ position: 'relative' }}>
      {/* Globos flotantes */}
    {tag && (
    <Chip
        label={tag}
        size="small"
        sx={{
        position: 'absolute',
        top: 8,
        left: 8,
        zIndex: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
        color: 'white',
        bgcolor:
            tag === 'Nuevo'
            ? '#2196f3'       // Azul fuerte
            : tag === 'Best Seller'
            ? '#4caf50'       // Verde fuerte
            : '#ff9800',      // Naranja
        }}
    />
    )}


      <CardMedia
        component="img"
        height="200"
        image={image}
        alt={name}
        sx={{ objectFit: 'cover' }}
      />
      <CardContent>
        <Typography variant="h6">{name}</Typography>
        <Typography variant="body2" color="text.secondary">
          ${price.toLocaleString('es-AR')}
        </Typography>
        <Box mt={1}>
          <Rating value={rating} precision={0.1} readOnly />
        </Box>
      </CardContent>
      <CardActions>
        <Button size="small">Ver más</Button>
      </CardActions>
    </Card>
  );
};

export default ProductCard;