import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { WriteDrizzleProvider, DrizzleEventStore, DrizzleSnapshotStore } from '@bank/event-store';
import { ReadDrizzleProvider } from '@bank/projection-engine';
import { OpenAccountHandler } from '../../src/application/commands/OpenAccountHandler';
import { SearchAccountsHandler } from '../../src/application/queries/SearchAccountsHandler';
import { AccountFactory } from '../../src/domain/AccountFactory';
import { EventStoreAccountRepository } from '../../src/infrastructure/persistence/EventStoreAccountRepository';
import { DrizzleAccountReadRepository } from '../../src/infrastructure/persistence/DrizzleAccountReadRepository';
import { RandomCLABEGenerator } from '../../src/infrastructure/services/RandomCLABEGenerator';
import { StubCustomerActiveSpec } from '../../src/infrastructure/specifications/StubCustomerActiveSpec';
import { ReadModelMaxAccountsSpec } from '../../src/infrastructure/specifications/ReadModelMaxAccountsSpec';
import { AccountListProjection } from '../../src/infrastructure/projections/AccountListProjection';
import { migrateAccountsReadModel } from '../../src/infrastructure/initializeReadModel';
import type { CommandMetadata } from '@bank/shared';
import type { OpenAccountCommand } from '../../src/application/commands/OpenAccountCommand';
import type { SearchAccountsQuery } from '../../src/application/queries/SearchAccountsQuery';

const meta: CommandMetadata = {
  correlationId: 'corr-search-1',
  causationId: 'cause-search-1',
  userId: 'user-search-1',
  channel: 'web',
  timestamp: new Date(),
};

describe('SearchAccounts — Flujo de integración', () => {
  let writeProvider: WriteDrizzleProvider;
  let readProvider: ReadDrizzleProvider;
  let openHandler: OpenAccountHandler;
  let searchHandler: SearchAccountsHandler;
  let projection: AccountListProjection;

  beforeEach(async () => {
    writeProvider = new WriteDrizzleProvider();
    await writeProvider.initialize();

    readProvider = new ReadDrizzleProvider();
    await readProvider.initialize();

    await migrateAccountsReadModel(readProvider);

    const eventStore = new DrizzleEventStore(writeProvider);
    const snapshotStore = new DrizzleSnapshotStore(writeProvider);
    const repository = new EventStoreAccountRepository(eventStore, snapshotStore);

    const clabeGen = new RandomCLABEGenerator();
    const customerSpec = new StubCustomerActiveSpec();
    const maxAccountsSpec = new ReadModelMaxAccountsSpec(readProvider);
    const factory = new AccountFactory(customerSpec, maxAccountsSpec, clabeGen);

    openHandler = new OpenAccountHandler(factory, repository);
    projection = new AccountListProjection(readProvider);

    const readRepo = new DrizzleAccountReadRepository(readProvider);
    searchHandler = new SearchAccountsHandler(readRepo);
  });

  afterEach(async () => {
    await writeProvider.close();
    await readProvider.close();
  });

  async function openAndProject(overrides: Partial<OpenAccountCommand> = {}) {
    const command: OpenAccountCommand = {
      commandName: 'OpenAccount',
      commandId: `cmd-${Date.now()}-${Math.random()}`,
      customerId: 'cust-1',
      type: 'AHORRO',
      currency: 'MXN',
      alias: 'Test',
      initialBalance: 1000,
      metadata: meta,
      ...overrides,
    };

    const result = await openHandler.execute(command);

    const eventStore = new DrizzleEventStore(writeProvider);
    const stored = await eventStore.readAllFromPosition(0, 1000);
    for (const event of stored) {
      await projection.handle(event);
    }

    return result;
  }

  it('debe encontrar cuentas por customerId', async () => {
    await openAndProject({ customerId: 'cust-1', alias: 'Cuenta 1' });
    await openAndProject({ customerId: 'cust-2', alias: 'Cuenta 2' });

    const query: SearchAccountsQuery = {
      queryName: 'SearchAccounts',
      criteria: {
        filters: [{ field: 'customerId', operator: 'EQUALS', value: 'cust-1' }],
        limit: 20,
        offset: 0,
      },
    };

    const result = await searchHandler.execute(query);

    expect(result.items).toHaveLength(1);
    expect(result.items[0].customerId).toBe('cust-1');
    expect(result.total).toBe(1);
  });

  it('debe filtrar por tipo de cuenta con operador IN', async () => {
    await openAndProject({ customerId: 'cust-1', type: 'AHORRO', alias: 'Ahorro' });
    await openAndProject({ customerId: 'cust-1', type: 'CHEQUES', alias: 'Cheques', initialBalance: 5000 });

    const query: SearchAccountsQuery = {
      queryName: 'SearchAccounts',
      criteria: {
        filters: [
          { field: 'customerId', operator: 'EQUALS', value: 'cust-1' },
          { field: 'type', operator: 'IN', value: ['AHORRO'] },
        ],
        limit: 20,
        offset: 0,
      },
    };

    const result = await searchHandler.execute(query);

    expect(result.items).toHaveLength(1);
    expect(result.items[0].type).toBe('AHORRO');
  });

  it('debe respetar limit y offset para paginación', async () => {
    await openAndProject({ customerId: 'cust-1', alias: 'Cuenta A' });
    await openAndProject({ customerId: 'cust-1', alias: 'Cuenta B' });
    await openAndProject({ customerId: 'cust-1', alias: 'Cuenta C' });

    const query: SearchAccountsQuery = {
      queryName: 'SearchAccounts',
      criteria: {
        filters: [{ field: 'customerId', operator: 'EQUALS', value: 'cust-1' }],
        limit: 2,
        offset: 0,
      },
    };

    const result = await searchHandler.execute(query);

    expect(result.items).toHaveLength(2);
    expect(result.total).toBe(3);
    expect(result.limit).toBe(2);
    expect(result.offset).toBe(0);
  });

  it('debe retornar resultado vacío si no hay coincidencias', async () => {
    await openAndProject({ customerId: 'cust-1' });

    const query: SearchAccountsQuery = {
      queryName: 'SearchAccounts',
      criteria: {
        filters: [{ field: 'customerId', operator: 'EQUALS', value: 'no-existe' }],
        limit: 20,
        offset: 0,
      },
    };

    const result = await searchHandler.execute(query);

    expect(result.items).toHaveLength(0);
    expect(result.total).toBe(0);
  });

  it('debe rechazar campo de filtro no permitido', async () => {
    const query: SearchAccountsQuery = {
      queryName: 'SearchAccounts',
      criteria: {
        filters: [{ field: 'balance', operator: 'EQUALS', value: '1000' }],
        limit: 20,
        offset: 0,
      },
    };

    await expect(searchHandler.execute(query)).rejects.toThrow(/no es filtrable/);
  });
});
