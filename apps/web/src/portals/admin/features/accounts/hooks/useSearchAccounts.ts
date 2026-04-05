import { useQuery } from '@tanstack/react-query';
import { accountsApi } from '../api/accountsApi';
import type { SearchAccountsRequest } from '../api/types';

export function useSearchAccounts(criteria: SearchAccountsRequest) {
  return useQuery({
    queryKey: ['accounts', 'search', criteria],
    queryFn: () => accountsApi.search(criteria),
  });
}
