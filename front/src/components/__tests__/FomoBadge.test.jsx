import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import userEvent from '@testing-library/user-event';
import FomoBadge, { shouldShowFomo } from '../FomoBadge';
import * as analytics from '../../services/analytics';

// Mock analytics
jest.mock('../../services/analytics', () => ({
  track: jest.fn(),
}));

// Helper para renderizar con tema
const renderWithTheme = (ui) => {
  const theme = createTheme({
    palette: {
      fomo: {
        bgStart: '#FF9A3C',
        bgEnd: '#FF6A00',
        text: '#FFFFFF',
        border: 'rgba(0,0,0,0.08)',
      },
    },
  });

  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

describe('shouldShowFomo', () => {
  it('debe retornar true cuando remaining <= 10', () => {
    expect(shouldShowFomo({ remaining: 5, capacity: 100, reservasMes: 0 })).toBe(true);
    expect(shouldShowFomo({ remaining: 10, capacity: 100, reservasMes: 0 })).toBe(true);
    expect(shouldShowFomo({ remaining: 1, capacity: 100, reservasMes: 0 })).toBe(true);
  });

  it('debe retornar false cuando remaining > 10 y no cumple otras condiciones', () => {
    expect(shouldShowFomo({ remaining: 15, capacity: 100, reservasMes: 0 })).toBe(false);
    expect(shouldShowFomo({ remaining: 50, capacity: 100, reservasMes: 0 })).toBe(false);
  });

  it('debe retornar true cuando remaining/capacity < 0.15', () => {
    expect(shouldShowFomo({ remaining: 14, capacity: 100, reservasMes: 0 })).toBe(true);
    expect(shouldShowFomo({ remaining: 12, capacity: 100, reservasMes: 0 })).toBe(true);
  });

  it('debe retornar true cuando reservasMes >= 5', () => {
    expect(shouldShowFomo({ remaining: 50, capacity: 100, reservasMes: 5 })).toBe(true);
    expect(shouldShowFomo({ remaining: 50, capacity: 100, reservasMes: 10 })).toBe(true);
  });

  it('debe retornar false cuando remaining es null o undefined', () => {
    expect(shouldShowFomo({ remaining: null, capacity: 100, reservasMes: 0 })).toBe(false);
    expect(shouldShowFomo({ remaining: undefined, capacity: 100, reservasMes: 0 })).toBe(false);
  });

  it('debe retornar false cuando remaining es 0 (agotado)', () => {
    expect(shouldShowFomo({ remaining: 0, capacity: 100, reservasMes: 0 })).toBe(false);
  });
});

describe('FomoBadge Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('debe renderizar correctamente con remaining=3', () => {
    renderWithTheme(
      <FomoBadge
        remaining={3}
        capacity={20}
        reservasMes={0}
        mes="noviembre de 2025"
        tripId="123"
      />
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText(/quedan 3 cupos para noviembre de 2025/i)).toBeInTheDocument();
  });

  it('debe mostrar singular cuando remaining=1', () => {
    renderWithTheme(
      <FomoBadge
        remaining={1}
        capacity={20}
        reservasMes={0}
        mes="diciembre de 2025"
        tripId="123"
      />
    );

    expect(screen.getByText(/queda 1 cupo para diciembre de 2025/i)).toBeInTheDocument();
  });

  it('NO debe renderizar cuando remaining > 10 y no cumple condiciones', () => {
    const { container } = renderWithTheme(
      <FomoBadge
        remaining={50}
        capacity={100}
        reservasMes={2}
        mes="enero de 2026"
        tripId="123"
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('debe disparar analytics.track("fomo_shown") al montar', () => {
    renderWithTheme(
      <FomoBadge
        remaining={3}
        capacity={20}
        reservasMes={0}
        mes="noviembre de 2025"
        tripId="123"
      />
    );

    expect(analytics.track).toHaveBeenCalledWith('fomo_shown', {
      tripId: '123',
      remaining: 3,
      capacity: 20,
      reservasMes: 0,
      mes: 'noviembre de 2025',
    });
  });

  it('debe agregar clase "fomo-pulse" después de 6 segundos', async () => {
    const { container } = renderWithTheme(
      <FomoBadge
        remaining={3}
        capacity={20}
        reservasMes={0}
        mes="noviembre de 2025"
        tripId="123"
      />
    );

    const badge = container.firstChild;
    expect(badge).not.toHaveClass('fomo-pulse');

    // Avanzar 6 segundos
    act(() => {
      jest.advanceTimersByTime(6000);
    });

    await waitFor(() => {
      expect(badge).toHaveClass('fomo-pulse');
    });

    // Avanzar 1 segundo más (para que se quite el pulse)
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(badge).not.toHaveClass('fomo-pulse');
    });
  });

  it('debe mostrar subtexto de reservas cuando reservasMes > 0', () => {
    renderWithTheme(
      <FomoBadge
        remaining={5}
        capacity={20}
        reservasMes={8}
        mes="noviembre de 2025"
        tripId="123"
      />
    );

    expect(screen.getByText(/8 personas reservaron este mes/i)).toBeInTheDocument();
  });

  it('debe mostrar subtexto singular cuando reservasMes = 1', () => {
    renderWithTheme(
      <FomoBadge
        remaining={5}
        capacity={20}
        reservasMes={1}
        mes="noviembre de 2025"
        tripId="123"
      />
    );

    expect(screen.getByText(/1 persona reservó este mes/i)).toBeInTheDocument();
  });

  it('debe disparar onClickAction y track analytics al hacer click', async () => {
    const mockOnClick = jest.fn();
    const user = userEvent.setup({ delay: null });

    renderWithTheme(
      <FomoBadge
        remaining={3}
        capacity={20}
        reservasMes={0}
        mes="noviembre de 2025"
        tripId="123"
        onClickAction={mockOnClick}
      />
    );

    const badge = screen.getByRole('status');
    await user.click(badge);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
    expect(analytics.track).toHaveBeenCalledWith('fomo_click_to_reserve', {
      tripId: '123',
      remaining: 3,
      mes: 'noviembre de 2025',
    });
  });

  it('debe ser accesible con teclado cuando tiene onClickAction', async () => {
    const mockOnClick = jest.fn();
    const user = userEvent.setup({ delay: null });

    renderWithTheme(
      <FomoBadge
        remaining={3}
        capacity={20}
        reservasMes={0}
        mes="noviembre de 2025"
        tripId="123"
        onClickAction={mockOnClick}
      />
    );

    const badge = screen.getByRole('status');
    badge.focus();

    // Presionar Enter
    await user.keyboard('{Enter}');
    expect(mockOnClick).toHaveBeenCalledTimes(1);

    // Presionar Space
    await user.keyboard(' ');
    expect(mockOnClick).toHaveBeenCalledTimes(2);
  });

  it('debe tener role="status" y aria-live="polite" para accesibilidad', () => {
    renderWithTheme(
      <FomoBadge
        remaining={3}
        capacity={20}
        reservasMes={0}
        mes="noviembre de 2025"
        tripId="123"
      />
    );

    const badge = screen.getByRole('status');
    expect(badge).toHaveAttribute('aria-live', 'polite');
    expect(badge).toHaveAttribute('aria-label', 'Quedan 3 cupos para noviembre de 2025');
  });

  it('NO debe trackear analytics múltiples veces para el mismo badge', () => {
    const { rerender } = renderWithTheme(
      <FomoBadge
        remaining={3}
        capacity={20}
        reservasMes={0}
        mes="noviembre de 2025"
        tripId="123"
      />
    );

    expect(analytics.track).toHaveBeenCalledTimes(1);

    // Re-render sin cambios
    rerender(
      <ThemeProvider theme={createTheme({})}>
        <FomoBadge
          remaining={3}
          capacity={20}
          reservasMes={0}
          mes="noviembre de 2025"
          tripId="123"
        />
      </ThemeProvider>
    );

    // Debería seguir siendo 1 llamada
    expect(analytics.track).toHaveBeenCalledTimes(1);
  });
});
