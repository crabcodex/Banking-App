import { Account } from './Account';
import { AccountId } from './value-objects/AccountId';
import { AccountType } from './value-objects/AccountType';
import { Currency } from './value-objects/Currency';
import { Money } from './value-objects/Money';
import { DailyLimit } from './value-objects/DailyLimit';
import { InsufficientOpeningBalanceError } from './errors';
import { MINIMUM_OPENING_BALANCE } from './constants/AccountDefaults';
import type { ICustomerActiveSpec } from './specifications/ICustomerActiveSpec';
import type { IMaxAccountsPerTypeSpec } from './specifications/IMaxAccountsPerTypeSpec';
import type { ICLABEGenerator } from './services/ICLABEGenerator';
import type { EventMetadata } from '@bank/shared';

export interface CreateAccountInput {
  readonly customerId: string;
  readonly type: string;
  readonly currency: string;
  readonly alias: string;
  readonly initialBalance: number;
  readonly metadata: EventMetadata;
}

export class AccountFactory {
  constructor(
    private readonly customerActiveSpec: ICustomerActiveSpec,
    private readonly maxAccountsSpec: IMaxAccountsPerTypeSpec,
    private readonly clabeGenerator: ICLABEGenerator,
  ) {}

  async create(input: CreateAccountInput): Promise<Account> {
    // 1. Construir Value Objects (validan formato automáticamente)
    const accountId = AccountId.generate();
    const accountType = AccountType.fromString(input.type);
    const currency = Currency.fromString(input.currency);
    const initialBalance = Money.of(input.initialBalance, currency.value);
    const dailyLimit = DailyLimit.defaultForType(accountType);
    const clabe = this.clabeGenerator.generate();

    // 2. Verificar specifications (reglas de negocio que requieren I/O)
    await this.customerActiveSpec.check(input.customerId);
    await this.maxAccountsSpec.check(input.customerId, accountType);

    // 3. Validar saldo mínimo de apertura (regla pura de dominio)
    const minimum = MINIMUM_OPENING_BALANCE[accountType.value];
    if (initialBalance.amount < minimum) {
      throw new InsufficientOpeningBalanceError(accountType.value, minimum);
    }

    // 4. Crear agregado
    return Account.open({
      accountId,
      customerId: input.customerId,
      accountType,
      clabe,
      currency,
      initialBalance,
      dailyLimit,
      alias: input.alias,
      metadata: input.metadata,
    });
  }
}
