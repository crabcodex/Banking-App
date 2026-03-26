import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { SuccessStep } from '../../components/SuccessStep';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const RESULT = {
  accountId: 'abc-123-def',
  clabe: '012345678901234567',
};

describe('SuccessStep', () => {
  it('muestra el accountId y la CLABE', () => {
    render(
      <MemoryRouter>
        <SuccessStep result={RESULT} />
      </MemoryRouter>,
    );

    expect(screen.getByText(RESULT.accountId)).toBeInTheDocument();
    expect(screen.getByText(RESULT.clabe)).toBeInTheDocument();
  });

  it('muestra el titulo de exito y el badge', () => {
    render(
      <MemoryRouter>
        <SuccessStep result={RESULT} />
      </MemoryRouter>,
    );

    expect(screen.getByText('Cuenta creada exitosamente')).toBeInTheDocument();
    expect(screen.getByText('Activa')).toBeInTheDocument();
  });

  it('llama navigate(-1) al hacer click en Cerrar', async () => {
    const user = userEvent.setup({ delay: null });

    render(
      <MemoryRouter>
        <SuccessStep result={RESULT} />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: 'Cerrar' }));

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
});
