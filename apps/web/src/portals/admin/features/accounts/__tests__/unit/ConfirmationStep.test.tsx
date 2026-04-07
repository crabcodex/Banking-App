import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ConfirmationStep } from '../../components/ConfirmationStep';
import type { OpenAccountFormData } from '../../schemas/openAccountSchema';

const BASE_DATA: OpenAccountFormData = {
  customerId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  type: 'AHORRO',
  currency: 'MXN',
};

function renderStep(overrides?: Partial<Parameters<typeof ConfirmationStep>[0]>) {
  const props = {
    data: BASE_DATA,
    onConfirm: vi.fn(),
    onBack: vi.fn(),
    loading: false,
    ...overrides,
  };
  render(<ConfirmationStep {...props} />);
  return props;
}

describe('ConfirmationStep', () => {
  it('muestra los datos del formulario correctamente', () => {
    renderStep();

    expect(screen.getByText('Confirmar apertura')).toBeInTheDocument();
    expect(screen.getByText(BASE_DATA.customerId)).toBeInTheDocument();
    expect(screen.getByText('Ahorro')).toBeInTheDocument();
    expect(screen.getByText('Peso Mexicano (MXN)')).toBeInTheDocument();
  });

  it('resuelve labels de todos los tipos de cuenta', () => {
    const types = [
      ['CHEQUES', 'Cheques'],
      ['NOMINA', 'Nómina'],
      ['INVERSION', 'Inversión'],
      ['EMPRESARIAL', 'Empresarial'],
    ] as const;

    for (const [type, label] of types) {
      const { unmount } = render(
        <ConfirmationStep
          data={{ ...BASE_DATA, type }}
          onConfirm={vi.fn()}
          onBack={vi.fn()}
          loading={false}
        />,
      );
      expect(screen.getByText(label)).toBeInTheDocument();
      unmount();
    }
  });

  it('llama onConfirm al hacer click en confirmar', async () => {
    const user = userEvent.setup({ delay: null });
    const { onConfirm } = renderStep();

    await user.click(screen.getByRole('button', { name: 'Confirmar y abrir cuenta' }));

    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('llama onBack al hacer click en regresar', async () => {
    const user = userEvent.setup({ delay: null });
    const { onBack } = renderStep();

    await user.click(screen.getByRole('button', { name: 'Regresar' }));

    expect(onBack).toHaveBeenCalledOnce();
  });

  it('deshabilita botones cuando loading es true', () => {
    renderStep({ loading: true });

    expect(screen.getByRole('button', { name: 'Regresar' })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Confirmar/ })).toBeDisabled();
  });
});
