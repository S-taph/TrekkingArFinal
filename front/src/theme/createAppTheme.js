import { createTheme } from "@mui/material/styles"
import { adventurePalette, adventureShadows } from "./adventurePalette"

/**
 * Crea el theme de la aplicación con modo light/dark
 * Utiliza la paleta de aventura (adventurePalette.js)
 * @param {string} mode - 'light' o 'dark'
 */
export const createAppTheme = (mode = "dark") => {
  const isDark = mode === "dark"
  const colors = isDark ? adventurePalette.dark : adventurePalette.light
  const shadows = isDark ? adventureShadows.dark : adventureShadows.light

  return createTheme({
    palette: {
      mode,
      ...colors,
    },

    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',

      h1: {
        fontFamily: '"Poppins", sans-serif',
        fontSize: "2.5rem",
        fontWeight: 800,
        letterSpacing: "-0.02em",
        lineHeight: 1.2,
        color: colors.text.primary,
      },
      h2: {
        fontFamily: '"Poppins", sans-serif',
        fontSize: "2rem",
        fontWeight: 700,
        letterSpacing: "-0.01em",
        lineHeight: 1.3,
        color: colors.text.primary,
      },
      h3: {
        fontFamily: '"Poppins", sans-serif',
        fontSize: "1.75rem",
        fontWeight: 700,
        lineHeight: 1.4,
        color: colors.text.primary,
      },
      h4: {
        fontFamily: '"Poppins", sans-serif',
        fontSize: "1.5rem",
        fontWeight: 700,
        lineHeight: 1.4,
        color: colors.text.primary,
      },
      h5: {
        fontFamily: '"Poppins", sans-serif',
        fontSize: "1.25rem",
        fontWeight: 600,
        lineHeight: 1.5,
        color: colors.text.primary,
      },
      h6: {
        fontFamily: '"Poppins", sans-serif',
        fontSize: "1rem",
        fontWeight: 600,
        lineHeight: 1.5,
        color: colors.text.primary,
      },
      body1: {
        fontSize: "1rem",
        lineHeight: 1.6,
        color: colors.text.primary,
      },
      body2: {
        fontSize: "0.875rem",
        lineHeight: 1.5,
        color: colors.text.secondary,
      },
      button: {
        textTransform: "none",
        fontWeight: 600,
        letterSpacing: "0.02em",
      },
    },

    shape: {
      borderRadius: 12,
    },

    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: colors.background.default,
            color: colors.text.primary,
            scrollbarColor: isDark
              ? `${colors.primary.main} ${colors.background.paper}`
              : `${colors.primary.main} ${colors.background.default}`,
            "&::-webkit-scrollbar": {
              width: "12px",
            },
            "&::-webkit-scrollbar-track": {
              background: colors.background.paper,
            },
            "&::-webkit-scrollbar-thumb": {
              background: colors.primary.main,
              borderRadius: "6px",
              "&:hover": {
                background: colors.primary.dark,
              },
            },
          },
        },
      },

      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: "10px 24px",
            fontSize: "0.9375rem",
            boxShadow: "none",
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              boxShadow: shadows.md,
              transform: "translateY(-1px)",
            },
          },
          contained: {
            backgroundColor: colors.primary.main,
            color: colors.primary.contrastText,
            "&:hover": {
              backgroundColor: colors.primary.dark,
              boxShadow: shadows.lg,
            },
          },
          containedSecondary: {
            backgroundColor: colors.secondary.main,
            color: colors.secondary.contrastText,
            "&:hover": {
              backgroundColor: colors.secondary.dark,
            },
          },
          outlined: {
            borderWidth: "2px",
            borderColor: colors.primary.main,
            color: colors.primary.main,
            "&:hover": {
              borderWidth: "2px",
              borderColor: colors.primary.dark,
              backgroundColor: isDark ? "rgba(164, 214, 94, 0.08)" : "rgba(46, 125, 50, 0.08)",
            },
          },
        },
      },

      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            backgroundColor: colors.background.paper,
            boxShadow: shadows.md,
            transition: "all 0.3s ease",
            "&:hover": {
              boxShadow: shadows.lg,
              transform: "translateY(-4px)",
            },
          },
        },
      },

      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            fontWeight: 500,
          },
          colorPrimary: {
            backgroundColor: colors.primary.main,
            color: colors.primary.contrastText,
          },
          colorSecondary: {
            backgroundColor: colors.secondary.main,
            color: colors.secondary.contrastText,
          },
        },
      },

      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: colors.background.paper,
            color: colors.text.primary,
            boxShadow: shadows.md,
            borderBottom: `1px solid ${colors.divider}`,
          },
        },
      },

      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: colors.background.paper,
            backgroundImage: "none",
            borderRight: `1px solid ${colors.divider}`,
          },
        },
      },

      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              borderRadius: 10,
              transition: "all 0.2s ease",
              "&:hover": {
                "& > fieldset": {
                  borderColor: colors.primary.main,
                },
              },
              "&.Mui-focused": {
                "& > fieldset": {
                  borderColor: colors.primary.main,
                  borderWidth: "2px",
                },
              },
            },
            "& .MuiInputLabel-root.Mui-focused": {
              color: colors.primary.main,
            },
          },
        },
      },

      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: colors.background.paper,
            backgroundImage: "none",
          },
          rounded: {
            borderRadius: 12,
          },
          elevation1: {
            boxShadow: shadows.sm,
          },
          elevation2: {
            boxShadow: shadows.md,
          },
          elevation3: {
            boxShadow: shadows.lg,
          },
        },
      },

      MuiIconButton: {
        styleOverrides: {
          root: {
            transition: "all 0.2s ease",
            "&:hover": {
              backgroundColor: isDark ? "rgba(164, 214, 94, 0.08)" : "rgba(46, 125, 50, 0.08)",
              transform: "scale(1.1)",
            },
          },
        },
      },

      MuiTableRow: {
        styleOverrides: {
          root: {
            "&:hover": {
              backgroundColor: isDark ? "rgba(164, 214, 94, 0.05)" : "rgba(46, 125, 50, 0.05)",
            },
            "&.Mui-selected": {
              backgroundColor: isDark ? "rgba(164, 214, 94, 0.12)" : "rgba(46, 125, 50, 0.12)",
              "&:hover": {
                backgroundColor: isDark ? "rgba(164, 214, 94, 0.18)" : "rgba(46, 125, 50, 0.18)",
              },
            },
          },
        },
      },

      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: `1px solid ${colors.divider}`,
          },
          head: {
            backgroundColor: colors.background.elevated,
            color: colors.text.primary,
            fontWeight: 600,
            fontSize: "0.875rem",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          },
        },
      },

      MuiSelect: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            "&:hover": {
              "& > fieldset": {
                borderColor: colors.primary.main,
              },
            },
            "&.Mui-focused": {
              "& > fieldset": {
                borderColor: colors.primary.main,
              },
            },
          },
        },
      },

      MuiMenuItem: {
        styleOverrides: {
          root: {
            "&:hover": {
              backgroundColor: isDark ? "rgba(164, 214, 94, 0.08)" : "rgba(46, 125, 50, 0.08)",
            },
            "&.Mui-selected": {
              backgroundColor: isDark ? "rgba(164, 214, 94, 0.12)" : "rgba(46, 125, 50, 0.12)",
              "&:hover": {
                backgroundColor: isDark ? "rgba(164, 214, 94, 0.18)" : "rgba(46, 125, 50, 0.18)",
              },
            },
          },
        },
      },

      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundColor: colors.background.paper,
            boxShadow: shadows.xl,
          },
        },
      },

      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: isDark ? colors.background.elevated : colors.background.paper,
            color: colors.text.primary,
            border: `1px solid ${colors.divider}`,
            boxShadow: shadows.md,
            fontSize: "0.875rem",
          },
          arrow: {
            color: isDark ? colors.background.elevated : colors.background.paper,
            "&:before": {
              border: `1px solid ${colors.divider}`,
            },
          },
        },
      },
    },

    shadows: [
      "none",
      shadows.sm,
      shadows.md,
      shadows.lg,
      shadows.xl,
      shadows.xl,
      shadows.xl,
      shadows.xl,
      shadows.xl,
      ...Array(16).fill(shadows.xl),
    ],
  })
}
