import { DomainError } from '@bank/shared';
import { ACCOUNT_ERROR_MESSAGES } from '../constants/ErrorMessages';

export class InvalidCurrencyError extends DomainError {
  constructor(currency: string) {
    super('INVALID_CURRENCY', `${ACCOUNT_ERROR_MESSAGES.INVALID_CURRENCY}: ${currency}`, 400);
  }
}
