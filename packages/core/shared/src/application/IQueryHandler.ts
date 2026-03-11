/**
 * Handler de query (CQRS - lado de lectura).
 * TQuery: criterios de busqueda. TResult: proyeccion de lectura.
 */
export interface IQueryHandler<TQuery, TResult> {
  execute(query: TQuery): Promise<TResult>;
}
