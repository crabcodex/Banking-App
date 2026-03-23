/**
 * Payload estándar de un token de autenticación.
 * Define los claims mínimos que todo token debe incluir.
 */
export interface TokenPayload {
  readonly sub: string;
  readonly role: string;
  readonly iat?: number;
  readonly exp?: number;
}

/**
 * Contrato de verificación de tokens de autenticación.
 *
 * Debe ser implementado por el bounded context de Identity.
 * El API consume esta interfaz vía DI sin conocer la implementación concreta
 * (JWT, opaque tokens, etc.).
 */
export interface ITokenVerifier {
  verify(token: string): Promise<TokenPayload>;
}
