import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import TotalRow from '../TotalRow';

const renderWithTheme = (ui) => {
  const theme = createTheme();
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

describe('TotalRow Component', () => {
  it('debe renderizar con el total correcto', () => {
    renderWithTheme(<TotalRow total={5000} />);

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText(/5,000/)).toBeInTheDocument();
  });

  it('debe animar el cambio de total', async () => {
    const { rerender } = renderWithTheme(<TotalRow total={1000} />);

    expect(screen.getByText(/1,000/)).toBeInTheDocument();

    // Cambiar el total
    rerender(
      <ThemeProvider theme={createTheme()}>
        <TotalRow total={2000} />
      </ThemeProvider>
    );

    // Esperar a que la animación termine
    await waitFor(() => {
      expect(screen.getByText(/2,000/)).toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('debe tener aria-label correcto', () => {
    renderWithTheme(<TotalRow total={3500} />);

    const element = screen.getByRole('status');
    expect(element).toHaveAttribute('aria-label', 'Total: $3,500');
  });

  it('debe formatear correctamente números grandes', () => {
    renderWithTheme(<TotalRow total={123456} />);

    expect(screen.getByText(/123,456/)).toBeInTheDocument();
  });
});
