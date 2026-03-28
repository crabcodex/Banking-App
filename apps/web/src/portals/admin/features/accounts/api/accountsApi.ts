import { httpClient } from '@/lib/httpClient';
import type { OpenAccountRequest, OpenAccountResponse, SearchAccountsRequest, SearchAccountsResponse } from './types';

export const accountsApi = {
  open: (data: OpenAccountRequest) =>
    httpClient.post<OpenAccountResponse>('/accounts', data),

  search: (data: SearchAccountsRequest) =>
    httpClient.post<SearchAccountsResponse>('/accounts/search', data),
};
