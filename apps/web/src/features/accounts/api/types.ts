export interface OpenAccountRequest {
  customerId: string;
  type: 'AHORRO' | 'CHEQUES' | 'NOMINA' | 'INVERSION' | 'EMPRESARIAL';
  currency: 'MXN' | 'USD';
  alias: string;
  initialBalance: number;
}

export interface OpenAccountResponse {
  accountId: string;
  clabe: string;
}
