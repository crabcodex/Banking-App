import { http, HttpResponse } from 'msw';
import type { RegisterDTO, RegisterResponse } from '@/features/auth/types/auth.types';

export const authHandlers = [
  http.post<never, RegisterDTO, RegisterResponse>('/api/auth/register', async ({ request }) => {
    const body = await request.json();

    await new Promise((res) => setTimeout(res, 1000));

    if (body.email === 'error@test.com') {
      return HttpResponse.json({ message: 'El correo ya existe' }, { status: 400 });
    }

    return HttpResponse.json({
      message: 'Cliente registrado',
    });
  }),
];
