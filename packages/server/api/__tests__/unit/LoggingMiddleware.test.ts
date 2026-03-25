import { describe, it, expect, vi } from 'vitest';
import { LoggingMiddleware } from '../../src/bus/middleware/LoggingMiddleware';
import type { ICommand } from '@bank/shared';

function createCommand(): ICommand {
  return {
    commandName: 'TestCommand',
    commandId: 'cmd-456',
    metadata: {
      userId: 'user-1',
      correlationId: 'corr-1',
      causationId: 'caus-1',
      channel: 'web' as const,
      timestamp: new Date(),
    },
  };
}

function createLogger() {
  return { info: vi.fn(), error: vi.fn() } as any;
}

describe('LoggingMiddleware', () => {
  it('debe loguear comando recibido y éxito con duración', async () => {
    const logger = createLogger();
    const middleware = new LoggingMiddleware(logger);
    const next = vi.fn().mockResolvedValue({ id: '1' });

    const result = await middleware.execute(createCommand(), next);

    expect(result).toEqual({ id: '1' });
    expect(logger.info).toHaveBeenCalledTimes(2);
    expect(logger.info).toHaveBeenCalledWith(
      expect.objectContaining({ commandName: 'TestCommand', commandId: 'cmd-456' }),
      'Comando recibido',
    );
    expect(logger.info).toHaveBeenCalledWith(
      expect.objectContaining({
        commandName: 'TestCommand',
        commandId: 'cmd-456',
        durationMs: expect.any(Number),
      }),
      'Comando ejecutado exitosamente',
    );
  });

  it('debe loguear error cuando el handler falla', async () => {
    const logger = createLogger();
    const middleware = new LoggingMiddleware(logger);
    const next = vi.fn().mockRejectedValue(new Error('fallo crítico'));

    await expect(middleware.execute(createCommand(), next)).rejects.toThrow('fallo crítico');

    expect(logger.info).toHaveBeenCalledTimes(1);
    expect(logger.error).toHaveBeenCalledWith(
      expect.objectContaining({
        commandName: 'TestCommand',
        commandId: 'cmd-456',
        error: 'fallo crítico',
        durationMs: expect.any(Number),
      }),
      'Comando fallido',
    );
  });

  it('debe re-lanzar el error original sin modificarlo', async () => {
    const logger = createLogger();
    const middleware = new LoggingMiddleware(logger);
    const originalError = new Error('error original');
    const next = vi.fn().mockRejectedValue(originalError);

    try {
      await middleware.execute(createCommand(), next);
      expect.fail('Debería haber lanzado error');
    } catch (err) {
      expect(err).toBe(originalError);
    }
  });

  it('debe llamar a next exactamente una vez', async () => {
    const logger = createLogger();
    const middleware = new LoggingMiddleware(logger);
    const next = vi.fn().mockResolvedValue(undefined);

    await middleware.execute(createCommand(), next);

    expect(next).toHaveBeenCalledOnce();
  });
});
