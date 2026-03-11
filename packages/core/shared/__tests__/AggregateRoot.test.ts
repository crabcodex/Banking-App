import { describe, it, expect } from 'vitest';
import { DomainEvent } from '../src/domain/DomainEvent';
import { AggregateRoot, AggregateSnapshot } from '../src/domain/AggregateRoot';
import { EventMetadata } from '../src/domain/types';

// -- Fixtures de prueba --

class TestEvent extends DomainEvent {
  constructor(aggregateId: string, data: Record<string, unknown>, metadata: EventMetadata) {
    super('TestEvent', aggregateId, data, metadata);
  }
}

class TestAggregate extends AggregateRoot<TestEvent> {
  public name = '';
  public counter = 0;

  static create(id: string, name: string, metadata: EventMetadata): TestAggregate {
    const agg = new TestAggregate();
    agg.apply(new TestEvent(id, { name }, metadata));
    return agg;
  }

  increment(id: string, metadata: EventMetadata): void {
    this.apply(new TestEvent(id, { increment: true }, metadata));
  }

  protected when(event: TestEvent): void {
    if (event.data['name']) {
      this.name = event.data['name'] as string;
    }
    if (event.data['increment']) {
      this.counter++;
    }
  }

  takeSnapshot(): AggregateSnapshot {
    return {
      aggregateId: 'test-id',
      version: this.version,
      state: { name: this.name, counter: this.counter },
    };
  }

  restoreFromSnapshot(snapshot: AggregateSnapshot): void {
    this.name = snapshot.state['name'] as string;
    this.counter = snapshot.state['counter'] as number;
    this.setVersion(snapshot.version);
  }
}

const testMetadata: EventMetadata = {
  correlationId: 'corr-1',
  causationId: 'caus-1',
  userId: 'user-1',
  channel: 'web',
};

// -- Tests --

describe('AggregateRoot', () => {
  it('debe registrar eventos no confirmados al aplicar', () => {
    const agg = TestAggregate.create('agg-1', 'Test', testMetadata);
    expect(agg.uncommittedEvents).toHaveLength(1);
    expect(agg.name).toBe('Test');
  });

  it('debe limpiar eventos no confirmados', () => {
    const agg = TestAggregate.create('agg-1', 'Test', testMetadata);
    agg.clearUncommittedEvents();
    expect(agg.uncommittedEvents).toHaveLength(0);
  });

  it('debe reconstruir estado desde historial', () => {
    const events = [
      new TestEvent('agg-1', { name: 'Loaded' }, testMetadata),
      new TestEvent('agg-1', { increment: true }, testMetadata),
      new TestEvent('agg-1', { increment: true }, testMetadata),
    ];

    const agg = new TestAggregate();
    agg.loadFromHistory(events, 3);

    expect(agg.name).toBe('Loaded');
    expect(agg.counter).toBe(2);
    expect(agg.version).toBe(3);
    expect(agg.uncommittedEvents).toHaveLength(0);
  });

  it('debe generar y restaurar snapshot', () => {
    const agg = TestAggregate.create('agg-1', 'Snap', testMetadata);
    agg.increment('agg-1', testMetadata);
    agg.increment('agg-1', testMetadata);

    const snapshot = agg.takeSnapshot();

    const restored = new TestAggregate();
    restored.restoreFromSnapshot(snapshot);

    expect(restored.name).toBe('Snap');
    expect(restored.counter).toBe(2);
  });
});
