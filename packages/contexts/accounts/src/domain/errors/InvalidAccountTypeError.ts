import { DomainError } from '@bank/shared';
import { ACCOUNT_ERROR_MESSAGES } from '../constants/ErrorMessages';

export class InvalidAccountTypeError extends DomainError {
  constructor(type: string) {
    super('INVALID_ACCOUNT_TYPE', `${ACCOUNT_ERROR_MESSAGES.INVALID_ACCOUNT_TYPE}: ${type}`, 400);
  }
}
