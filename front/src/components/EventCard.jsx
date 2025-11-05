import { Card, CardMedia, CardContent, Typography, Chip, Box, Button } from "@mui/material";

const EventCard = ({ event }) => {
  const { title, description, date, category, location, available, image } = event;

  return (
    <Card
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        "&:hover": {
          transform: "translateY(-6px)",
          boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
        },
      }}
    >
      <Box sx={{ position: "relative" }}>
        <CardMedia
          component="img"
          height="180"
          image={image}
          alt={title}
          sx={{ objectFit: "cover" }}
        />

        {/* Chip de disponibilidad */}
        {available > 0 && (
          <Chip
            label={`Disponible ${available} lugares`}
            size="small"
            sx={{
              position: "absolute",
              bottom: 8,
              left: 8,
              bgcolor: "#4caf50",
              color: "white",
              fontWeight: "bold",
            }}
          />
        )}
      </Box>

      <CardContent>
        <Typography variant="h6" fontWeight="bold">
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {description}
        </Typography>

        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}>
          <Chip label={category} size="small" color="warning" />
          <Chip label={date} size="small" variant="outlined" />
          <Chip label={location} size="small" variant="outlined" />
        </Box>
      </CardContent>

      <Box sx={{ p: 2, pt: 0 }}>
        <Button
          fullWidth
          variant="contained"
          sx={{
            bgcolor: "#ff9800",
            color: "white",
            fontWeight: "bold",
            borderRadius: 2,
            "&:hover": { bgcolor: "#e68900" },
          }}
        >
          Ver
        </Button>
      </Box>
    </Card>
  );
};

export default EventCard;
