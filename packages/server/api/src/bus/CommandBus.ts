import type { DependencyContainer } from 'tsyringe';
import type { ICommandBus, ICommand, ICommandMiddleware, ICommandHandler } from '@bank/shared';

/**
 * Implementación del CommandBus con pipeline de middlewares.
 * Resuelve handlers del contenedor DI por token.
 */
export class CommandBus implements ICommandBus {
  private readonly handlers = new Map<string, string>();
  private readonly middlewares: ICommandMiddleware[] = [];

  constructor(private readonly container: DependencyContainer) {}

  /** Asocia un nombre de comando con el token DI de su handler. */
  register(commandName: string, handlerToken: string): void {
    if (this.handlers.has(commandName)) {
      throw new Error(`Handler ya registrado para el comando: ${commandName}`);
    }
    this.handlers.set(commandName, handlerToken);
  }

  /** Agrega un middleware al pipeline. Se ejecutan en orden FIFO. */
  use(middleware: ICommandMiddleware): void {
    this.middlewares.push(middleware);
  }

  async dispatch<TResult = void>(command: ICommand): Promise<TResult> {
    const handlerToken = this.handlers.get(command.commandName);
    if (!handlerToken) {
      throw new Error(`No hay handler registrado para el comando: ${command.commandName}`);
    }

    const handler = this.container.resolve<ICommandHandler<ICommand, TResult>>(handlerToken);

    const executeHandler = () => handler.execute(command) as Promise<unknown>;

    const chain = this.middlewares.reduceRight<() => Promise<unknown>>(
      (next, middleware) => () => middleware.execute(command, next),
      executeHandler,
    );

    return chain() as Promise<TResult>;
  }
}
