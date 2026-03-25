import { readFileSync } from 'node:fs';
import { importSPKI, jwtVerify } from 'jose';
import type { ITokenVerifier, TokenPayload } from '@bank/shared';

/**
 * Adaptador temporal de ITokenVerifier usando la librería jose (RS256).
 *
 * TODO(@bank/identity): Este adaptador es temporal. Cuando el contexto de Identity
 * implemente su propio ITokenVerifier, reemplazar este binding en el container DI
 * (ver container.ts → registro de 'ITokenVerifier') por la implementación real.
 */
export class JoseTokenVerifier implements ITokenVerifier {
  private keyPromise: Promise<CryptoKey> | null = null;

  constructor(private readonly publicKeyPemOrPath: string) {}

  async verify(token: string): Promise<TokenPayload> {
    const key = await this.getKey();
    const { payload } = await jwtVerify(token, key, { algorithms: ['RS256'] });

    return {
      sub: payload.sub!,
      role: payload['role'] as string,
      iat: payload.iat,
      exp: payload.exp,
    };
  }

  private getKey(): Promise<CryptoKey> {
    if (this.keyPromise) return this.keyPromise;
    const pem = this.publicKeyPemOrPath.includes('-----BEGIN')
      ? this.publicKeyPemOrPath
      : readFileSync(this.publicKeyPemOrPath, 'utf-8');
    this.keyPromise = importSPKI(pem, 'RS256');
    return this.keyPromise;
  }
}
