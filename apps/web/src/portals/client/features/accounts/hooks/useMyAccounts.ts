import { useQuery } from '@tanstack/react-query';
import { clientAccountsApi } from '../api/clientAccountsApi';

export function useMyAccounts(type?: string) {
  return useQuery({
    queryKey: ['my-accounts', type],
    queryFn: () => clientAccountsApi.getMyAccounts(type ? { type } : undefined),
  });
}
