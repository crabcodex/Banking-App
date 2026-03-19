import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import RegisterForm from '../RegisterForm';

function renderWithProviders() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <RegisterForm />
    </QueryClientProvider>,
  );
}

describe('RegisterForm', () => {
  it('debe renderizar los campos del formulario y el botón', () => {
    renderWithProviders();

    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^contraseña$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirmar contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /registrarse/i })).toBeInTheDocument();
  });

  it('debe mostrar error con un email inválido', async () => {
    const user = userEvent.setup();
    renderWithProviders();

    const emailInput = screen.getByLabelText(/correo electrónico/i);
    await user.type(emailInput, 'correo-invalido');
    await user.tab(); // trigger blur/onChange validation

    await waitFor(() => {
      expect(screen.getByText(/email inválido/i)).toBeInTheDocument();
    });
  });

  it('debe mostrar error si la contraseña tiene menos de 8 caracteres', async () => {
    const user = userEvent.setup();
    renderWithProviders();

    const passwordInput = screen.getByLabelText(/^contraseña$/i);
    await user.type(passwordInput, '1234567');
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText(/al menos 8 caracteres/i)).toBeInTheDocument();
    });
  });

  it('debe mostrar error si las contraseñas no coinciden', async () => {
    const user = userEvent.setup();
    renderWithProviders();

    const passwordInput = screen.getByLabelText(/^contraseña$/i);
    const confirmInput = screen.getByLabelText(/confirmar contraseña/i);

    await user.type(passwordInput, '12345678');
    await user.type(confirmInput, '87654321');
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText(/las contraseñas no coinciden/i)).toBeInTheDocument();
    });
  });

  it('el botón debe estar deshabilitado cuando el formulario no es válido', () => {
    renderWithProviders();

    const button = screen.getByRole('button', { name: /registrarse/i });
    expect(button).toBeDisabled();
  });

  it('debe habilitar el botón cuando el formulario es válido', async () => {
    const user = userEvent.setup();
    renderWithProviders();

    await user.type(screen.getByLabelText(/correo electrónico/i), 'test@test.com');
    await user.type(screen.getByLabelText(/^contraseña$/i), '12345678');
    await user.type(screen.getByLabelText(/confirmar contraseña/i), '12345678');

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /registrarse/i })).toBeEnabled();
    });
  });

  it('debe mostrar "Registrando..." mientras se envía el formulario', async () => {
    const user = userEvent.setup();
    renderWithProviders();

    await user.type(screen.getByLabelText(/correo electrónico/i), 'test@test.com');
    await user.type(screen.getByLabelText(/^contraseña$/i), '12345678');
    await user.type(screen.getByLabelText(/confirmar contraseña/i), '12345678');

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /registrarse/i })).toBeEnabled();
    });

    await user.click(screen.getByRole('button', { name: /registrarse/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /registrando/i })).toBeInTheDocument();
    });
  });

  it('debe mostrar mensaje de éxito al registrar correctamente', async () => {
    const user = userEvent.setup();
    renderWithProviders();

    await user.type(screen.getByLabelText(/correo electrónico/i), 'test@test.com');
    await user.type(screen.getByLabelText(/^contraseña$/i), '12345678');
    await user.type(screen.getByLabelText(/confirmar contraseña/i), '12345678');

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /registrarse/i })).toBeEnabled();
    });

    await user.click(screen.getByRole('button', { name: /registrarse/i }));

    await waitFor(
      () => {
        expect(screen.getByText(/cliente registrado/i)).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });

  it('debe mostrar mensaje de error cuando el correo ya existe', async () => {
    const user = userEvent.setup();
    renderWithProviders();

    await user.type(screen.getByLabelText(/correo electrónico/i), 'error@test.com');
    await user.type(screen.getByLabelText(/^contraseña$/i), '12345678');
    await user.type(screen.getByLabelText(/confirmar contraseña/i), '12345678');

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /registrarse/i })).toBeEnabled();
    });

    await user.click(screen.getByRole('button', { name: /registrarse/i }));

    await waitFor(
      () => {
        expect(screen.getByText(/el correo ya existe/i)).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });
});
