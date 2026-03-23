import { inject, injectable } from 'tsyringe';
import type { IEventStore, ISnapshotStore } from '@bank/shared';
import type { IAccountRepository } from '../domain/repositories/IAccountRepository';
import { Account } from '../domain/Account';
import { AccountEventDeserializer } from './AccountEventDeserializer';

/**
 * Repositorio de cuentas basado en Event Sourcing.
 * save()  → append eventos al stream.
 * findById() → reconstruye el agregado desde snapshot + eventos.
 */
@injectable()
export class EventStoreAccountRepository implements IAccountRepository {
  private readonly deserializer = new AccountEventDeserializer();

  constructor(
    @inject('IEventStore') private readonly eventStore: IEventStore,
    @inject('ISnapshotStore') private readonly snapshotStore: ISnapshotStore,
  ) {}

  async save(account: Account): Promise<void> {
    await this.eventStore.appendToStream(
      account.id,
      [...account.uncommittedEvents],
      account.version,
    );
    account.clearUncommittedEvents();
  }

  async findById(accountId: string): Promise<Account | null> {
    const stream = await this.eventStore.loadStream(accountId);
    if (stream.events.length === 0) return null;

    const account = new Account();
    const snapshot = await this.snapshotStore.load(accountId);

    if (snapshot) {
      account.restoreFromSnapshot(snapshot);
      const newEvents = stream.events
        .filter(e => e.streamVersion > snapshot.version)
        .map(e => this.deserializer.deserialize(e));
      if (newEvents.length > 0) {
        account.loadFromHistory(newEvents, stream.version);
      }
    } else {
      const deserialized = stream.events.map(e => this.deserializer.deserialize(e));
      account.loadFromHistory(deserialized, stream.version);
    }

    return account;
  }
}
