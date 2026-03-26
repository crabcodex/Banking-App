import { DomainError } from '@bank/shared';
import { ACCOUNT_ERROR_MESSAGES } from '../constants/ErrorMessages';

export class InsufficientOpeningBalanceError extends DomainError {
  constructor(type: string, minimum: number) {
    super(
      'INSUFFICIENT_OPENING_BALANCE',
      `${ACCOUNT_ERROR_MESSAGES.INSUFFICIENT_OPENING_BALANCE} (${type}: mínimo $${minimum})`,
      422,
    );
  }
}
