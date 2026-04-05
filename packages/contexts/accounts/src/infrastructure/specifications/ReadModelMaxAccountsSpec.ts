import { inject, injectable } from 'tsyringe';
import { eq, and, sql } from 'drizzle-orm';
import type { ReadDrizzleProvider } from '@bank/projection-engine';
import type { IMaxAccountsPerTypeSpec } from '../../domain/specifications/IMaxAccountsPerTypeSpec';
import type { AccountType } from '../../domain/value-objects/AccountType';
import { MaxAccountsReachedError } from '../../domain/errors';
import { accountsReadModel } from '../schemas/accountsReadModel';

const MAX_ACCOUNTS_PER_TYPE = 3;

/**
 * Specification que consulta el read model para verificar
 * que el cliente no exceda 3 cuentas del mismo tipo.
 */
@injectable()
export class ReadModelMaxAccountsSpec implements IMaxAccountsPerTypeSpec {
  constructor(
    @inject('ReadDrizzleProvider') private readonly readProvider: ReadDrizzleProvider,
  ) {}

  async check(customerId: string, accountType: AccountType): Promise<void> {
    const result = await this.readProvider.db
      .select({ count: sql<number>`count(*)` })
      .from(accountsReadModel)
      .where(
        and(
          eq(accountsReadModel.customerId, customerId),
          eq(accountsReadModel.type, accountType.value),
        ),
      );

    const count = Number(result[0]?.count ?? 0);
    if (count >= MAX_ACCOUNTS_PER_TYPE) {
      throw new MaxAccountsReachedError(accountType.value);
    }
  }
}
