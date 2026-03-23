import type { EventMetadata } from '../domain/types';

/** Metadatos que acompañan a todo comando. Extiende EventMetadata con timestamp. */
export interface CommandMetadata extends EventMetadata {
  readonly timestamp: Date;
}

/**
 * Contrato base para todos los comandos del sistema.
 * Cada comando transporta nombre, id de idempotencia y metadatos.
 */
export interface ICommand {
  readonly commandName: string;
  readonly commandId: string;
  readonly metadata: CommandMetadata;
}
