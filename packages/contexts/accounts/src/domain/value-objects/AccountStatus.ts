import { ValueObject } from '@bank/shared';

const VALID_STATUSES = ['PENDING_ACTIVATION', 'ACTIVE', 'SUSPENDED', 'CLOSED'] as const;

export type AccountStatusValue = (typeof VALID_STATUSES)[number];

export class AccountStatus extends ValueObject<AccountStatusValue> {
  protected validate(value: AccountStatusValue): void {
    if (!(VALID_STATUSES as readonly string[]).includes(value)) {
      throw new Error(`Estado de cuenta no válido: ${value}`);
    }
  }

  static readonly PENDING_ACTIVATION = new AccountStatus('PENDING_ACTIVATION');
  static readonly ACTIVE = new AccountStatus('ACTIVE');

  get isPending(): boolean {
    return this.value === 'PENDING_ACTIVATION';
  }

  get isActive(): boolean {
    return this.value === 'ACTIVE';
  }
}
