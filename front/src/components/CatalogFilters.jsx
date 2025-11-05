import { useState, useEffect, useRef } from "react"
import {
  Box,
  Paper,
  ToggleButtonGroup,
  ToggleButton,
  Button,
  Chip,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material"
import {
  Clear as ClearIcon,
} from "@mui/icons-material"

const ALL_MONTHS = [
  { value: 1, label: "Ene" },
  { value: 2, label: "Feb" },
  { value: 3, label: "Mar" },
  { value: 4, label: "Abr" },
  { value: 5, label: "May" },
  { value: 6, label: "Jun" },
  { value: 7, label: "Jul" },
  { value: 8, label: "Ago" },
  { value: 9, label: "Sep" },
  { value: 10, label: "Oct" },
  { value: 11, label: "Nov" },
  { value: 12, label: "Dic" },
]

// Get current month and next 4 months
const getNextMonths = () => {
  const currentMonth = new Date().getMonth() + 1 // 1-12
  const months = []

  for (let i = 0; i < 5; i++) {
    const monthValue = ((currentMonth - 1 + i) % 12) + 1
    months.push(ALL_MONTHS[monthValue - 1])
  }

  return months
}

const MONTHS = getNextMonths()

const DURATION_OPTIONS = [
  { value: "1-3", label: "1-3 días" },
  { value: "4-7", label: "4-7 días" },
  { value: "8+", label: "8+ días" },
]

const DIFFICULTY_OPTIONS = [
  { value: "facil", label: "Fácil" },
  { value: "moderado", label: "Moderado" },
  { value: "dificil", label: "Difícil" },
  { value: "extremo", label: "Extremo" },
]

/**
 * CatalogFilters - Compact horizontal filter bar
 */
export const CatalogFilters = ({ onFilterChange, onClear }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const [mes, setMes] = useState(null)
  const [duracion, setDuracion] = useState(null)
  const [dificultad, setDificultad] = useState(null)

  // Refs for debouncing
  const debounceTimer = useRef(null)

  // Apply filters with debouncing
  const applyFilters = (newFilters) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    debounceTimer.current = setTimeout(() => {
      const filters = {}

      // Month filter
      if (newFilters.mes) {
        filters.mes = newFilters.mes
      }

      // Duration filter
      if (newFilters.duracion) {
        if (newFilters.duracion === "1-3") {
          filters.duracion_min = 1
          filters.duracion_max = 3
        } else if (newFilters.duracion === "4-7") {
          filters.duracion_min = 4
          filters.duracion_max = 7
        } else if (newFilters.duracion === "8+") {
          filters.duracion_min = 8
          filters.duracion_max = 100
        }
      }

      // Difficulty filter
      if (newFilters.dificultad) {
        filters.dificultad = newFilters.dificultad
      }

      onFilterChange(filters)
    }, 300)
  }

  const handleMesChange = (event, newValue) => {
    setMes(newValue)
    applyFilters({ mes: newValue, duracion, dificultad })
  }

  const handleDuracionChange = (event, newValue) => {
    setDuracion(newValue)
    applyFilters({ mes, duracion: newValue, dificultad })
  }

  const handleDificultadChange = (event, newValue) => {
    setDificultad(newValue)
    applyFilters({ mes, duracion, dificultad: newValue })
  }

  const handleClearFilters = () => {
    setMes(null)
    setDuracion(null)
    setDificultad(null)
    onFilterChange({})
    if (onClear) onClear()
  }

  const activeFiltersCount = [mes, duracion, dificultad].filter(Boolean).length

  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        mb: 3,
        bgcolor: (theme) =>
          theme.palette.mode === 'dark'
            ? 'rgba(100, 181, 246, 0.08)'
            : 'rgba(100, 181, 246, 0.06)',
        borderRadius: 2,
        border: (theme) => `1px solid ${
          theme.palette.mode === 'dark'
            ? 'rgba(100, 181, 246, 0.2)'
            : 'rgba(100, 181, 246, 0.15)'
        }`,
      }}
    >
      <Stack
        direction={isMobile ? "column" : "row"}
        spacing={2}
        alignItems={isMobile ? "stretch" : "flex-start"}
        flexWrap={isMobile ? "wrap" : "nowrap"}
        sx={{
          overflowX: { xs: 'auto', md: 'visible' },
          pb: isMobile ? 0 : 1,
        }}
      >
        {/* Mes de Salida */}
        <Box sx={{ flex: isMobile ? 1 : '0 0 auto', minWidth: isMobile ? 'auto' : '280px' }}>
          <Typography variant="caption" sx={{ display: "block", mb: 0.5, fontWeight: 600 }}>
            Mes de Salida
          </Typography>
          <ToggleButtonGroup
            value={mes}
            exclusive
            onChange={handleMesChange}
            size="small"
            orientation="horizontal"
            sx={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: "wrap",
              gap: 0.5,
              overflowX: { xs: 'auto', md: 'visible' },
              "& .MuiToggleButton-root": {
                minWidth: 45,
                py: 0.5,
                px: 1.5,
                fontSize: "0.75rem",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: "20px !important",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  opacity: 0.85,
                  transform: "translateY(-1px)",
                  boxShadow: 1,
                },
                "&.Mui-selected": {
                  bgcolor: "primary.main",
                  color: "white",
                  borderColor: "primary.dark",
                  fontWeight: 600,
                  boxShadow: 2,
                  "&:hover": {
                    bgcolor: "primary.dark",
                    opacity: 1,
                  },
                },
              },
            }}
          >
            {MONTHS.map((month) => (
              <ToggleButton key={month.value} value={month.value}>
                {month.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>

        {/* Duración */}
        <Box sx={{ minWidth: isMobile ? 'auto' : '200px' }}>
          <Typography variant="caption" sx={{ display: "block", mb: 0.5, fontWeight: 600 }}>
            Duración
          </Typography>
          <ToggleButtonGroup
            value={duracion}
            exclusive
            onChange={handleDuracionChange}
            size="small"
            sx={{
              "& .MuiToggleButton-root": {
                px: 2,
                py: 0.5,
                fontSize: "0.875rem",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: "20px !important",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  opacity: 0.85,
                  transform: "translateY(-1px)",
                  boxShadow: 1,
                },
                "&.Mui-selected": {
                  bgcolor: "primary.main",
                  color: "white",
                  borderColor: "primary.dark",
                  fontWeight: 600,
                  boxShadow: 2,
                  "&:hover": {
                    bgcolor: "primary.dark",
                    opacity: 1,
                  },
                },
              },
            }}
          >
            {DURATION_OPTIONS.map((option) => (
              <ToggleButton key={option.value} value={option.value}>
                {option.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>

        {/* Dificultad */}
        <Box sx={{ minWidth: isMobile ? 'auto' : '250px' }}>
          <Typography variant="caption" sx={{ display: "block", mb: 0.5, fontWeight: 600 }}>
            Dificultad
          </Typography>
          <ToggleButtonGroup
            value={dificultad}
            exclusive
            onChange={handleDificultadChange}
            size="small"
            sx={{
              "& .MuiToggleButton-root": {
                px: 2,
                py: 0.5,
                fontSize: "0.875rem",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: "20px !important",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  opacity: 0.85,
                  transform: "translateY(-1px)",
                  boxShadow: 1,
                },
                "&.Mui-selected": {
                  bgcolor: "primary.main",
                  color: "white",
                  borderColor: "primary.dark",
                  fontWeight: 600,
                  boxShadow: 2,
                  "&:hover": {
                    bgcolor: "primary.dark",
                    opacity: 1,
                  },
                },
              },
            }}
          >
            {DIFFICULTY_OPTIONS.map((option) => (
              <ToggleButton key={option.value} value={option.value}>
                {option.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>

        {/* Clear Filters Button */}
        <Box sx={{
          ml: "auto",
          display: "flex",
          alignItems: "center",
          gap: 1,
          alignSelf: isMobile ? "stretch" : "center",
          mt: isMobile ? 0 : 2.5,
        }}>
          {activeFiltersCount > 0 && (
            <Chip
              label={`${activeFiltersCount} filtro${activeFiltersCount > 1 ? "s" : ""}`}
              size="small"
              color="primary"
            />
          )}
          <Button
            variant="outlined"
            size="small"
            startIcon={<ClearIcon />}
            onClick={handleClearFilters}
            disabled={activeFiltersCount === 0}
            sx={{
              py: 0.75,
              px: 2,
              whiteSpace: "nowrap",
              borderRadius: "20px",
              borderWidth: 2,
              borderColor: "primary.main",
              color: "primary.main",
              fontWeight: 600,
              "&:hover": {
                borderWidth: 2,
                borderColor: "primary.dark",
                bgcolor: "primary.main",
                color: "white",
              },
              "&.Mui-disabled": {
                borderColor: "action.disabled",
              },
            }}
          >
            Limpiar
          </Button>
        </Box>
      </Stack>
    </Paper>
  )
}

export default CatalogFilters
