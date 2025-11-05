import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import TrustBadges from '../TrustBadges';

const renderWithTheme = (ui) => {
  const theme = createTheme();
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

describe('TrustBadges Component', () => {
  it('debe renderizar los 3 badges de confianza', () => {
    renderWithTheme(<TrustBadges />);

    expect(screen.getByText('Guías certificados')).toBeInTheDocument();
    expect(screen.getByText('Cancelación flexible')).toBeInTheDocument();
    expect(screen.getByText('Pago seguro')).toBeInTheDocument();
  });

  it('debe renderizar los iconos correctos', () => {
    const { container } = renderWithTheme(<TrustBadges />);

    // Verificar que hay 3 iconos SVG
    const icons = container.querySelectorAll('svg');
    expect(icons).toHaveLength(3);
  });

  it('debe tener el estilo correcto de badges', () => {
    const { container } = renderWithTheme(<TrustBadges />);

    const badges = container.querySelectorAll('[class*="MuiBox-root"]');
    expect(badges.length).toBeGreaterThanOrEqual(3);
  });
});
