import type { ICommand } from './ICommand';

/**
 * Bus de comandos (CQRS — lado de escritura).
 * Despacha comandos a sus handlers a través de un pipeline de middlewares.
 */
export interface ICommandBus {
  dispatch<TResult = void>(command: ICommand): Promise<TResult>;
}
