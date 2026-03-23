import { describe, it, expect } from 'vitest';
import { securityHeaders } from '../../src/middleware/securityHeaders';

describe('securityHeaders', () => {
  it('debe retornar un middleware (función)', () => {
    const middleware = securityHeaders();
    expect(typeof middleware).toBe('function');
  });

  it('debe agregar X-Content-Type-Options nosniff', () => {
    const middleware = securityHeaders();
    const headers: Record<string, string> = {};
    const res = {
      setHeader: (name: string, value: string) => { headers[name.toLowerCase()] = value; },
      removeHeader: () => {},
      getHeader: () => undefined,
    };
    const next = () => {};

    middleware({} as any, res as any, next);

    expect(headers['x-content-type-options']).toBe('nosniff');
  });

  it('debe agregar X-Frame-Options SAMEORIGIN', () => {
    const middleware = securityHeaders();
    const headers: Record<string, string> = {};
    const res = {
      setHeader: (name: string, value: string) => { headers[name.toLowerCase()] = value; },
      removeHeader: () => {},
      getHeader: () => undefined,
    };
    const next = () => {};

    middleware({} as any, res as any, next);

    expect(headers['x-frame-options']).toBe('SAMEORIGIN');
  });

  it('debe agregar Strict-Transport-Security con maxAge y preload', () => {
    const middleware = securityHeaders();
    const headers: Record<string, string> = {};
    const res = {
      setHeader: (name: string, value: string) => { headers[name.toLowerCase()] = value; },
      removeHeader: () => {},
      getHeader: () => undefined,
    };
    const next = () => {};

    middleware({} as any, res as any, next);

    const hsts = headers['strict-transport-security'];
    expect(hsts).toContain('max-age=31536000');
    expect(hsts).toContain('includeSubDomains');
    expect(hsts).toContain('preload');
  });

  it('debe agregar Content-Security-Policy', () => {
    const middleware = securityHeaders();
    const headers: Record<string, string> = {};
    const res = {
      setHeader: (name: string, value: string) => { headers[name.toLowerCase()] = value; },
      removeHeader: () => {},
      getHeader: () => undefined,
    };
    const next = () => {};

    middleware({} as any, res as any, next);

    expect(headers['content-security-policy']).toBeDefined();
    expect(headers['content-security-policy']).toContain("object-src 'none'");
    expect(headers['content-security-policy']).toContain("frame-src 'none'");
  });
});
