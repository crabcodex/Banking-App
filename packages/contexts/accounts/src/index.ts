// -- Application --
export { OpenAccountHandler } from './application/commands/OpenAccountHandler';
export type { OpenAccountCommand, OpenAccountResult } from './application/commands/OpenAccountCommand';

// -- Infrastructure (composición) --
export { registerAccountsContext } from './infrastructure/registerAccountsContext';

