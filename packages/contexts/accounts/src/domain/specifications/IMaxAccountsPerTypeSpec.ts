import type { AccountType } from '../value-objects/AccountType';

/**
 * Specification: máximo 3 cuentas por tipo por cliente.
 * Lanza MaxAccountsReachedError si se excede.
 */
export interface IMaxAccountsPerTypeSpec {
  check(customerId: string, accountType: AccountType): Promise<void>;
}
