import { container } from 'tsyringe';
import type { ReadDrizzleProvider } from '@bank/projection-engine';
import { ProjectionRunner } from '@bank/projection-engine';
import { EventStoreAccountRepository } from './EventStoreAccountRepository';
import { RandomCLABEGenerator } from './RandomCLABEGenerator';
import { StubCustomerActiveSpec } from './StubCustomerActiveSpec';
import { ReadModelMaxAccountsSpec } from './ReadModelMaxAccountsSpec';
import { AccountListProjection } from './projections/AccountListProjection';
import { AccountFactory } from '../domain/AccountFactory';
import { OpenAccountHandler } from '../application/commands/OpenAccountHandler';
import { migrateAccountsReadModel } from './initializeReadModel';

/**
 * Registra todos los bindings del bounded context Accounts en el contenedor DI.
 * Se invoca desde setupContainer() en @bank/api.
 */
export async function registerAccountsContext(): Promise<void> {
  // 1. Aplicar migraciones del read model
  const readProvider = container.resolve<ReadDrizzleProvider>('ReadDrizzleProvider');
  await migrateAccountsReadModel(readProvider);

  // 2. Adapters de infraestructura
  container.register('IAccountRepository', { useClass: EventStoreAccountRepository });
  container.register('ICLABEGenerator', { useClass: RandomCLABEGenerator });
  container.register('ICustomerActiveSpec', { useClass: StubCustomerActiveSpec });
  container.register('IMaxAccountsPerTypeSpec', { useClass: ReadModelMaxAccountsSpec });

  // 3. Factory (dominio puro — sin decoradores, se construye vía useFactory del DI)
  container.register('AccountFactory', {
    useFactory: (c) => new AccountFactory(
      c.resolve('ICustomerActiveSpec'),
      c.resolve('IMaxAccountsPerTypeSpec'),
      c.resolve('ICLABEGenerator'),
    ),
  });

  // 4. Command Handlers
  container.register('OpenAccountHandler', { useClass: OpenAccountHandler });

  // 5. Proyecciones — registrar en el ProjectionRunner
  const projection = container.resolve(AccountListProjection);
  const runner = container.resolve(ProjectionRunner);
  runner.register(projection);
}
