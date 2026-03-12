import { DomainEvent } from '../../domain/DomainEvent';
import { StoredEvent } from './StoredEvent';

/**
 * Deserializador de eventos.
 * Convierte StoredEvent (JSON persistido) de vuelta a instancias de DomainEvent tipadas.
 */
export interface EventDeserializer {
  deserialize(stored: StoredEvent): DomainEvent;
}
