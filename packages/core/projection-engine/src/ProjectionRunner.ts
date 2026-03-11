import { inject, injectable } from 'tsyringe';
import type { IEventStore, IProjection, StoredEvent } from '@bank/shared';
import { DrizzleProjectionCheckpoint } from './DrizzleProjectionCheckpoint';

/**
 * Motor de proyecciones catch-up.
 *
 * Lee eventos desde la ultima posicion procesada (checkpoint) y los pasa
 * a cada proyeccion registrada. Tras procesar cada batch, guarda el checkpoint.
 *
 * Uso:
 *   runner.register(accountListProjection);
 *   await runner.runOnce(); // procesar batch actual
 *   runner.startPolling(1000); // o polling continuo
 */
@injectable()
export class ProjectionRunner {
  private projections: IProjection[] = [];
  private pollingInterval: ReturnType<typeof setInterval> | null = null;

  constructor(
    @inject('IEventStore') private readonly eventStore: IEventStore,
    private readonly checkpoint: DrizzleProjectionCheckpoint,
  ) {}

  register(projection: IProjection): void {
    this.projections.push(projection);
  }

  /**
   * Procesa un batch de eventos para todas las proyecciones registradas.
   * @param batchSize Cantidad maxima de eventos a leer por batch.
   */
  async runOnce(batchSize: number = 100): Promise<number> {
    let totalProcessed = 0;

    for (const projection of this.projections) {
      const lastPosition = await this.checkpoint.getLastPosition(projection.projectionName);
      const events = await this.eventStore.readAllFromPosition(lastPosition, batchSize);

      for (const event of events) {
        await projection.handle(event);
        await this.checkpoint.savePosition(projection.projectionName, event.globalPosition);
      }

      totalProcessed += events.length;
    }

    return totalProcessed;
  }

  /** Inicia polling periodico para proyecciones. */
  startPolling(intervalMs: number = 1000, batchSize: number = 100): void {
    this.stopPolling();
    this.pollingInterval = setInterval(() => {
      this.runOnce(batchSize).catch(console.error);
    }, intervalMs);
  }

  stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }
}
