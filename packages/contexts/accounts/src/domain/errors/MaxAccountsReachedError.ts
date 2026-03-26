import { DomainError } from '@bank/shared';
import { ACCOUNT_ERROR_MESSAGES } from '../constants/ErrorMessages';

export class MaxAccountsReachedError extends DomainError {
  constructor(type: string) {
    super('MAX_ACCOUNTS_REACHED', `${ACCOUNT_ERROR_MESSAGES.MAX_ACCOUNTS_REACHED}: ${type}`, 422);
  }
}
