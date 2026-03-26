import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { Drawer } from '@/components/ui/Drawer';

afterEach(() => {
  document.body.style.overflow = '';
});

describe('Drawer', () => {
  it('no renderiza nada cuando isOpen es false', () => {
    render(
      <Drawer isOpen={false} onClose={vi.fn()} title="Test">
        <p>Contenido</p>
      </Drawer>,
    );

    expect(screen.queryByText('Contenido')).not.toBeInTheDocument();
  });

  it('renderiza titulo y contenido cuando isOpen es true', () => {
    render(
      <Drawer isOpen={true} onClose={vi.fn()} title="Mi Drawer">
        <p>Contenido visible</p>
      </Drawer>,
    );

    expect(screen.getByText('Mi Drawer')).toBeInTheDocument();
    expect(screen.getByText('Contenido visible')).toBeInTheDocument();
  });

  it('bloquea el scroll del body al abrirse', () => {
    render(
      <Drawer isOpen={true} onClose={vi.fn()} title="Test">
        <p>Hola</p>
      </Drawer>,
    );

    expect(document.body.style.overflow).toBe('hidden');
  });

  it('restaura el scroll del body al desmontarse', () => {
    const { unmount } = render(
      <Drawer isOpen={true} onClose={vi.fn()} title="Test">
        <p>Hola</p>
      </Drawer>,
    );

    unmount();

    expect(document.body.style.overflow).toBe('');
  });

  it('llama onClose al presionar Escape', async () => {
    const user = userEvent.setup({ delay: null });
    const onClose = vi.fn();

    render(
      <Drawer isOpen={true} onClose={onClose} title="Test">
        <p>Hola</p>
      </Drawer>,
    );

    await user.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('llama onClose al hacer click en el backdrop', async () => {
    const user = userEvent.setup({ delay: null });
    const onClose = vi.fn();

    render(
      <Drawer isOpen={true} onClose={onClose} title="Test">
        <p>Hola</p>
      </Drawer>,
    );

    const backdrop = document.querySelector('[aria-hidden="true"]') as HTMLElement;
    await user.click(backdrop);

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('llama onClose al hacer click en el boton X', async () => {
    const user = userEvent.setup({ delay: null });
    const onClose = vi.fn();

    render(
      <Drawer isOpen={true} onClose={onClose} title="Test">
        <p>Hola</p>
      </Drawer>,
    );

    const buttons = screen.getAllByRole('button');
    const closeButton = buttons.find((b) => b.querySelector('svg'));
    expect(closeButton).toBeTruthy();

    await user.click(closeButton!);

    expect(onClose).toHaveBeenCalledOnce();
  });
});
