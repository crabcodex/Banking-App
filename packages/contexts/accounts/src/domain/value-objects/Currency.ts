import { ValueObject } from '@bank/shared';
import { InvalidCurrencyError } from '../errors';
import { VALID_CURRENCIES } from '../constants/AccountDefaults';

export class Currency extends ValueObject<string> {
  protected validate(value: string): void {
    if (!(VALID_CURRENCIES as readonly string[]).includes(value)) {
      throw new InvalidCurrencyError(value);
    }
  }

  static fromString(value: string): Currency {
    return new Currency(value);
  }
}
