import { DomainEvent } from '../domain/DomainEvent';

/**
 * Handler de evento de dominio.
 * Usado por proyecciones, sagas y procesos reactivos.
 */
export interface IEventHandler<TEvent extends DomainEvent = DomainEvent> {
  handle(event: TEvent): Promise<void>;
}
