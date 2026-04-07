/**
 * Reglas de negocio: mínimos de apertura y límites diarios por tipo de cuenta.
 * 
 */
export const MINIMUM_OPENING_BALANCE: Record<string, number> = {
  AHORRO: 0,
  CHEQUES: 5_000,
  NOMINA: 0,
  INVERSION: 50_000,
  EMPRESARIAL: 100_000,
};

export const DEFAULT_DAILY_LIMIT: Record<string, number> = {
  AHORRO: 50_000,
  CHEQUES: 100_000,
  NOMINA: 50_000,
  INVERSION: 500_000,
  EMPRESARIAL: 1_000_000,
};

export const DEFAULT_ALIAS: Record<string, string> = {
  AHORRO: 'Cuenta de Ahorro',
  CHEQUES: 'Cuenta de Cheques',
  NOMINA: 'Cuenta de Nómina',
  INVERSION: 'Cuenta de Inversión',
  EMPRESARIAL: 'Cuenta Empresarial',
};

export const VALID_ACCOUNT_TYPES = [
  'AHORRO', 'CHEQUES', 'NOMINA', 'INVERSION', 'EMPRESARIAL',
] as const;

export const VALID_CURRENCIES = ['MXN', 'USD'] as const;
