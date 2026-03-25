import { httpClient } from '@/lib/httpClient';
import type { OpenAccountRequest, OpenAccountResponse } from './types';

export const accountsApi = {
  open: (data: OpenAccountRequest) =>
    httpClient.post<OpenAccountResponse>('/accounts', data),
};
