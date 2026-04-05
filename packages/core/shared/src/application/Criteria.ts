/** Operadores de filtrado soportados por el patrón Criteria. */
export type FilterOperator = 'EQUALS' | 'NOT_EQUALS' | 'IN' | 'CONTAINS';

/** Filtro individual: campo + operador + valor. */
export interface Filter {
  readonly field: string;
  readonly operator: FilterOperator;
  readonly value: unknown;
}

/** Ordenamiento: campo + dirección. */
export interface Order {
  readonly field: string;
  readonly direction: 'ASC' | 'DESC';
}

/**
 * Criteria: conjunto de filtros, orden y paginación.
 * Nunca se permite una consulta sin límite.
 */
export interface Criteria {
  readonly filters: Filter[];
  readonly order?: Order;
  readonly limit: number;
  readonly offset: number;
}

/** Resultado paginado genérico. */
export interface PaginatedResult<T> {
  readonly items: T[];
  readonly total: number;
  readonly limit: number;
  readonly offset: number;
}
