import type { Logger } from 'pino';
import type { ICommand, ICommandMiddleware, NextMiddleware } from '@bank/shared';

/**
 * Middleware que registra la ejecución de cada comando con Pino.
 * Loguea: recepción, éxito (con duración) o fallo (con error y duración).
 */
export class LoggingMiddleware implements ICommandMiddleware {
  constructor(private readonly logger: Logger) {}

  async execute(command: ICommand, next: NextMiddleware): Promise<unknown> {
    const start = performance.now();

    this.logger.info(
      { commandName: command.commandName, commandId: command.commandId },
      'Comando recibido',
    );

    try {
      const result = await next();
      const durationMs = Math.round(performance.now() - start);

      this.logger.info(
        { commandName: command.commandName, commandId: command.commandId, durationMs },
        'Comando ejecutado exitosamente',
      );

      return result;
    } catch (error) {
      const durationMs = Math.round(performance.now() - start);

      this.logger.error(
        {
          commandName: command.commandName,
          commandId: command.commandId,
          error: error instanceof Error ? error.message : String(error),
          durationMs,
        },
        'Comando fallido',
      );

      throw error;
    }
  }
}
