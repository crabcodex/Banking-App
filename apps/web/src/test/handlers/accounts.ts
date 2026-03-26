import { http, HttpResponse } from 'msw';

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
];
