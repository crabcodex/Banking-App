import type { EventDeserializer, StoredEvent, DomainEvent } from '@bank/shared';
import { AccountOpened } from '../domain/events/AccountOpened';
import type { AccountOpenedData } from '../domain/events/AccountOpened';

/**
 * Convierte StoredEvent (JSON del Event Store) a instancias tipadas de DomainEvent.
 * Crece con cada nuevo evento del agregado Account.
 */
export class AccountEventDeserializer implements EventDeserializer {
  deserialize(stored: StoredEvent): DomainEvent {
    switch (stored.eventType) {
      case 'AccountOpened':
        return new AccountOpened(
          stored.streamId,
          stored.data as unknown as AccountOpenedData,
          stored.metadata,
        );
      default:
        throw new Error(`Tipo de evento desconocido: ${stored.eventType}`);
    }
  }
}
