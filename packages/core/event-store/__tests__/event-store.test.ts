import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DrizzleProvider } from '../src/DrizzleProvider';
import { DrizzleEventStore } from '../src/DrizzleEventStore';
import { DrizzleSnapshotStore } from '../src/DrizzleSnapshotStore';
import { InMemoryEventBus } from '../src/InMemoryEventBus';
import { DomainEvent } from '@bank/shared';
import type { EventMetadata, AggregateSnapshot } from '@bank/shared';

// -- Fixture --

class AccountOpened extends DomainEvent {
  constructor(aggregateId: string, data: Record<string, unknown>, metadata: EventMetadata) {
    super('AccountOpened', aggregateId, data, metadata);
  }
}

class MoneyDeposited extends DomainEvent {
  constructor(aggregateId: string, data: Record<string, unknown>, metadata: EventMetadata) {
    super('MoneyDeposited', aggregateId, data, metadata);
  }
}

const meta: EventMetadata = {
  correlationId: 'c-1',
  causationId: 'cs-1',
  userId: 'u-1',
  channel: 'web',
};

// -- Tests --

describe('DrizzleEventStore', () => {
  let provider: DrizzleProvider;
  let store: DrizzleEventStore;

  beforeEach(async () => {
    provider = new DrizzleProvider();
    await provider.initialize(); // en memoria
    store = new DrizzleEventStore(provider);
  });

  afterEach(async () => {
    await provider.close();
  });

  it('debe cargar stream vacio con version -1', async () => {
    const result = await store.loadStream('no-existe');
    expect(result.events).toHaveLength(0);
    expect(result.version).toBe(-1);
  });

  it('debe persistir eventos y cargar stream', async () => {
    const events = [
      new AccountOpened('acc-1', { currency: 'USD' }, meta),
      new MoneyDeposited('acc-1', { amount: 1000 }, meta),
    ];

    await store.appendToStream('acc-1', events, -1);
    const stream = await store.loadStream('acc-1');

    expect(stream.events).toHaveLength(2);
    expect(stream.version).toBe(1);
    expect(stream.events[0].eventType).toBe('AccountOpened');
    expect(stream.events[1].eventType).toBe('MoneyDeposited');
  });

  it('debe lanzar ConcurrencyError en conflicto de version', async () => {
    await store.appendToStream('acc-1', [new AccountOpened('acc-1', {}, meta)], -1);

    await expect(
      store.appendToStream('acc-1', [new MoneyDeposited('acc-1', { amount: 500 }, meta)], -1),
    ).rejects.toThrow('Conflicto de concurrencia');
  });

  it('debe leer eventos globalmente por posicion', async () => {
    await store.appendToStream('acc-1', [new AccountOpened('acc-1', {}, meta)], -1);
    await store.appendToStream('acc-2', [new AccountOpened('acc-2', {}, meta)], -1);

    const all = await store.readAllFromPosition(0, 100);
    expect(all).toHaveLength(2);
    expect(all[0].streamId).toBe('acc-1');
    expect(all[1].streamId).toBe('acc-2');
  });
});

describe('DrizzleSnapshotStore', () => {
  let provider: DrizzleProvider;
  let snapStore: DrizzleSnapshotStore;

  beforeEach(async () => {
    provider = new DrizzleProvider();
    await provider.initialize();
    snapStore = new DrizzleSnapshotStore(provider);
  });

  afterEach(async () => {
    await provider.close();
  });

  it('debe retornar null si no hay snapshot', async () => {
    const result = await snapStore.load('no-existe');
    expect(result).toBeNull();
  });

  it('debe guardar y cargar snapshot', async () => {
    const snapshot: AggregateSnapshot = {
      aggregateId: 'acc-1',
      version: 10,
      state: { balance: 5000, currency: 'USD' },
    };

    await snapStore.save(snapshot);
    const loaded = await snapStore.load('acc-1');

    expect(loaded).not.toBeNull();
    expect(loaded!.version).toBe(10);
    expect(loaded!.state).toEqual({ balance: 5000, currency: 'USD' });
  });

  it('debe hacer upsert al guardar snapshot existente', async () => {
    await snapStore.save({ aggregateId: 'acc-1', version: 5, state: { balance: 100 } });
    await snapStore.save({ aggregateId: 'acc-1', version: 10, state: { balance: 500 } });

    const loaded = await snapStore.load('acc-1');
    expect(loaded!.version).toBe(10);
    expect(loaded!.state).toEqual({ balance: 500 });
  });
});

describe('InMemoryEventBus', () => {
  it('debe entregar eventos a suscriptores', async () => {
    const bus = new InMemoryEventBus();
    const received: string[] = [];

    bus.subscribe('AccountOpened', async (event) => {
      received.push(event.aggregateId);
    });

    await bus.publish([new AccountOpened('acc-1', {}, meta)]);

    expect(received).toEqual(['acc-1']);
  });

  it('no debe fallar si no hay suscriptores', async () => {
    const bus = new InMemoryEventBus();
    await expect(bus.publish([new AccountOpened('acc-1', {}, meta)])).resolves.not.toThrow();
  });
});
