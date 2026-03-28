import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from '@/components/ui';
import { AccountsListPage } from '../../pages/AccountsListPage';
import { describe, it, expect, afterEach } from 'vitest';

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <MemoryRouter initialEntries={['/admin/accounts']}>
          <Routes>
            <Route path="/admin/accounts" element={<AccountsListPage />} />
          </Routes>
        </MemoryRouter>
      </ToastProvider>
    </QueryClientProvider>,
  );
}

describe('AccountsListPage', () => {
  afterEach(() => {
    document.body.style.overflow = '';
  });

  it('muestra el título y los filtros', () => {
    renderPage();

    expect(screen.getByText('Cuentas')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Buscar por CLABE…')).toBeInTheDocument();
  });

  it('carga las cuentas automáticamente al entrar', async () => {
    renderPage();

    expect(screen.getByText('Cargando cuentas...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Mi Ahorro')).toBeInTheDocument();
      expect(screen.getByText('Cuenta Cheques')).toBeInTheDocument();
    });
  });

  it('muestra resultados al aplicar un filtro de tipo', async () => {
    const user = userEvent.setup({ delay: null });
    renderPage();

    const typeSelect = screen.getByLabelText('Tipo de cuenta');
    await user.selectOptions(typeSelect, 'AHORRO');

    await waitFor(() => {
      expect(screen.getByText('Mi Ahorro')).toBeInTheDocument();
    });
  });

  it('muestra tabla con datos de cuentas filtradas', async () => {
    const user = userEvent.setup({ delay: null });
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Mi Ahorro')).toBeInTheDocument();
    });

    const typeSelect = screen.getByLabelText('Tipo de cuenta');
    await user.selectOptions(typeSelect, 'AHORRO');

    await waitFor(() => {
      expect(screen.getByText('Mi Ahorro')).toBeInTheDocument();
      expect(screen.getByText('012345678901234567')).toBeInTheDocument();
      expect(screen.queryByText('Cuenta Cheques')).not.toBeInTheDocument();
    });
  });

  it('limpia filtros con botón de limpiar', async () => {
    const user = userEvent.setup({ delay: null });
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Mi Ahorro')).toBeInTheDocument();
    });

    const typeSelect = screen.getByLabelText('Tipo de cuenta');
    await user.selectOptions(typeSelect, 'AHORRO');

    await waitFor(() => {
      expect(screen.queryByText('Cuenta Cheques')).not.toBeInTheDocument();
    });

    const clearButton = screen.getByLabelText('Limpiar filtros');
    await user.click(clearButton);

    await waitFor(() => {
      expect(screen.getByText('Mi Ahorro')).toBeInTheDocument();
      expect(screen.getByText('Cuenta Cheques')).toBeInTheDocument();
    });
  });
});
