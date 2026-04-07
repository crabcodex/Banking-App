import { describe, it, expect, vi } from 'vitest';
import { accountsApi } from '../../api/accountsApi';

vi.mock('@/lib/httpClient', () => ({
  httpClient: {
    post: vi.fn().mockResolvedValue({
      success: true,
      message: 'ok',
      data: { accountId: 'id-1', clabe: '000000000000000000' },
    }),
  },
}));

import { httpClient } from '@/lib/httpClient';

describe('accountsApi', () => {
  it('llama httpClient.post con /accounts y el payload', async () => {
    const payload = {
      customerId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      type: 'AHORRO' as const,
      currency: 'MXN' as const,
    };

    const result = await accountsApi.open(payload);

    expect(httpClient.post).toHaveBeenCalledWith('/accounts', payload);
    expect(result.data.accountId).toBe('id-1');
    expect(result.data.clabe).toBe('000000000000000000');
  });
});
