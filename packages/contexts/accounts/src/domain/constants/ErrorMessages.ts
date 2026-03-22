export const ACCOUNT_ERROR_MESSAGES = {
  INVALID_ACCOUNT_ID: 'Identificador de cuenta no válido',
  INVALID_ACCOUNT_TYPE: 'Tipo de cuenta no válido',
  INVALID_CLABE: 'CLABE interbancaria no válida (debe ser 18 dígitos)',
  INVALID_CURRENCY: 'Moneda no válida',
  NEGATIVE_AMOUNT: 'El monto no puede ser negativo',
  INVALID_DAILY_LIMIT: 'El límite diario debe ser mayor a cero',
  CUSTOMER_NOT_ACTIVE: 'El cliente no está activo o no cumple con el nivel KYC requerido',
  MAX_ACCOUNTS_REACHED: 'Se alcanzó el máximo de cuentas permitidas para este tipo',
  INSUFFICIENT_OPENING_BALANCE: 'El saldo inicial no cumple con el mínimo requerido',
} as const;
