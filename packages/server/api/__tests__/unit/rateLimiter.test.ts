import { describe, it, expect } from 'vitest';
import { createRateLimiter, sensitiveRateLimiter } from '../../src/middleware/rateLimiter';

describe('createRateLimiter', () => {
  it('debe retornar un middleware (función)', () => {
    const middleware = createRateLimiter();
    expect(typeof middleware).toBe('function');
  });

  it('debe aceptar opciones personalizadas sin error', () => {
    const middleware = createRateLimiter({ windowMs: 30_000, limit: 50 });
    expect(typeof middleware).toBe('function');
  });

  it('debe funcionar con opciones por defecto', () => {
    const middleware = createRateLimiter({});
    expect(typeof middleware).toBe('function');
  });
});

describe('sensitiveRateLimiter', () => {
  it('debe retornar un middleware (función)', () => {
    const middleware = sensitiveRateLimiter();
    expect(typeof middleware).toBe('function');
  });
});
