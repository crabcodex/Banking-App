import { describe, it, expect } from 'vitest';
import { DomainEvent } from '../src/domain/DomainEvent';
import { EventMetadata } from '../src/domain/types';

class AccountOpened extends DomainEvent {
  constructor(aggregateId: string, data: Record<string, unknown>, metadata: EventMetadata) {
    super('AccountOpened', aggregateId, data, metadata);
  }
}

describe('DomainEvent', () => {
  const metadata: EventMetadata = {
    correlationId: 'c-1',
    causationId: 'cs-1',
    userId: 'u-1',
    channel: 'web',
  };

  it('debe crear evento con tipo, aggregateId y data', () => {
    const event = new AccountOpened('acc-1', { currency: 'USD' }, metadata);

    expect(event.eventType).toBe('AccountOpened');
    expect(event.aggregateId).toBe('acc-1');
    expect(event.data).toEqual({ currency: 'USD' });
    expect(event.occurredOn).toBeInstanceOf(Date);
  });

  it('debe incluir metadata completa', () => {
    const event = new AccountOpened('acc-1', {}, metadata);

    expect(event.metadata.correlationId).toBe('c-1');
    expect(event.metadata.userId).toBe('u-1');
    expect(event.metadata.channel).toBe('web');
  });
});
