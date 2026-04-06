import { http, HttpResponse } from 'msw';
import { accountHandlers } from './handlers/accounts';

const globalHandlers = [
  http.post('/api/dev/token', () => {
    return HttpResponse.json({
      success: true,
      message: 'Token de desarrollo generado',
      data: {
        token: 'fake-dev-token',
        sub: '00000000-0000-0000-0000-000000000001',
        role: 'admin',
        expiresIn: '24h',
      },
    });
  }),
];

export const handlers = [...globalHandlers, ...accountHandlers];
