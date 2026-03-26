import { DomainError } from '@bank/shared';
import { ACCOUNT_ERROR_MESSAGES } from '../constants/ErrorMessages';

export class InvalidDailyLimitError extends DomainError {
  constructor() {
    super('INVALID_DAILY_LIMIT', ACCOUNT_ERROR_MESSAGES.INVALID_DAILY_LIMIT, 400);
  }
}
