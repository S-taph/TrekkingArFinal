import { IconButton, Tooltip } from "@mui/material"
import { Brightness4, Brightness7 } from "@mui/icons-material"
import { useTheme } from "../context/ThemeContext"

/**
 * Componente reutilizable para toggle de tema claro/oscuro
 */
export const ThemeToggle = ({ sx = {} }) => {
  const { mode, toggleTheme } = useTheme()

  return (
    <Tooltip title={`Cambiar a modo ${mode === "light" ? "oscuro" : "claro"}`}>
      <IconButton
        onClick={toggleTheme}
        color="inherit"
        sx={{
          transition: "transform 0.2s ease",
          "&:hover": {
            transform: "rotate(20deg)",
          },
          ...sx,
        }}
      >
        {mode === "light" ? <Brightness4 /> : <Brightness7 />}
      </IconButton>
    </Tooltip>
  )
}
