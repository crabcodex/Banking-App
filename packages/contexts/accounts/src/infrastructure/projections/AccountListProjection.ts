import { inject, injectable } from 'tsyringe';
import type { IProjection, StoredEvent } from '@bank/shared';
import type { ReadDrizzleProvider } from '@bank/projection-engine';
import { accountsReadModel } from '../schemas/accountsReadModel';

/**
 * Proyección: mantiene la tabla accounts_read sincronizada
 * a partir de los eventos del Event Store (catch-up polling).
 */
@injectable()
export class AccountListProjection implements IProjection {
  readonly projectionName = 'account-list';

  constructor(
    @inject('ReadDrizzleProvider') private readonly readProvider: ReadDrizzleProvider,
  ) {}

  async handle(event: StoredEvent): Promise<void> {
    switch (event.eventType) {
      case 'AccountOpened': {
        const d = event.data;
        await this.readProvider.db.insert(accountsReadModel).values({
          id: event.streamId,
          customerId: d['customerId'] as string,
          type: d['type'] as string,
          clabe: d['clabe'] as string,
          currency: d['currency'] as string,
          balance: String(d['balance']),
          dailyLimit: String(d['dailyLimit']),
          status: 'ACTIVE',
          alias: d['alias'] as string,
          openedAt: new Date(d['openedAt'] as string),
        }).onConflictDoNothing();
        break;
      }
    }
  }
}
