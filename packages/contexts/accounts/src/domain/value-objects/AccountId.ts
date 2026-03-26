import { randomUUID } from 'node:crypto';
import { ValueObject } from '@bank/shared';
import { InvalidAccountIdError } from '../errors';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class AccountId extends ValueObject<string> {
  protected validate(value: string): void {
    if (!UUID_REGEX.test(value)) {
      throw new InvalidAccountIdError(value);
    }
  }

  static generate(): AccountId {
    return new AccountId(randomUUID());
  }
}
