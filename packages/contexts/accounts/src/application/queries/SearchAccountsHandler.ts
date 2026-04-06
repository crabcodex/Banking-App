import { injectable, inject } from 'tsyringe';
import type { IQueryHandler, PaginatedResult } from '@bank/shared';
import type { SearchAccountsQuery, AccountReadModel } from './SearchAccountsQuery';
import type { IAccountReadRepository } from '../../domain/repositories/IAccountReadRepository';

/**
 * Handler: ORQUESTADOR PURO (lado de lectura).
 * Delega al repositorio de lectura la ejecución del Criteria.
 */
@injectable()
export class SearchAccountsHandler
  implements IQueryHandler<SearchAccountsQuery, PaginatedResult<AccountReadModel>>
{
  constructor(
    @inject('IAccountReadRepository') private readonly readRepo: IAccountReadRepository,
  ) {}

  async execute(query: SearchAccountsQuery): Promise<PaginatedResult<AccountReadModel>> {
    return this.readRepo.search(query.criteria);
  }
}
