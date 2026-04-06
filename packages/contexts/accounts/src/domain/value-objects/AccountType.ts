import { ValueObject } from '@bank/shared';
import { InvalidAccountTypeError } from '../errors';
import { VALID_ACCOUNT_TYPES } from '../constants/AccountDefaults';

export class AccountType extends ValueObject<string> {
  protected validate(value: string): void {
    if (!(VALID_ACCOUNT_TYPES as readonly string[]).includes(value)) {
      throw new InvalidAccountTypeError(value);
    }
  }

  static fromString(value: string): AccountType {
    return new AccountType(value);
  }
}
