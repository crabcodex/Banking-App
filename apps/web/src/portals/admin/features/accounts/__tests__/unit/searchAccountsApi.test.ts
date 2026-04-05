import { describe, it, expect, vi, beforeEach } from 'vitest';
import { accountsApi } from '../../api/accountsApi';

vi.mock('@/lib/httpClient', () => ({
  httpClient: {
    post: vi.fn(),
  },
}));

import { httpClient } from '@/lib/httpClient';

describe('accountsApi.search', () => {
  const mockResponse = {
    success: true,
    message: 'Cuentas encontradas',
    data: {
      items: [{ id: 'acc-1', customerId: 'cust-1', type: 'AHORRO' }],
      total: 1,
      limit: 20,
      offset: 0,
    },
  };

  beforeEach(() => {
    vi.mocked(httpClient.post).mockResolvedValue(mockResponse);
  });

  it('llama httpClient.post con /accounts/search y el payload', async () => {
    const payload = {
      filters: [{ field: 'customerId' as const, operator: 'EQUALS' as const, value: 'cust-1' }],
      limit: 20,
      offset: 0,
    };

    const result = await accountsApi.search(payload);

    expect(httpClient.post).toHaveBeenCalledWith('/accounts/search', payload);
    expect(result.data.items).toHaveLength(1);
    expect(result.data.total).toBe(1);
  });

  it('soporta filtros múltiples incluyendo IN', async () => {
    const payload = {
      filters: [
        { field: 'customerId' as const, operator: 'EQUALS' as const, value: 'cust-1' },
        { field: 'type' as const, operator: 'IN' as const, value: ['AHORRO', 'CHEQUES'] },
      ],
      limit: 10,
      offset: 0,
    };

    await accountsApi.search(payload);

    expect(httpClient.post).toHaveBeenCalledWith('/accounts/search', payload);
  });
});
