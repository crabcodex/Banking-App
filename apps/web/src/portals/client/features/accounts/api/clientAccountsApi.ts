import { httpClient } from '@/lib/httpClient';
import type { SearchAccountsRequest, SearchAccountsResponse } from '@/portals/admin/features/accounts/api/types';

export const clientAccountsApi = {
  getMyAccounts: (params?: { type?: string }) => {
    const filters: SearchAccountsRequest['filters'] = [];

    if (params?.type) {
      filters.push({ field: 'type', operator: 'EQUALS', value: params.type });
    }

    const request: SearchAccountsRequest = {
      filters,
      order: { field: 'openedAt', direction: 'DESC' },
      limit: 50,
      offset: 0,
    };

    return httpClient.post<SearchAccountsResponse>('/accounts/search', request);
  },
};
