import { http, HttpResponse } from 'msw';

const mockAccounts = [
  {
    id: 'acc-001',
    customerId: 'cust-1',
    type: 'AHORRO',
    clabe: '012345678901234567',
    currency: 'MXN',
    balance: '15000.00',
    dailyLimit: '50000.00',
    status: 'ACTIVE',
    alias: 'Mi Ahorro',
    openedAt: '2026-01-15T10:00:00.000Z',
  },
  {
    id: 'acc-002',
    customerId: 'cust-1',
    type: 'CHEQUES',
    clabe: '012345678901234568',
    currency: 'MXN',
    balance: '42000.50',
    dailyLimit: '100000.00',
    status: 'ACTIVE',
    alias: 'Cuenta Cheques',
    openedAt: '2026-02-01T12:00:00.000Z',
  },
];

export const accountHandlers = [
  http.post('/api/accounts', async ({ request }) => {
    const body = await request.json();
    const { customerId } = body as Record<string, unknown>;

    return HttpResponse.json(
      {
        success: true,
        message: 'Cuenta creada exitosamente',
        data: {
          accountId: crypto.randomUUID(),
          clabe: '012345678901234567',
        },
        requestId: crypto.randomUUID(),
      },
      { status: 201 },
    );
  }),

  http.post('/api/accounts/search', async ({ request }) => {
    const body = (await request.json()) as {
      filters: Array<{ field: string; operator: string; value: unknown }>;
      limit?: number;
      offset?: number;
    };

    let filtered = [...mockAccounts];
    for (const f of body.filters) {
      if (f.operator === 'EQUALS') {
        filtered = filtered.filter(
          (a) => a[f.field as keyof typeof a] === f.value,
        );
      }
      if (f.operator === 'CONTAINS' && typeof f.value === 'string') {
        filtered = filtered.filter((a) =>
          String(a[f.field as keyof typeof a])
            .toLowerCase()
            .includes((f.value as string).toLowerCase()),
        );
      }
      if (f.operator === 'IN' && Array.isArray(f.value)) {
        filtered = filtered.filter((a) =>
          (f.value as string[]).includes(a[f.field as keyof typeof a] as string),
        );
      }
    }

    const offset = body.offset ?? 0;
    const limit = body.limit ?? 20;
    const page = filtered.slice(offset, offset + limit);

    return HttpResponse.json({
      success: true,
      message: 'Cuentas encontradas',
      data: {
        items: page,
        total: filtered.length,
        limit,
        offset,
      },
      requestId: crypto.randomUUID(),
    });
  }),
];
