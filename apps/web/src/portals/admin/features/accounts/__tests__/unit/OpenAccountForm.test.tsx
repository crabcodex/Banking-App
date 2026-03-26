import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { OpenAccountForm } from '../../components/OpenAccountForm';

const VALID_UUID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

describe('OpenAccountForm', () => {
  it('renderiza todos los campos visibles por defecto', () => {
    render(<OpenAccountForm onSubmit={vi.fn()} />);

    expect(screen.getByLabelText('ID del Cliente')).toBeInTheDocument();
    expect(screen.getByLabelText('Tipo de Cuenta')).toBeInTheDocument();
    expect(screen.getByLabelText('Moneda')).toBeInTheDocument();
    expect(screen.getByLabelText('Alias')).toBeInTheDocument();
    expect(screen.getByLabelText('Saldo Inicial')).toBeInTheDocument();
  });

  it('oculta el campo customerId cuando lockCustomerId es true', () => {
    render(
      <OpenAccountForm
        onSubmit={vi.fn()}
        defaultCustomerId={VALID_UUID}
        lockCustomerId={true}
      />,
    );

    expect(screen.queryByLabelText('ID del Cliente')).not.toBeInTheDocument();

    const hidden = document.querySelector('input[type="hidden"]') as HTMLInputElement;
    expect(hidden).toBeTruthy();
    expect(hidden.value).toBe(VALID_UUID);
  });

  it('pre-llena el customerId con defaultCustomerId', () => {
    render(
      <OpenAccountForm onSubmit={vi.fn()} defaultCustomerId={VALID_UUID} />,
    );

    expect(screen.getByLabelText('ID del Cliente')).toHaveValue(VALID_UUID);
  });

  it('llama onSubmit con los datos del formulario', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup({ delay: null });

    render(<OpenAccountForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('ID del Cliente'), VALID_UUID);
    await user.selectOptions(screen.getByLabelText('Tipo de Cuenta'), 'AHORRO');
    await user.selectOptions(screen.getByLabelText('Moneda'), 'MXN');
    await user.type(screen.getByLabelText('Alias'), 'Test');
    await user.type(screen.getByLabelText('Saldo Inicial'), '500');

    await user.click(screen.getByRole('button', { name: 'Revisar datos' }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        customerId: VALID_UUID,
        type: 'AHORRO',
        currency: 'MXN',
        alias: 'Test',
        initialBalance: 500,
      }),
      expect.anything(),
    );
  });

  it('no llama onSubmit si hay errores de validacion', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup({ delay: null });

    render(<OpenAccountForm onSubmit={onSubmit} />);

    await user.click(screen.getByRole('button', { name: 'Revisar datos' }));

    expect(onSubmit).not.toHaveBeenCalled();
  });
});
