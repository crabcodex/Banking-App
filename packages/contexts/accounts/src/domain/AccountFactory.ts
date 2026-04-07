import { Account } from './Account';
import { AccountId } from './value-objects/AccountId';
import { AccountType } from './value-objects/AccountType';
import { Currency } from './value-objects/Currency';
import { Money } from './value-objects/Money';
import { DailyLimit } from './value-objects/DailyLimit';
import { DEFAULT_ALIAS } from './constants/AccountDefaults';
import type { ICustomerActiveSpec } from './specifications/ICustomerActiveSpec';
import type { IMaxAccountsPerTypeSpec } from './specifications/IMaxAccountsPerTypeSpec';
import type { ICLABEGenerator } from './services/ICLABEGenerator';
import type { EventMetadata } from '@bank/shared';

export interface CreateAccountInput {
  readonly customerId: string;
  readonly type: string;
  readonly currency: string;
  readonly alias?: string;
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
    const initialBalance = Money.of(0, currency.value);
    const dailyLimit = DailyLimit.defaultForType(accountType);
    const clabe = this.clabeGenerator.generate();

    // 2. Verificar specifications (reglas de negocio que requieren I/O)
    await this.customerActiveSpec.check(input.customerId);
    await this.maxAccountsSpec.check(input.customerId, accountType);

    // 3. Crear agregado (status: PENDING_ACTIVATION, balance: 0)
    return Account.open({
      accountId,
      customerId: input.customerId,
      accountType,
      clabe,
      currency,
      initialBalance,
      dailyLimit,
      alias: input.alias ?? DEFAULT_ALIAS[accountType.value] ?? `Cuenta ${accountType.value}`,
      metadata: input.metadata,
    });
  }
}
