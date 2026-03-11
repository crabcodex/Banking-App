import { injectable } from 'tsyringe';
import type { IEventBus, DomainEvent } from '@bank/shared';

/**
 * Bus de eventos en memoria,mas adelante  reemplazar por Redis Streams.
 */
@injectable()
export class InMemoryEventBus implements IEventBus {
  private handlers = new Map<string, Array<(event: DomainEvent) => Promise<void>>>();

  async publish(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      const subscribers = this.handlers.get(event.eventType) ?? [];
      for (const handler of subscribers) {
        await handler(event);
      }
    }
  }

  subscribe(eventType: string, handler: (event: DomainEvent) => Promise<void>): void {
    const existing = this.handlers.get(eventType) ?? [];
    existing.push(handler);
    this.handlers.set(eventType, existing);
  }
}
