import { container } from 'tsyringe';
import { ProjectionRunner } from '@bank/projection-engine';
import { EventStoreAccountRepository } from './persistence/EventStoreAccountRepository';
import { DrizzleAccountReadRepository } from './persistence/DrizzleAccountReadRepository';
import { RandomCLABEGenerator } from './services/RandomCLABEGenerator';
import { StubCustomerActiveSpec } from './specifications/StubCustomerActiveSpec';
import { ReadModelMaxAccountsSpec } from './specifications/ReadModelMaxAccountsSpec';
import { AccountListProjection } from './projections/AccountListProjection';
import { AccountFactory } from '../domain/AccountFactory';
import { OpenAccountHandler } from '../application/commands/OpenAccountHandler';
import { SearchAccountsHandler } from '../application/queries/SearchAccountsHandler';

/**
 * Registra todos los bindings del bounded context Accounts en el contenedor DI.
 * Se invoca desde setupContainer() en @bank/api.
 *
 * Las migraciones del read model se aplican explícitamente con `pnpm db:migrate`.
 */
export async function registerAccountsContext(): Promise<void> {
  // 1. Adapters de infraestructura
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

  // 4b. Query Handlers + Read Repository
  container.register('IAccountReadRepository', { useClass: DrizzleAccountReadRepository });
  container.register('SearchAccountsHandler', { useClass: SearchAccountsHandler });

  // 5. Proyecciones — registrar en el ProjectionRunner
  const projection = container.resolve(AccountListProjection);
  const runner = container.resolve(ProjectionRunner);
  runner.register(projection);
}
