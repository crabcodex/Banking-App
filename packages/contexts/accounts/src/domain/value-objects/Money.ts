import { ValueObject } from '@bank/shared';
import { NegativeAmountError } from '../errors';

interface MoneyProps {
  readonly amount: number;
  readonly currency: string;
}

export class Money extends ValueObject<MoneyProps> {
  protected validate(value: MoneyProps): void {
    if (value.amount < 0) {
      throw new NegativeAmountError();
    }
  }

  get amount(): number { return this.value.amount; }
  get currency(): string { return this.value.currency; }

  static of(amount: number, currency: string): Money {
    return new Money({ amount, currency });
  }
}
