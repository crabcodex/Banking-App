import { inject, injectable } from 'tsyringe';
import { eq } from 'drizzle-orm';
import { DrizzleProvider } from '@bank/event-store';
import { schemas } from '@bank/event-store';
const { projectionCheckpoints } = schemas;

/**
 * Almacena el checkpoint (ultima posicion global procesada) de cada proyeccion.
 * Usa Drizzle sobre PGlite.
 */
@injectable()
export class DrizzleProjectionCheckpoint {
  constructor(@inject('DrizzleProvider') private readonly provider: DrizzleProvider) {}

  async getLastPosition(projectionName: string): Promise<number> {
    const rows = await this.provider.db
      .select({ lastPosition: projectionCheckpoints.lastPosition })
      .from(projectionCheckpoints)
      .where(eq(projectionCheckpoints.projectionName, projectionName));

    return rows.length > 0 ? rows[0].lastPosition : 0;
  }

  async savePosition(projectionName: string, position: number): Promise<void> {
    await this.provider.db
      .insert(projectionCheckpoints)
      .values({ projectionName, lastPosition: position })
      .onConflictDoUpdate({
        target: projectionCheckpoints.projectionName,
        set: { lastPosition: position, updatedAt: new Date() },
      });
  }
}
