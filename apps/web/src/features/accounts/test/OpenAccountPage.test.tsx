import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from '@/components/ui';
import { OpenAccountPage } from '../pages/OpenAccountPage';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/server';
import { describe, it, expect } from 'vitest';

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <MemoryRouter initialEntries={['/accounts/new']}>
          <Routes>
            <Route path="/accounts/new" element={<OpenAccountPage />} />
            <Route path="/" element={<div>Dashboard</div>} />
          </Routes>
        </MemoryRouter>
      </ToastProvider>
    </QueryClientProvider>,
  );
}

const VALID_UUID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

describe('OpenAccountPage', () => {
  it('muestra el formulario inicialmente', () => {
    renderPage();

    expect(screen.getByText('Abrir Cuenta')).toBeInTheDocument();
    expect(screen.getByLabelText('ID del Cliente')).toBeInTheDocument();
    expect(screen.getByLabelText('Tipo de Cuenta')).toBeInTheDocument();
    expect(screen.getByLabelText('Moneda')).toBeInTheDocument();
    expect(screen.getByLabelText('Alias')).toBeInTheDocument();
    expect(screen.getByLabelText('Saldo Inicial')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Revisar datos' })).toBeInTheDocument();
  });

  it('muestra errores de validación si se envía vacío', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: 'Revisar datos' }));

    await waitFor(() => {
      expect(screen.getByText('El ID de cliente debe ser un UUID válido')).toBeInTheDocument();
    });
  });

  it('navega al paso de confirmación con datos válidos', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText('ID del Cliente'), VALID_UUID);
    await user.selectOptions(screen.getByLabelText('Tipo de Cuenta'), 'AHORRO');
    await user.selectOptions(screen.getByLabelText('Moneda'), 'MXN');
    await user.type(screen.getByLabelText('Alias'), 'Mi cuenta principal');
    await user.type(screen.getByLabelText('Saldo Inicial'), '1000');

    await user.click(screen.getByRole('button', { name: 'Revisar datos' }));

    await waitFor(() => {
      expect(screen.getByText('Confirmar apertura')).toBeInTheDocument();
    });

    expect(screen.getByText(VALID_UUID)).toBeInTheDocument();
    expect(screen.getByText('Ahorro')).toBeInTheDocument();
    expect(screen.getByText('Peso Mexicano (MXN)')).toBeInTheDocument();
    expect(screen.getByText('Mi cuenta principal')).toBeInTheDocument();
    expect(screen.getByText('$1,000.00')).toBeInTheDocument();
  });

  it('permite regresar al formulario desde la confirmación', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText('ID del Cliente'), VALID_UUID);
    await user.selectOptions(screen.getByLabelText('Tipo de Cuenta'), 'CHEQUES');
    await user.selectOptions(screen.getByLabelText('Moneda'), 'USD');
    await user.type(screen.getByLabelText('Alias'), 'Cuenta de cheques');
    await user.type(screen.getByLabelText('Saldo Inicial'), '500');

    await user.click(screen.getByRole('button', { name: 'Revisar datos' }));

    await waitFor(() => {
      expect(screen.getByText('Confirmar apertura')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Regresar' }));

    await waitFor(() => {
      expect(screen.getByLabelText('ID del Cliente')).toBeInTheDocument();
    });
  });

  it('crea la cuenta exitosamente y muestra resultado', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText('ID del Cliente'), VALID_UUID);
    await user.selectOptions(screen.getByLabelText('Tipo de Cuenta'), 'AHORRO');
    await user.selectOptions(screen.getByLabelText('Moneda'), 'MXN');
    await user.type(screen.getByLabelText('Alias'), 'Mi ahorro');
    await user.type(screen.getByLabelText('Saldo Inicial'), '5000');

    await user.click(screen.getByRole('button', { name: 'Revisar datos' }));

    await waitFor(() => {
      expect(screen.getByText('Confirmar apertura')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Confirmar y abrir cuenta' }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Cuenta creada exitosamente' })).toBeInTheDocument();
    });

    expect(screen.getByText('012345678901234567')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ir al Dashboard' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Abrir otra cuenta' })).toBeInTheDocument();
  });

  it('muestra toast de error cuando la API falla', async () => {
    server.use(
      http.post('/api/accounts', () => {
        return HttpResponse.json(
          {
            success: false,
            message: 'El cliente no está activo',
            data: null,
            errors: [{ code: 'CUSTOMER_NOT_ACTIVE', message: 'El cliente no está activo' }],
          },
          { status: 422 },
        );
      }),
    );

    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText('ID del Cliente'), VALID_UUID);
    await user.selectOptions(screen.getByLabelText('Tipo de Cuenta'), 'AHORRO');
    await user.selectOptions(screen.getByLabelText('Moneda'), 'MXN');
    await user.type(screen.getByLabelText('Alias'), 'Test');
    await user.type(screen.getByLabelText('Saldo Inicial'), '1000');

    await user.click(screen.getByRole('button', { name: 'Revisar datos' }));

    await waitFor(() => {
      expect(screen.getByText('Confirmar apertura')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Confirmar y abrir cuenta' }));

    await waitFor(() => {
      expect(screen.getByText('El cliente no está activo')).toBeInTheDocument();
    });
  });
});
