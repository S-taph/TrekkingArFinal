"use client"

import { useState, useEffect, useRef } from "react"
import { Box, Chip, Slider, Typography, InputAdornment, TextField, Divider } from "@mui/material"
import { viajesAPI } from "../services/api"

const categories = ["Montaña", "Cultural", "Selva", "Desierto"]
const difficulties = ["Fácil", "Moderado", "Difícil", "Extremo"]

const FilterBar = ({ onFilterChange }) => {
  const [selectedCategories, setSelectedCategories] = useState([])
  const [selectedDifficulties, setSelectedDifficulties] = useState([])
  const [maxPrice, setMaxPrice] = useState(1000000)
  const [priceRange, setPriceRange] = useState([0, 1000000])
  const debounceTimer = useRef(null)

  // Cargar precio máximo dinámicamente
  useEffect(() => {
    const fetchPriceStats = async () => {
      try {
        const response = await viajesAPI.getPreciosStats()
        if (response.success) {
          const max = Math.ceil(response.data.precio_maximo / 10000) * 10000 // Redondear hacia arriba
          setMaxPrice(max)
          setPriceRange([0, max])
        }
      } catch (error) {
        console.error("Error obteniendo estadísticas de precios:", error)
      }
    }
    fetchPriceStats()
  }, [])

  // Cleanup del timer al desmontar
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [])

  // Effect para filtros que NO necesitan debounce (categoría y dificultad)
  useEffect(() => {
    if (onFilterChange) {
      onFilterChange({
        category: selectedCategories,
        difficulty: selectedDifficulties,
        priceRange: priceRange,
      })
    }
  }, [selectedCategories, selectedDifficulties, onFilterChange])

  // Effect separado para precio con debouncing
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    debounceTimer.current = setTimeout(() => {
      if (onFilterChange) {
        onFilterChange({
          category: selectedCategories,
          difficulty: selectedDifficulties,
          priceRange: priceRange,
        })
      }
    }, 400) // 400ms de delay para evitar sobrecarga

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [priceRange])

  const handleCategoryClick = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    )
  }

  const handleDifficultyClick = (difficulty) => {
    setSelectedDifficulties((prev) =>
      prev.includes(difficulty) ? prev.filter((d) => d !== difficulty) : [...prev, difficulty],
    )
  }

  const handlePriceChange = (event, newValue) => {
    setPriceRange(newValue)
  }

  const handleMinPriceChange = (event) => {
    const value = Number.parseInt(event.target.value) || 0
    setPriceRange([value, priceRange[1]])
  }

  const handleMaxPriceChange = (event) => {
    const value = Number.parseInt(event.target.value) || maxPrice
    setPriceRange([priceRange[0], value])
  }

  return (
    <Box sx={{ mb: 4, width: "100%" }}>
      <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
        Filtrar por categoría
      </Typography>
      <Box sx={{ mb: 3, display: "flex", gap: 1, flexWrap: "wrap" }}>
        {categories.map((cat) => (
          <Chip
            key={cat}
            label={cat}
            clickable
            color={selectedCategories.includes(cat) ? "primary" : "default"}
            onClick={() => handleCategoryClick(cat)}
            sx={{
              fontWeight: selectedCategories.includes(cat) ? "bold" : "normal",
            }}
          />
        ))}
      </Box>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
        Filtrar por dificultad
      </Typography>
      <Box sx={{ mb: 3, display: "flex", gap: 1, flexWrap: "wrap" }}>
        {difficulties.map((diff) => (
          <Chip
            key={diff}
            label={diff}
            clickable
            color={selectedDifficulties.includes(diff) ? "secondary" : "default"}
            onClick={() => handleDifficultyClick(diff)}
            sx={{
              fontWeight: selectedDifficulties.includes(diff) ? "bold" : "normal",
            }}
          />
        ))}
      </Box>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
        Filtrar por precio
      </Typography>
      <Slider
        value={priceRange}
        onChange={handlePriceChange}
        valueLabelDisplay="auto"
        valueLabelFormat={(value) => `$${value.toLocaleString()}`}
        min={0}
        max={maxPrice}
        step={10000}
        sx={{ width: "100%", mb: 2 }}
      />

      <Box sx={{ display: "flex", gap: 2 }}>
        <TextField
          label="Mínimo"
          size="small"
          type="number"
          value={priceRange[0]}
          onChange={handleMinPriceChange}
          slotProps={{
            input: { startAdornment: <InputAdornment position="start">$</InputAdornment> },
          }}
          sx={{ flex: 1 }}
        />
        <TextField
          label="Máximo"
          size="small"
          type="number"
          value={priceRange[1]}
          onChange={handleMaxPriceChange}
          slotProps={{
            input: { startAdornment: <InputAdornment position="start">$</InputAdornment> },
          }}
          sx={{ flex: 1 }}
        />
      </Box>
    </Box>
  )
}

export default FilterBar
