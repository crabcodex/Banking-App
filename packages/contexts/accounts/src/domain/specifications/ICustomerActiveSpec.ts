/**
 * Specification: el cliente debe estar activo y con KYC ≥ BÁSICO.
 * Lanza CustomerNotActiveError si no se cumple.
 */
export interface ICustomerActiveSpec {
  check(customerId: string): Promise<void>;
}
