import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import userEvent from '@testing-library/user-event';
import PriceBreakdown from '../PriceBreakdown';

const renderWithTheme = (ui) => {
  const theme = createTheme();
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

describe('PriceBreakdown Component', () => {
  it('debe renderizar colapsado por defecto', () => {
    renderWithTheme(<PriceBreakdown pricePerPerson={1000} quantity={2} />);

    expect(screen.getByText('Ver desglose de precio')).toBeInTheDocument();

    // El desglose no debe estar visible inicialmente
    expect(screen.queryByText('Precio por persona')).not.toBeVisible();
  });

  it('debe expandirse al hacer click', async () => {
    const user = userEvent.setup();
    renderWithTheme(<PriceBreakdown pricePerPerson={1000} quantity={2} />);

    const expandButton = screen.getByText('Ver desglose de precio').closest('[class*="MuiBox-root"]');

    await user.click(expandButton);

    // Ahora el desglose debe estar visible
    expect(screen.getByText('Precio por persona')).toBeVisible();
    expect(screen.getByText('Cantidad de personas')).toBeVisible();
    expect(screen.getByText('Subtotal')).toBeVisible();
  });

  it('debe calcular correctamente el subtotal', async () => {
    const user = userEvent.setup();
    renderWithTheme(<PriceBreakdown pricePerPerson={1000} quantity={3} />);

    const expandButton = screen.getByText('Ver desglose de precio').closest('[class*="MuiBox-root"]');
    await user.click(expandButton);

    expect(screen.getByText('$1,000')).toBeInTheDocument();
    expect(screen.getByText('x3')).toBeInTheDocument();
    expect(screen.getByText('$3,000')).toBeInTheDocument();
  });

  it('debe calcular impuestos correctamente (10%)', async () => {
    const user = userEvent.setup();
    renderWithTheme(<PriceBreakdown pricePerPerson={1000} quantity={2} />);

    const expandButton = screen.getByText('Ver desglose de precio').closest('[class*="MuiBox-root"]');
    await user.click(expandButton);

    // Subtotal: 2000, Impuestos: 200 (10%)
    expect(screen.getByText('Impuestos (10%)')).toBeInTheDocument();
    expect(screen.getByText('$200')).toBeInTheDocument();
  });

  it('debe calcular el total correctamente', async () => {
    const user = userEvent.setup();
    renderWithTheme(<PriceBreakdown pricePerPerson={1000} quantity={2} />);

    const expandButton = screen.getByText('Ver desglose de precio').closest('[class*="MuiBox-root"]');
    await user.click(expandButton);

    // Subtotal: 2000 + Impuestos: 200 = Total: 2200
    const totalElements = screen.getAllByText('$2,200');
    expect(totalElements.length).toBeGreaterThan(0);
  });

  it('debe tener aria-label en el botón de expandir', () => {
    renderWithTheme(<PriceBreakdown pricePerPerson={1000} quantity={2} />);

    const button = screen.getByLabelText(/Ver desglose|Ocultar desglose/i);
    expect(button).toBeInTheDocument();
  });
});
