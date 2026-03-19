import { describe, it, expect } from 'vitest';
import { authApi } from '../authApi';

describe('authApi.register', () => {
  it('debe registrar un usuario exitosamente', async () => {
    const res = await authApi.register({
      email: 'test@test.com',
      password: '12345678',
    }); 

    expect(res.message).toBe('Cliente registrado');
  });

  it('debe lanzar error si el email ya existe', async () => {
    await expect(
      authApi.register({
        email: 'error@test.com',
        password: '12345678',
      }),
    ).rejects.toThrow('El correo ya existe');
  });
});
