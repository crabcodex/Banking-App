/**
 * Metadatos que acompanan a todo evento de dominio.
 * Permite trazabilidad completa (correlacion, causacion, origen).
 */
export interface EventMetadata {
  readonly correlationId: string;
  readonly causationId: string;
  readonly userId: string;
  readonly channel: 'web' | 'mobile' | 'atm' | 'internal';
  readonly ip?: string;
  readonly deviceId?: string;
}

/**
 * Version del stream. Usada para Optimistic Concurrency Control (OCC).
 * -1 indica stream nuevo (no existe aun).
 */
export type StreamVersion = number;

/**
 * Resultado de leer un stream de eventos.
 */
export interface EventStream<TEvent> {
  readonly events: TEvent[];
  readonly version: StreamVersion;
}
