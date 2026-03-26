import { useMutation } from '@tanstack/react-query';
import { accountsApi } from '../api/accountsApi';
import type { OpenAccountRequest } from '../api/types';

export function useOpenAccount() {
  return useMutation({
    mutationFn: (data: OpenAccountRequest) => accountsApi.open(data),
  });
}
