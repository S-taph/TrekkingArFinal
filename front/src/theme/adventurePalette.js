/**
 * Paleta de Colores Temática de Aventura para TrekkingAR
 *
 * Inspirada en la naturaleza, montañas y la aventura al aire libre.
 * Diseñada para transmitir profesionalismo, modernidad y emoción.
 */

export const adventurePalette = {
  // Modo Claro - Para usuarios regulares
  light: {
    primary: {
      main: '#2E7D32',      // Verde bosque profundo - Principal
      light: '#60AD5E',     // Verde claro - Hover states
      dark: '#005005',      // Verde oscuro - Estados activos
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#FF6F00',      // Naranja terracota - Acentos (botones CTA)
      light: '#FFA040',     // Naranja claro
      dark: '#C43E00',      // Naranja oscuro
      contrastText: '#FFFFFF',
    },
    accent: {
      mountain: '#455A64',  // Azul grisáceo montaña
      sky: '#0288D1',       // Azul cielo
      earth: '#8D6E63',     // Marrón tierra
      sunset: '#F57C00',    // Naranja atardecer
    },
    background: {
      default: '#F5F7FA',   // Gris muy claro - Fondo principal
      paper: '#FFFFFF',     // Blanco - Tarjetas y contenedores
      elevated: '#FAFBFC',  // Ligeramente elevado
    },
    text: {
      primary: '#1A2027',   // Casi negro - Texto principal
      secondary: '#4A5568', // Gris oscuro - Texto secundario
      disabled: '#A0AEC0',  // Gris - Texto deshabilitado
      hint: '#CBD5E0',      // Gris claro - Hints
    },
    divider: '#E2E8F0',     // Gris claro - Divisores
    success: {
      main: '#2E7D32',      // Verde - Estados exitosos
      light: '#4CAF50',
      dark: '#1B5E20',
    },
    warning: {
      main: '#ED6C02',      // Naranja - Advertencias
      light: '#FF9800',
      dark: '#E65100',
    },
    error: {
      main: '#D32F2F',      // Rojo - Errores
      light: '#EF5350',
      dark: '#C62828',
    },
    info: {
      main: '#0288D1',      // Azul - Información
      light: '#03A9F4',
      dark: '#01579B',
    },
  },

  // Modo Oscuro - Principal (inspirado en hoynoduermoviajes.com.ar)
  dark: {
    primary: {
      main: '#A4D65E',      // Verde Lima/Chartreuse - Color de acento brillante
      light: '#C5E68F',     // Verde lima claro
      dark: '#7FA73E',      // Verde oliva oscuro
      contrastText: '#000000',
    },
    secondary: {
      main: '#D97D54',      // Naranja terroso/quemado - Acento secundario
      light: '#E8A57D',     // Naranja claro
      dark: '#B85F38',      // Naranja oscuro
      contrastText: '#FFFFFF',
    },
    accent: {
      chartreuse: '#A4D65E', // Verde lima principal
      olive: '#7FA73E',      // Verde oliva
      burnt: '#D97D54',      // Naranja quemado
      forest: '#4A6741',     // Verde bosque oscuro
    },
    background: {
      default: '#0A0A0A',   // Negro profundo - Fondo principal
      paper: '#1A1A1A',     // Gris muy oscuro - Tarjetas
      elevated: '#252525',  // Gris oscuro - Elementos elevados
    },
    text: {
      primary: '#FFFFFF',   // Blanco puro - Texto principal
      secondary: '#B0B0B0', // Gris claro - Texto secundario
      disabled: '#666666',  // Gris medio - Texto deshabilitado
      hint: '#808080',      // Gris - Hints
    },
    divider: '#2A2A2A',     // Gris muy oscuro - Divisores
    success: {
      main: '#A4D65E',      // Verde lima - Estados exitosos
      light: '#C5E68F',
      dark: '#7FA73E',
    },
    warning: {
      main: '#D97D54',      // Naranja terroso - Advertencias
      light: '#E8A57D',
      dark: '#B85F38',
    },
    error: {
      main: '#E74C3C',      // Rojo brillante - Errores
      light: '#EC7063',
      dark: '#C0392B',
    },
    info: {
      main: '#5DADE2',      // Azul claro - Información
      light: '#85C1E9',
      dark: '#3498DB',
    },
  },
}

/**
 * Gradientes para headers, banners y elementos destacados
 */
export const adventureGradients = {
  light: {
    primary: 'linear-gradient(135deg, #2E7D32 0%, #66BB6A 100%)',
    secondary: 'linear-gradient(135deg, #FF6F00 0%, #FFA726 100%)',
    mountain: 'linear-gradient(180deg, #455A64 0%, #263238 100%)',
    sky: 'linear-gradient(180deg, #0288D1 0%, #01579B 100%)',
    sunset: 'linear-gradient(135deg, #FF6F00 0%, #F57C00 50%, #E65100 100%)',
    forest: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)',
  },
  dark: {
    primary: 'linear-gradient(135deg, #A4D65E 0%, #7FA73E 100%)',
    secondary: 'linear-gradient(135deg, #D97D54 0%, #B85F38 100%)',
    mountain: 'linear-gradient(180deg, #252525 0%, #0A0A0A 100%)',
    sky: 'linear-gradient(180deg, #5DADE2 0%, #3498DB 100%)',
    sunset: 'linear-gradient(135deg, #D97D54 0%, #B85F38 50%, #A4D65E 100%)',
    forest: 'linear-gradient(135deg, #A4D65E 0%, #4A6741 100%)',
  },
}

/**
 * Sombras personalizadas para dar profundidad
 */
export const adventureShadows = {
  light: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    colored: '0 10px 15px -3px rgba(46, 125, 50, 0.3), 0 4px 6px -2px rgba(46, 125, 50, 0.15)',
  },
  dark: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.5)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.6), 0 2px 4px -1px rgba(0, 0, 0, 0.5)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.7), 0 4px 6px -2px rgba(0, 0, 0, 0.6)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.8), 0 10px 10px -5px rgba(0, 0, 0, 0.7)',
    colored: '0 10px 15px -3px rgba(164, 214, 94, 0.3), 0 4px 6px -2px rgba(164, 214, 94, 0.15)',
  },
}

/**
 * Estados de elementos interactivos
 */
export const adventureStates = {
  // Estados de viajes
  trip: {
    active: '#A4D65E',      // Verde lima - Viaje activo
    pending: '#D97D54',     // Naranja terroso - Pendiente
    completed: '#5DADE2',   // Azul - Completado
    cancelled: '#E74C3C',   // Rojo - Cancelado
  },
  // Estados de reservas
  reservation: {
    confirmed: '#A4D65E',   // Verde lima - Confirmada
    pending: '#D97D54',     // Naranja terroso - Pendiente
    cancelled: '#E74C3C',   // Rojo - Cancelada
  },
  // Dificultad de trekkings
  difficulty: {
    easy: '#A4D65E',        // Verde lima - Fácil
    moderate: '#D97D54',    // Naranja terroso - Moderado
    hard: '#E74C3C',        // Rojo - Difícil
    expert: '#9B59B6',      // Púrpura - Experto/Extremo
  },
}

export default adventurePalette
