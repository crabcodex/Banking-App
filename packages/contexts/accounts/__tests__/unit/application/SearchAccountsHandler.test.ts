import { describe, it, expect, vi } from 'vitest';
import { SearchAccountsHandler } from '../../../src/application/queries/SearchAccountsHandler';
import type { IAccountReadRepository } from '../../../src/domain/repositories/IAccountReadRepository';
import type { SearchAccountsQuery } from '../../../src/application/queries/SearchAccountsQuery';

describe('SearchAccountsHandler', () => {
  const mockResult = {
    items: [
      {
        id: 'acc-1',
        customerId: 'cust-1',
        type: 'AHORRO',
        clabe: '012345678901234567',
        currency: 'MXN',
        balance: '1000.00',
        dailyLimit: '50000.00',
        status: 'ACTIVE',
        alias: 'Mi Ahorro',
        openedAt: new Date('2026-01-01'),
      },
    ],
    total: 1,
    limit: 20,
    offset: 0,
  };

  it('debe delegar al repositorio de lectura y retornar resultado paginado', async () => {
    const readRepo: IAccountReadRepository = {
      search: vi.fn().mockResolvedValue(mockResult),
    };

    const handler = new SearchAccountsHandler(readRepo);

    const query: SearchAccountsQuery = {
      queryName: 'SearchAccounts',
      criteria: {
        filters: [{ field: 'customerId', operator: 'EQUALS', value: 'cust-1' }],
        limit: 20,
        offset: 0,
      },
    };

    const result = await handler.execute(query);

    expect(result).toEqual(mockResult);
    expect(readRepo.search).toHaveBeenCalledWith(query.criteria);
  });

  it('debe propagar errores del repositorio sin capturarlos', async () => {
    const readRepo: IAccountReadRepository = {
      search: vi.fn().mockRejectedValue(new Error('DB connection failed')),
    };

    const handler = new SearchAccountsHandler(readRepo);

    const query: SearchAccountsQuery = {
      queryName: 'SearchAccounts',
      criteria: {
        filters: [{ field: 'customerId', operator: 'EQUALS', value: 'cust-1' }],
        limit: 20,
        offset: 0,
      },
    };

    await expect(handler.execute(query)).rejects.toThrow('DB connection failed');
  });
});
