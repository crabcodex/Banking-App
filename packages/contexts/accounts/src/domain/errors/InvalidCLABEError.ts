import { DomainError } from '@bank/shared';
import { ACCOUNT_ERROR_MESSAGES } from '../constants/ErrorMessages';

export class InvalidCLABEError extends DomainError {
  constructor(clabe: string) {
    super('INVALID_CLABE', `${ACCOUNT_ERROR_MESSAGES.INVALID_CLABE}: ${clabe}`, 400);
  }
}
