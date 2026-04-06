import { injectable } from 'tsyringe';
import type { ICustomerActiveSpec } from '../../domain/specifications/ICustomerActiveSpec';

/**
 * Stub: siempre aprueba.
 * Se reemplazará cuando el bounded context Identity esté implementado.
 */
@injectable()
export class StubCustomerActiveSpec implements ICustomerActiveSpec {
  async check(_customerId: string): Promise<void> {
    // Stub — siempre activo hasta que Identity esté implementado
  }
}
