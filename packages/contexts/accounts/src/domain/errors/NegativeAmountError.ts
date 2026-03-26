import { DomainError } from '@bank/shared';
import { ACCOUNT_ERROR_MESSAGES } from '../constants/ErrorMessages';

export class NegativeAmountError extends DomainError {
  constructor() {
    super('NEGATIVE_AMOUNT', ACCOUNT_ERROR_MESSAGES.NEGATIVE_AMOUNT, 400);
  }
}
