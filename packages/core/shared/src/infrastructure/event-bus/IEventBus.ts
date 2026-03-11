import { DomainEvent } from '../../domain/DomainEvent';

/**
 * Bus de eventos en memoria (proceso local).
 * Permite desacoplar la publicacion de eventos de sus consumidores.
 */
export interface IEventBus {
  publish(events: DomainEvent[]): Promise<void>;
  subscribe(eventType: string, handler: (event: DomainEvent) => Promise<void>): void;
}
