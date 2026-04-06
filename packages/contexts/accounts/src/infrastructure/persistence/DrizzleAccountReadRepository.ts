import { injectable, inject } from 'tsyringe';
import { eq, ne, inArray, ilike, and, asc, desc, sql } from 'drizzle-orm';
import type { SQL } from 'drizzle-orm';
import type { ReadDrizzleProvider } from '@bank/projection-engine';
import type { Criteria, PaginatedResult } from '@bank/shared';
import { ValidationError } from '@bank/shared';
import type { IAccountReadRepository, AccountReadModel } from '../../domain/repositories/IAccountReadRepository';
import { accountsReadModel } from '../schemas/accountsReadModel';

/** Campos permitidos para filtrar (whitelist). */
const FILTERABLE_COLUMNS = {
  customerId: accountsReadModel.customerId,
  type: accountsReadModel.type,
  currency: accountsReadModel.currency,
  status: accountsReadModel.status,
  clabe: accountsReadModel.clabe,
} as const;

/** Campos permitidos para ordenar. */
const SORTABLE_COLUMNS = {
  openedAt: accountsReadModel.openedAt,
  type: accountsReadModel.type,
  balance: accountsReadModel.balance,
} as const;

type FilterableField = keyof typeof FILTERABLE_COLUMNS;
type SortableField = keyof typeof SORTABLE_COLUMNS;

const MAX_LIMIT = 50;

/**
 * Repositorio de lectura de cuentas.
 * Traduce Criteria genérico a queries Drizzle sobre accounts_read.
 */
@injectable()
export class DrizzleAccountReadRepository implements IAccountReadRepository {
  constructor(
    @inject('ReadDrizzleProvider') private readonly readProvider: ReadDrizzleProvider,
  ) {}

  async search(criteria: Criteria): Promise<PaginatedResult<AccountReadModel>> {
    const conditions = this.buildConditions(criteria);
    const orderBy = this.buildOrderBy(criteria);
    const limit = Math.min(criteria.limit, MAX_LIMIT);
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [items, countResult] = await Promise.all([
      this.readProvider.db
        .select()
        .from(accountsReadModel)
        .where(whereClause)
        .orderBy(orderBy)
        .limit(limit)
        .offset(criteria.offset),
      this.readProvider.db
        .select({ count: sql<number>`count(*)` })
        .from(accountsReadModel)
        .where(whereClause),
    ]);

    return {
      items,
      total: Number(countResult[0]?.count ?? 0),
      limit,
      offset: criteria.offset,
    };
  }

  private buildConditions(criteria: Criteria): SQL[] {
    const conditions: SQL[] = [];

    for (const filter of criteria.filters) {
      const column = FILTERABLE_COLUMNS[filter.field as FilterableField];
      if (!column) {
        throw new ValidationError([
          { field: filter.field, message: `Campo '${filter.field}' no es filtrable` },
        ]);
      }

      switch (filter.operator) {
        case 'EQUALS':
          conditions.push(eq(column, filter.value as string));
          break;
        case 'NOT_EQUALS':
          conditions.push(ne(column, filter.value as string));
          break;
        case 'IN':
          conditions.push(inArray(column, filter.value as string[]));
          break;
        case 'CONTAINS':
          conditions.push(ilike(column, `%${filter.value as string}%`));
          break;
      }
    }

    return conditions;
  }

  private buildOrderBy(criteria: Criteria) {
    if (!criteria.order) {
      return desc(accountsReadModel.openedAt);
    }

    const column = SORTABLE_COLUMNS[criteria.order.field as SortableField];
    if (!column) {
      return desc(accountsReadModel.openedAt);
    }

    return criteria.order.direction === 'ASC' ? asc(column) : desc(column);
  }
}
