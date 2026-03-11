/**
 * Entidad base. Identidad por ID, no por atributos.
 * Usar cuando el objeto no es un agregado pero necesita identidad.
 */
export abstract class Entity<TId> {
  constructor(readonly id: TId) {}

  equals(other: Entity<TId>): boolean {
    if (!other) return false;
    return this.id === other.id;
  }
}
