import { eq } from 'drizzle-orm';
import type { IEventStore, StoredEvent } from '@bank/shared';
import type { WriteDrizzleProvider } from '@bank/event-store';
import type { RabbitMQConnection } from './RabbitMQConnection';
import { outboxCheckpoint } from './schemas/outboxCheckpoint';

const EXCHANGE_NAME = 'bank.events';

export interface OutboxRelayConfig {
  readonly batchSize?: number;
  readonly pollIntervalMs?: number;
}

/**
 * Outbox Relay — Polling Publisher.
 *
 * Lee eventos nuevos del Event Store (tabla events con global_position)
 * y los publica al exchange de RabbitMQ. El Event Store actúa como outbox:
 * los eventos ya están persistidos atómicamente, el relay garantiza
 * entrega eventual al broker.
 *
 * Checkpoint: registra la última posición publicada para evitar re-envíos
 * tras reinicio. Almacenado en la Write DB (misma que el Event Store).
 *
 * Publisher Confirms: usa ConfirmChannel para garantizar que RabbitMQ
 * recibió cada batch antes de avanzar el checkpoint.
 */
export class OutboxRelay {
  private running = false;
  private timer: ReturnType<typeof setInterval> | null = null;
  private lastPosition = 0;

  constructor(
    private readonly eventStore: IEventStore,
    private readonly connection: RabbitMQConnection,
    private readonly writeProvider: WriteDrizzleProvider,
    private readonly config: OutboxRelayConfig = {},
  ) {}

  async start(): Promise<void> {
    if (this.running) return;
    this.running = true;

    // Declarar exchange (idempotente)
    const channel = this.connection.getChannel();
    await channel.assertExchange(EXCHANGE_NAME, 'topic', { durable: true });

    await this.loadCheckpoint();

    const interval = this.config.pollIntervalMs ?? 1_000;
    this.timer = setInterval(() => {
      if (this.running) void this.poll();
    }, interval);

    // Procesar inmediatamente al arrancar
    await this.poll();
  }

  async stop(): Promise<void> {
    this.running = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  /** Procesa un batch de eventos. Retorna la cantidad publicada. */
  async poll(): Promise<number> {
    if (!this.connection.isConnected()) return 0;

    const batchSize = this.config.batchSize ?? 100;
    const storedEvents = await this.eventStore.readAllFromPosition(this.lastPosition, batchSize);
    if (storedEvents.length === 0) return 0;

    const channel = this.connection.getChannel();

    for (const event of storedEvents) {
      const payload = this.serialize(event);
      channel.publish(EXCHANGE_NAME, event.eventType, payload, {
        persistent: true,
        contentType: 'application/json',
        headers: {
          globalPosition: event.globalPosition,
          streamId: event.streamId,
          eventType: event.eventType,
        },
      });
    }

    // Esperar confirmación de RabbitMQ para todo el batch
    await channel.waitForConfirms();

    const newPosition = storedEvents[storedEvents.length - 1].globalPosition;
    await this.saveCheckpoint(newPosition);
    this.lastPosition = newPosition;

    return storedEvents.length;
  }

  getLastPosition(): number {
    return this.lastPosition;
  }

  private serialize(event: StoredEvent): Buffer {
    return Buffer.from(JSON.stringify({
      globalPosition: event.globalPosition,
      streamId: event.streamId,
      streamVersion: event.streamVersion,
      eventType: event.eventType,
      data: event.data,
      metadata: event.metadata,
      occurredOn: event.occurredOn,
    }));
  }

  private async loadCheckpoint(): Promise<void> {
    const rows = await this.writeProvider.db
      .select()
      .from(outboxCheckpoint)
      .where(eq(outboxCheckpoint.id, 'outbox'));

    this.lastPosition = rows.length > 0 ? rows[0].lastPosition : 0;
  }

  private async saveCheckpoint(position: number): Promise<void> {
    await this.writeProvider.db
      .insert(outboxCheckpoint)
      .values({ id: 'outbox', lastPosition: position, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: outboxCheckpoint.id,
        set: { lastPosition: position, updatedAt: new Date() },
      });
  }
}
