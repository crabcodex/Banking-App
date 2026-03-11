/**
 * Error base de dominio. Todos los errores del sistema extienden esta clase.
 * Incluye code para identificacion programatica y httpStatus para mapeo en la API.
 */
export class DomainError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly httpStatus: number = 500,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}
