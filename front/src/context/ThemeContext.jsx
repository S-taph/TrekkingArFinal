import { createContext, useContext, useState, useMemo, useEffect } from "react"
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles"
import { CssBaseline } from "@mui/material"
import { createAppTheme } from "../theme/createAppTheme"

const ThemeContext = createContext(null)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme debe usarse dentro de ThemeProvider")
  }
  return context
}

export const ThemeProvider = ({ children }) => {
  // Inicializar desde localStorage o default a 'light'
  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem("theme-mode")
    return savedMode || "light"
  })

  // Crear theme dinámicamente cuando cambia el modo
  const theme = useMemo(() => createAppTheme(mode), [mode])

  // Guardar preferencia en localStorage
  useEffect(() => {
    localStorage.setItem("theme-mode", mode)
  }, [mode])

  // Toggle entre light y dark
  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"))
  }

  const value = {
    mode,
    toggleTheme,
    isDark: mode === "dark",
  }

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  )
}
