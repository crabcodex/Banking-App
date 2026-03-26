import type { ICommand } from './ICommand';

/** Función que invoca al siguiente middleware en la cadena. */
export type NextMiddleware = () => Promise<unknown>;

/**
 * Middleware del pipeline de comandos.
 * Patrón Chain of Responsibility: cada middleware decide si llama al siguiente.
 */
export interface ICommandMiddleware {
  execute(command: ICommand, next: NextMiddleware): Promise<unknown>;
}
