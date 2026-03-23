import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { WriteDrizzleProvider, DrizzleEventStore, DrizzleSnapshotStore } from '@bank/event-store';
import { ReadDrizzleProvider } from '@bank/projection-engine';
import { OpenAccountHandler } from '../../src/application/commands/OpenAccountHandler';
import { AccountFactory } from '../../src/domain/AccountFactory';
import { EventStoreAccountRepository } from '../../src/infrastructure/EventStoreAccountRepository';
import { RandomCLABEGenerator } from '../../src/infrastructure/RandomCLABEGenerator';
import { StubCustomerActiveSpec } from '../../src/infrastructure/StubCustomerActiveSpec';
import { ReadModelMaxAccountsSpec } from '../../src/infrastructure/ReadModelMaxAccountsSpec';
import { AccountListProjection } from '../../src/infrastructure/projections/AccountListProjection';
import { migrateAccountsReadModel } from '../../src/infrastructure/initializeReadModel';
import { accountsReadModel } from '../../src/infrastructure/schemas/accountsReadModel';
import { InvalidAccountTypeError, InsufficientOpeningBalanceError } from '../../src/domain/errors';
import type { EventMetadata } from '@bank/shared';
import type { OpenAccountCommand } from '../../src/application/commands/OpenAccountCommand';

const meta: EventMetadata = {
  correlationId: 'corr-int-1',
  causationId: 'cause-int-1',
  userId: 'user-int-1',
  channel: 'web',
};

describe('OpenAccount — Flujo de integración', () => {
  let writeProvider: WriteDrizzleProvider;
  let readProvider: ReadDrizzleProvider;
  let handler: OpenAccountHandler;
  let repository: EventStoreAccountRepository;
  let projection: AccountListProjection;

  beforeEach(async () => {
    writeProvider = new WriteDrizzleProvider();
    await writeProvider.initialize(); // en memoria

    readProvider = new ReadDrizzleProvider();
    await readProvider.initialize(); // en memoria

    await migrateAccountsReadModel(readProvider);

    const eventStore = new DrizzleEventStore(writeProvider);
    const snapshotStore = new DrizzleSnapshotStore(writeProvider);
    repository = new EventStoreAccountRepository(eventStore, snapshotStore);

    const clabeGen = new RandomCLABEGenerator();
    const customerSpec = new StubCustomerActiveSpec();
    const maxAccountsSpec = new ReadModelMaxAccountsSpec(readProvider);
    const factory = new AccountFactory(customerSpec, maxAccountsSpec, clabeGen);

    handler = new OpenAccountHandler(factory, repository);
    projection = new AccountListProjection(readProvider);
  });

  afterEach(async () => {
    await writeProvider.close();
    await readProvider.close();
  });

  it('debe abrir una cuenta y persistir eventos en el Event Store', async () => {
    const command: OpenAccountCommand = {
      customerId: 'cust-1',
      type: 'AHORRO',
      currency: 'MXN',
      alias: 'Mi Ahorro',
      initialBalance: 1000,
      metadata: meta,
    };

    const result = await handler.execute(command);

    expect(result.accountId).toBeDefined();
    expect(result.clabe).toMatch(/^\d{18}$/);

    // Verificar que el agregado se reconstruye desde el Event Store
    const account = await repository.findById(result.accountId);
    expect(account).not.toBeNull();
    expect(account!.customerId).toBe('cust-1');
    expect(account!.type).toBe('AHORRO');
    expect(account!.currency).toBe('MXN');
    expect(account!.balance).toBe(1000);
    expect(account!.status).toBe('ACTIVE');
    expect(account!.alias).toBe('Mi Ahorro');
    expect(account!.clabe).toBe(result.clabe);
  });

  it('debe retornar null al buscar cuenta inexistente', async () => {
    const account = await repository.findById('no-existe');
    expect(account).toBeNull();
  });

  it('debe rechazar tipo de cuenta inválido', async () => {
    const command: OpenAccountCommand = {
      customerId: 'cust-1',
      type: 'CRIPTO',
      currency: 'MXN',
      alias: 'Cripto',
      initialBalance: 1000,
      metadata: meta,
    };

    await expect(handler.execute(command)).rejects.toThrow(InvalidAccountTypeError);
  });

  it('debe rechazar saldo insuficiente para CHEQUES', async () => {
    const command: OpenAccountCommand = {
      customerId: 'cust-1',
      type: 'CHEQUES',
      currency: 'MXN',
      alias: 'Cheques',
      initialBalance: 100,
      metadata: meta,
    };

    await expect(handler.execute(command)).rejects.toThrow(InsufficientOpeningBalanceError);
  });

  it('debe proyectar AccountOpened al read model', async () => {
    const command: OpenAccountCommand = {
      customerId: 'cust-1',
      type: 'AHORRO',
      currency: 'MXN',
      alias: 'Mi Ahorro',
      initialBalance: 500,
      metadata: meta,
    };

    const result = await handler.execute(command);

    // Simular catch-up: leer eventos del event store y pasarlos a la proyección
    const eventStore = new DrizzleEventStore(writeProvider);
    const storedEvents = await eventStore.readAllFromPosition(0, 100);
    for (const event of storedEvents) {
      await projection.handle(event);
    }

    // Verificar read model
    const rows = await readProvider.db.select().from(accountsReadModel);
    expect(rows).toHaveLength(1);
    expect(rows[0].id).toBe(result.accountId);
    expect(rows[0].customerId).toBe('cust-1');
    expect(rows[0].type).toBe('AHORRO');
    expect(rows[0].status).toBe('ACTIVE');
  });
});
