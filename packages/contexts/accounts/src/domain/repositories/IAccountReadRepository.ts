import type { Criteria, PaginatedResult } from '@bank/shared';

/** Proyeccion de lectura que expone el read model de cuentas. */
export interface AccountReadModel {
  readonly id: string;
  readonly customerId: string;
  readonly type: string;
  readonly clabe: string;
  readonly currency: string;
  readonly balance: string;
  readonly dailyLimit: string;
  readonly status: string;
  readonly alias: string;
  readonly openedAt: Date;
}

/** Contrato del repositorio de lectura de cuentas (read side). */
export interface IAccountReadRepository {
  search(criteria: Criteria): Promise<PaginatedResult<AccountReadModel>>;
}
