import { StoredEvent } from '../event-store/StoredEvent';

/**
 * Contrato de una proyeccion.
 * Cada proyeccion procesa eventos almacenados y actualiza un modelo de lectura.
 */
export interface IProjection {
  /** Nombre unico de la proyeccion. Usado como clave en el checkpoint store. */
  readonly projectionName: string;

  /** Procesa un evento y actualiza el modelo de lectura. */
  handle(event: StoredEvent): Promise<void>;
}
