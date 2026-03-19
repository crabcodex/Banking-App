import { describe, it, expect } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRegister } from '../useRegister';

import React from 'react';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Evita reintentos innecesarios en tests
      },
      mutations: {
        retry: false,
      },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

describe('useRegister', () => {
  it('debe registrar correctamente', async () => {
    const { result } = renderHook(() => useRegister(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({
        email: 'test@test.com',
        password: '123456',
      });
    });

    await waitFor(
      () => {
        expect(result.current.isSuccess).toBe(true);
        expect(result.current.data).toEqual({ message: 'Cliente registrado' });
      },
      { timeout: 3000 },
    );
  });

  it('debe manejar error correctamente', async () => {
    const { result } = renderHook(() => useRegister(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({
        email: 'error@test.com',
        password: '123456',
      });
    });

    await waitFor(
      () => {
        expect(result.current.isError).toBe(true);
        expect(result.current.error?.message).toBe('El correo ya existe');
      },
      { timeout: 3000 },
    );
  });
});
