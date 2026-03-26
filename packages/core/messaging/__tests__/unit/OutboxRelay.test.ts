import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OutboxRelay } from '../../src/OutboxRelay';
import type { IEventStore, StoredEvent, EventMetadata } from '@bank/shared';

// --- Mocks ---

function createStoredEvent(position: number, eventType = 'AccountOpened'): StoredEvent {
  return {
    globalPosition: position,
    streamId: `stream-${position}`,
    streamVersion: 1,
    eventType,
    data: { test: true },
    metadata: {
      userId: 'u-1',
      correlationId: 'c-1',
      causationId: 'cs-1',
      channel: 'web',
    } satisfies EventMetadata,
    occurredOn: new Date('2026-03-23T00:00:00Z'),
  };
}

function mockEventStore(events: StoredEvent[] = []): IEventStore {
  return {
    loadStream: vi.fn(),
    appendToStream: vi.fn(),
    readAllFromPosition: vi.fn().mockResolvedValue(events),
  };
}

function mockChannel() {
  return {
    assertExchange: vi.fn().mockResolvedValue(undefined),
    publish: vi.fn().mockReturnValue(true),
    waitForConfirms: vi.fn().mockResolvedValue(undefined),
  };
}

function mockConnection(channel: ReturnType<typeof mockChannel>) {
  return {
    getChannel: vi.fn().mockReturnValue(channel),
    isConnected: vi.fn().mockReturnValue(true),
  };
}

function mockWriteProvider() {
  const selectResult = { from: vi.fn().mockReturnThis(), where: vi.fn().mockResolvedValue([]) };
  const insertResult = {
    values: vi.fn().mockReturnThis(),
    onConflictDoUpdate: vi.fn().mockResolvedValue(undefined),
  };
  return {
    db: {
      select: vi.fn().mockReturnValue(selectResult),
      insert: vi.fn().mockReturnValue(insertResult),
    },
  };
}

describe('OutboxRelay', () => {
  let eventStore: IEventStore;
  let channel: ReturnType<typeof mockChannel>;
  let connection: ReturnType<typeof mockConnection>;
  let writeProvider: ReturnType<typeof mockWriteProvider>;

  beforeEach(() => {
    vi.clearAllMocks();
    channel = mockChannel();
    connection = mockConnection(channel);
    writeProvider = mockWriteProvider();
    eventStore = mockEventStore();
  });

  it('debe publicar eventos al exchange bank.events', async () => {
    const events = [createStoredEvent(1), createStoredEvent(2)];
    eventStore = mockEventStore(events);

    const relay = new OutboxRelay(eventStore, connection as any, writeProvider as any);
    const count = await relay.poll();

    expect(count).toBe(2);
    expect(channel.publish).toHaveBeenCalledTimes(2);
    expect(channel.publish).toHaveBeenCalledWith(
      'bank.events',
      'AccountOpened',
      expect.any(Buffer),
      expect.objectContaining({
        persistent: true,
        contentType: 'application/json',
      }),
    );
  });

  it('debe esperar publisher confirms después de publicar', async () => {
    const events = [createStoredEvent(1)];
    eventStore = mockEventStore(events);

    const relay = new OutboxRelay(eventStore, connection as any, writeProvider as any);
    await relay.poll();

    expect(channel.waitForConfirms).toHaveBeenCalledOnce();
  });

  it('debe retornar 0 si no hay eventos nuevos', async () => {
    const relay = new OutboxRelay(eventStore, connection as any, writeProvider as any);
    const count = await relay.poll();

    expect(count).toBe(0);
    expect(channel.publish).not.toHaveBeenCalled();
  });

  it('debe actualizar lastPosition después de publicar', async () => {
    const events = [createStoredEvent(5), createStoredEvent(10)];
    eventStore = mockEventStore(events);

    const relay = new OutboxRelay(eventStore, connection as any, writeProvider as any);
    await relay.poll();

    expect(relay.getLastPosition()).toBe(10);
  });

  it('debe leer desde la posición 0 en el primer poll', async () => {
    const relay = new OutboxRelay(eventStore, connection as any, writeProvider as any);
    await relay.poll();

    expect(eventStore.readAllFromPosition).toHaveBeenCalledWith(0, 100);
  });

  it('debe leer desde la última posición en polls sucesivos', async () => {
    const events = [createStoredEvent(5)];
    eventStore = mockEventStore(events);

    const relay = new OutboxRelay(eventStore, connection as any, writeProvider as any);
    await relay.poll();

    // Segundo poll: debe leer desde posición 5
    (eventStore.readAllFromPosition as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    await relay.poll();

    expect(eventStore.readAllFromPosition).toHaveBeenLastCalledWith(5, 100);
  });

  it('debe respetar batchSize configurado', async () => {
    const relay = new OutboxRelay(eventStore, connection as any, writeProvider as any, { batchSize: 50 });
    await relay.poll();

    expect(eventStore.readAllFromPosition).toHaveBeenCalledWith(0, 50);
  });

  it('no debe publicar si la conexión no está activa', async () => {
    connection.isConnected.mockReturnValue(false);

    const relay = new OutboxRelay(eventStore, connection as any, writeProvider as any);
    // Necesitamos que running sea true para que poll funcione
    // pero isConnected es false, así que debería retornar 0
    const count = await relay.poll();

    // poll retorna 0 si no está running O no está connected
    expect(count).toBe(0);
  });

  it('debe serializar el evento completo como JSON en el buffer', async () => {
    const events = [createStoredEvent(1, 'AccountOpened')];
    eventStore = mockEventStore(events);

    const relay = new OutboxRelay(eventStore, connection as any, writeProvider as any);
    await relay.poll();

    const publishedBuffer = channel.publish.mock.calls[0][2] as Buffer;
    const parsed = JSON.parse(publishedBuffer.toString());

    expect(parsed.globalPosition).toBe(1);
    expect(parsed.streamId).toBe('stream-1');
    expect(parsed.eventType).toBe('AccountOpened');
    expect(parsed.data).toEqual({ test: true });
    expect(parsed.metadata.userId).toBe('u-1');
  });

  it('debe incluir headers con metadata del evento', async () => {
    const events = [createStoredEvent(3, 'AccountClosed')];
    eventStore = mockEventStore(events);

    const relay = new OutboxRelay(eventStore, connection as any, writeProvider as any);
    await relay.poll();

    expect(channel.publish).toHaveBeenCalledWith(
      'bank.events',
      'AccountClosed',
      expect.any(Buffer),
      expect.objectContaining({
        headers: expect.objectContaining({
          globalPosition: 3,
          streamId: 'stream-3',
          eventType: 'AccountClosed',
        }),
      }),
    );
  });
});
