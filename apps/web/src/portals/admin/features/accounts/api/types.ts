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

// -- Búsqueda de cuentas --

export type AccountFilter =
  | { field: AccountFilterField; operator: 'EQUALS' | 'NOT_EQUALS' | 'CONTAINS'; value: string }
  | { field: AccountFilterField; operator: 'IN'; value: string[] };

type AccountFilterField = 'customerId' | 'type' | 'currency' | 'status' | 'clabe';

export interface SearchAccountsRequest {
  filters: AccountFilter[];
  order?: { field: 'openedAt' | 'type' | 'balance'; direction: 'ASC' | 'DESC' };
  limit?: number;
  offset?: number;
}

export interface AccountListItem {
  id: string;
  customerId: string;
  type: string;
  clabe: string;
  currency: string;
  balance: string;
  dailyLimit: string;
  status: string;
  alias: string;
  openedAt: string;
}

export interface SearchAccountsResponse {
  items: AccountListItem[];
  total: number;
  limit: number;
  offset: number;
}
