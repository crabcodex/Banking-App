import { ValueObject } from '@bank/shared';
import { InvalidCLABEError } from '../errors';

const CLABE_REGEX = /^\d{18}$/;

export class CLABE extends ValueObject<string> {
  protected validate(value: string): void {
    if (!CLABE_REGEX.test(value)) {
      throw new InvalidCLABEError(value);
    }
  }
}
