import { ValueObject } from '@bank/shared';
import { InvalidDailyLimitError } from '../errors';
import { DEFAULT_DAILY_LIMIT } from '../constants/AccountDefaults';
import type { AccountType } from './AccountType';

export class DailyLimit extends ValueObject<number> {
  protected validate(value: number): void {
    if (value <= 0) {
      throw new InvalidDailyLimitError();
    }
  }

  static defaultForType(accountType: AccountType): DailyLimit {
    return new DailyLimit(DEFAULT_DAILY_LIMIT[accountType.value]);
  }
}
