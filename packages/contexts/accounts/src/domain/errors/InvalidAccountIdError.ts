import { DomainError } from '@bank/shared';
import { ACCOUNT_ERROR_MESSAGES } from '../constants/ErrorMessages';

export class InvalidAccountIdError extends DomainError {
  constructor(id: string) {
    super('INVALID_ACCOUNT_ID', `${ACCOUNT_ERROR_MESSAGES.INVALID_ACCOUNT_ID}: ${id}`, 400);
  }
}
