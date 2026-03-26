import { describe, it, expect, vi } from 'vitest';
import { container } from 'tsyringe';
import { CommandBus } from '../../src/bus/CommandBus';
import type { ICommand, ICommandMiddleware } from '@bank/shared';

function createCommand(overrides: Partial<ICommand> = {}): ICommand {
  return {
    commandName: 'TestCommand',
    commandId: 'cmd-123',
    metadata: {
      userId: 'user-1',
      correlationId: 'corr-1',
      causationId: 'caus-1',
      channel: 'web' as const,
      timestamp: new Date(),
    },
    ...overrides,
  };
}

describe('CommandBus', () => {
  it('debe despachar un comando al handler correcto', async () => {
    const child = container.createChildContainer();
    const handler = { execute: vi.fn().mockResolvedValue({ ok: true }) };
    child.register('TestHandler', { useValue: handler });

    const bus = new CommandBus(child);
    bus.register('TestCommand', 'TestHandler');

    const result = await bus.dispatch<{ ok: boolean }>(createCommand());

    expect(result).toEqual({ ok: true });
    expect(handler.execute).toHaveBeenCalledOnce();
  });

  it('debe lanzar error si no hay handler registrado', async () => {
    const bus = new CommandBus(container.createChildContainer());

    await expect(bus.dispatch(createCommand({ commandName: 'Unknown' })))
      .rejects.toThrow('No hay handler registrado para el comando: Unknown');
  });

  it('debe lanzar error al registrar handler duplicado', () => {
    const bus = new CommandBus(container.createChildContainer());
    bus.register('TestCommand', 'TestHandler');

    expect(() => bus.register('TestCommand', 'AnotherHandler'))
      .toThrow('Handler ya registrado para el comando: TestCommand');
  });

  it('debe ejecutar middlewares en orden FIFO', async () => {
    const order: number[] = [];
    const child = container.createChildContainer();
    const handler = {
      execute: vi.fn().mockImplementation(async () => {
        order.push(3);
        return 'result';
      }),
    };
    child.register('TestHandler', { useValue: handler });

    const mw1: ICommandMiddleware = {
      execute: async (_cmd, next) => { order.push(1); return next(); },
    };
    const mw2: ICommandMiddleware = {
      execute: async (_cmd, next) => { order.push(2); return next(); },
    };

    const bus = new CommandBus(child);
    bus.use(mw1);
    bus.use(mw2);
    bus.register('TestCommand', 'TestHandler');

    await bus.dispatch(createCommand());

    expect(order).toEqual([1, 2, 3]);
  });

  it('middleware puede cortar la cadena sin llamar a next', async () => {
    const child = container.createChildContainer();
    const handler = { execute: vi.fn() };
    child.register('TestHandler', { useValue: handler });

    const shortCircuit: ICommandMiddleware = {
      execute: async () => ({ intercepted: true }),
    };

    const bus = new CommandBus(child);
    bus.use(shortCircuit);
    bus.register('TestCommand', 'TestHandler');

    const result = await bus.dispatch<{ intercepted: boolean }>(createCommand());

    expect(result).toEqual({ intercepted: true });
    expect(handler.execute).not.toHaveBeenCalled();
  });

  it('debe propagar errores del handler a través del pipeline', async () => {
    const child = container.createChildContainer();
    const handler = { execute: vi.fn().mockRejectedValue(new Error('handler error')) };
    child.register('TestHandler', { useValue: handler });

    const bus = new CommandBus(child);
    bus.register('TestCommand', 'TestHandler');

    await expect(bus.dispatch(createCommand())).rejects.toThrow('handler error');
  });

  it('debe pasar el comando correcto al handler', async () => {
    const child = container.createChildContainer();
    const handler = { execute: vi.fn().mockResolvedValue(undefined) };
    child.register('TestHandler', { useValue: handler });

    const bus = new CommandBus(child);
    bus.register('TestCommand', 'TestHandler');

    const command = createCommand();
    await bus.dispatch(command);

    expect(handler.execute).toHaveBeenCalledWith(command);
  });
});
