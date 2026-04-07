import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from '@/components/ui';
import { OpenAccountPage } from '../../pages/OpenAccountPage';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/server';
import { describe, it, expect, afterEach } from 'vitest';

const LONG_TIMEOUT = 30_000;

function renderPage(initialEntry = '/admin/accounts/new') {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <MemoryRouter initialEntries={[initialEntry]}>
          <Routes>
            <Route path="/admin/accounts/new" element={<OpenAccountPage />} />
            <Route path="/admin/customers/:customerId/accounts/new" element={<OpenAccountPage />} />
            <Route path="/admin" element={<div>Dashboard</div>} />
          </Routes>
        </MemoryRouter>
      </ToastProvider>
    </QueryClientProvider>,
  );
}

const VALID_UUID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

describe('OpenAccountPage', () => {
  afterEach(() => {
    document.body.style.overflow = '';
  });
  it('muestra el formulario inicialmente', () => {
    renderPage();

    expect(screen.getByText('Abrir Cuenta')).toBeInTheDocument();
    expect(screen.getByLabelText('ID del Cliente')).toBeInTheDocument();
    expect(screen.getByLabelText('Tipo de Cuenta')).toBeInTheDocument();
    expect(screen.getByLabelText('Moneda')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Revisar datos' })).toBeInTheDocument();
  });

  it('muestra errores de validación si se envía vacío', async () => {
    const user = userEvent.setup({ delay: null });
    renderPage();

    await user.click(screen.getByRole('button', { name: 'Revisar datos' }));

    await waitFor(() => {
      expect(screen.getByText('El ID de cliente debe ser un UUID válido')).toBeInTheDocument();
    });
  });

  it('navega al paso de confirmación con datos válidos', async () => {
    const user = userEvent.setup({ delay: null });
    renderPage();

    await user.type(screen.getByLabelText('ID del Cliente'), VALID_UUID);
    await user.selectOptions(screen.getByLabelText('Tipo de Cuenta'), 'AHORRO');
    await user.selectOptions(screen.getByLabelText('Moneda'), 'MXN');

    await user.click(screen.getByRole('button', { name: 'Revisar datos' }));

    await waitFor(() => {
      expect(screen.getByText('Confirmar apertura')).toBeInTheDocument();
    });

    expect(screen.getByText(VALID_UUID)).toBeInTheDocument();
    expect(screen.getByText('Ahorro')).toBeInTheDocument();
    expect(screen.getByText('Peso Mexicano (MXN)')).toBeInTheDocument();
  });

  it('permite regresar al formulario desde la confirmación', { timeout: LONG_TIMEOUT }, async () => {
    const user = userEvent.setup({ delay: null });
    renderPage();

    await user.type(screen.getByLabelText('ID del Cliente'), VALID_UUID);
    await user.selectOptions(screen.getByLabelText('Tipo de Cuenta'), 'CHEQUES');
    await user.selectOptions(screen.getByLabelText('Moneda'), 'USD');

    await user.click(screen.getByRole('button', { name: 'Revisar datos' }));

    await waitFor(() => {
      expect(screen.getByText('Confirmar apertura')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Regresar' }));

    await waitFor(() => {
      expect(screen.getByLabelText('ID del Cliente')).toBeInTheDocument();
    });
  });

  it('crea la cuenta exitosamente y muestra resultado', { timeout: LONG_TIMEOUT }, async () => {
    const user = userEvent.setup({ delay: null });
    renderPage();

    await user.type(screen.getByLabelText('ID del Cliente'), VALID_UUID);
    await user.selectOptions(screen.getByLabelText('Tipo de Cuenta'), 'AHORRO');
    await user.selectOptions(screen.getByLabelText('Moneda'), 'MXN');

    await user.click(screen.getByRole('button', { name: 'Revisar datos' }));

    await waitFor(() => {
      expect(screen.getByText('Confirmar apertura')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Confirmar y abrir cuenta' }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Cuenta creada exitosamente' })).toBeInTheDocument();
    });

    expect(screen.getByText('012345678901234567')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cerrar' })).toBeInTheDocument();
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

    const user = userEvent.setup({ delay: null });
    renderPage();

    await user.type(screen.getByLabelText('ID del Cliente'), VALID_UUID);
    await user.selectOptions(screen.getByLabelText('Tipo de Cuenta'), 'AHORRO');
    await user.selectOptions(screen.getByLabelText('Moneda'), 'MXN');


    await user.click(screen.getByRole('button', { name: 'Revisar datos' }));

    await waitFor(() => {
      expect(screen.getByText('Confirmar apertura')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Confirmar y abrir cuenta' }));

    await waitFor(() => {
      expect(screen.getByText('El cliente no está activo')).toBeInTheDocument();
    });
  });

  // -- Tests de integracion --

  it('pre-llena y bloquea customerId cuando viene en la ruta', () => {
    renderPage(`/admin/customers/${VALID_UUID}/accounts/new`);

    expect(screen.queryByLabelText('ID del Cliente')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Tipo de Cuenta')).toBeInTheDocument();
  });

  it('envia el customerId prefijado al crear la cuenta', async () => {
    let capturedBody: Record<string, unknown> | null = null;
    server.use(
      http.post('/api/accounts', async ({ request }) => {
        capturedBody = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json(
          {
            success: true,
            message: 'Cuenta creada exitosamente',
            data: { accountId: crypto.randomUUID(), clabe: '012345678901234567' },
            requestId: crypto.randomUUID(),
          },
          { status: 201 },
        );
      }),
    );

    const user = userEvent.setup({ delay: null });
    renderPage(`/admin/customers/${VALID_UUID}/accounts/new`);

    await user.selectOptions(screen.getByLabelText('Tipo de Cuenta'), 'AHORRO');
    await user.selectOptions(screen.getByLabelText('Moneda'), 'MXN');

    await user.click(screen.getByRole('button', { name: 'Revisar datos' }));
    await waitFor(() => {
      expect(screen.getByText('Confirmar apertura')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Confirmar y abrir cuenta' }));
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Cuenta creada exitosamente' })).toBeInTheDocument();
    });

    expect(capturedBody).not.toBeNull();
    expect(capturedBody!.customerId).toBe(VALID_UUID);
  });

  it('muestra mensaje generico ante error de red', async () => {
    server.use(
      http.post('/api/accounts', () => {
        return HttpResponse.error();
      }),
    );

    const user = userEvent.setup({ delay: null });
    renderPage();

    await user.type(screen.getByLabelText('ID del Cliente'), VALID_UUID);
    await user.selectOptions(screen.getByLabelText('Tipo de Cuenta'), 'AHORRO');
    await user.selectOptions(screen.getByLabelText('Moneda'), 'MXN');


    await user.click(screen.getByRole('button', { name: 'Revisar datos' }));
    await waitFor(() => {
      expect(screen.getByText('Confirmar apertura')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Confirmar y abrir cuenta' }));

    await waitFor(() => {
      expect(screen.getByText('Ocurrió un error inesperado')).toBeInTheDocument();
    });
  });

  it('muestra mensaje del servidor ante error 409', async () => {
    server.use(
      http.post('/api/accounts', () => {
        return HttpResponse.json(
          {
            success: false,
            message: 'Ya existe una cuenta con ese alias',
            data: null,
            errors: [{ code: 'DUPLICATE_ALIAS', message: 'Ya existe una cuenta con ese alias' }],
          },
          { status: 409 },
        );
      }),
    );

    const user = userEvent.setup({ delay: null });
    renderPage();

    await user.type(screen.getByLabelText('ID del Cliente'), VALID_UUID);
    await user.selectOptions(screen.getByLabelText('Tipo de Cuenta'), 'AHORRO');
    await user.selectOptions(screen.getByLabelText('Moneda'), 'MXN');

    await user.click(screen.getByRole('button', { name: 'Revisar datos' }));
    await waitFor(() => {
      expect(screen.getByText('Confirmar apertura')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Confirmar y abrir cuenta' }));

    await waitFor(() => {
      expect(screen.getByText('Ya existe una cuenta con ese alias')).toBeInTheDocument();
    });
  });

  it('deshabilita el boton confirmar mientras la peticion esta en curso', async () => {
    let resolveRequest!: (value: Response) => void;
    server.use(
      http.post('/api/accounts', () => {
        return new Promise<Response>((resolve) => {
          resolveRequest = resolve;
        });
      }),
    );

    const user = userEvent.setup({ delay: null });
    renderPage();

    await user.type(screen.getByLabelText('ID del Cliente'), VALID_UUID);
    await user.selectOptions(screen.getByLabelText('Tipo de Cuenta'), 'AHORRO');
    await user.selectOptions(screen.getByLabelText('Moneda'), 'MXN');

    await user.click(screen.getByRole('button', { name: 'Revisar datos' }));
    await waitFor(() => {
      expect(screen.getByText('Confirmar apertura')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Confirmar y abrir cuenta' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Confirmar/ })).toBeDisabled();
    });

    resolveRequest(
      HttpResponse.json(
        {
          success: true,
          message: 'ok',
          data: { accountId: 'id', clabe: '012345678901234567' },
        },
        { status: 201 },
      ),
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Cuenta creada exitosamente' })).toBeInTheDocument();
    });
  });
});
