import { DomainError } from '@bank/shared';
import { ACCOUNT_ERROR_MESSAGES } from '../constants/ErrorMessages';

export class CustomerNotActiveError extends DomainError {
  constructor() {
    super('CUSTOMER_NOT_ACTIVE', ACCOUNT_ERROR_MESSAGES.CUSTOMER_NOT_ACTIVE, 422);
  }
}
