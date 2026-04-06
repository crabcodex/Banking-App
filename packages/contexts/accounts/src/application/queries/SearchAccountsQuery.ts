import type { Criteria } from '@bank/shared';
import type { AccountReadModel } from '../../domain/repositories/IAccountReadRepository';

/** Query para buscar cuentas con el patrón Criteria. */
export interface SearchAccountsQuery {
  readonly queryName: 'SearchAccounts';
  readonly criteria: Criteria;
}

export type { AccountReadModel };
