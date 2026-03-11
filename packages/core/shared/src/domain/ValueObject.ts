/**
 * Value Object inmutable. Igualdad por valor, no por referencia.
 * Se congela en el constructor para garantizar inmutabilidad.
 */
export abstract class ValueObject<T> {
  readonly value: T;

  constructor(value: T) {
    this.validate(value);
    this.value = value;
    Object.freeze(this);
  }

  /** Validacion que debe implementar cada VO concreto. Lanza error si es invalido. */
  protected abstract validate(value: T): void;

  equals(other: ValueObject<T>): boolean {
    if (!other) return false;
    return JSON.stringify(this.value) === JSON.stringify(other.value);
  }
}
