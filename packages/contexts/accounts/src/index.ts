// -- Application (commands) --
export { OpenAccountHandler } from './application/commands/OpenAccountHandler';
export type { OpenAccountCommand, OpenAccountResult } from './application/commands/OpenAccountCommand';

// -- Application (queries) --
export { SearchAccountsHandler } from './application/queries/SearchAccountsHandler';
export type { SearchAccountsQuery } from './application/queries/SearchAccountsQuery';

// -- Domain (read model + port) --
export type { AccountReadModel, IAccountReadRepository } from './domain/repositories/IAccountReadRepository';

// -- Infrastructure (composicion) --
export { registerAccountsContext } from './infrastructure/registerAccountsContext';
export { migrateAccountsReadModel } from './infrastructure/initializeReadModel';

