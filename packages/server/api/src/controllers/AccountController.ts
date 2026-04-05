import { randomUUID } from 'node:crypto';
import { Request, Response } from 'express';
import { container } from 'tsyringe';
import type { ICommandBus, CommandMetadata } from '@bank/shared';
import type { OpenAccountCommand, OpenAccountResult, SearchAccountsHandler, SearchAccountsQuery } from '@bank/accounts';
import { ApiResponse } from '../http/shared/ApiResponse';
import type { OpenAccountBody } from '../http/schemas/openAccountSchema';
import type { SearchAccountsBody } from '../http/schemas/searchAccountsSchema';

/**
 * Controller HTTP para el bounded context Accounts.
 * Traduce HTTP → Command → CommandBus → ApiResponse.
 */
export class AccountController {
  static async openAccount(req: Request, res: Response): Promise<void> {
    const body = req.body as OpenAccountBody;
    const requestId = req.headers['x-request-id'] as string;

    const metadata: CommandMetadata = {
      userId: body.customerId,
      correlationId: requestId,
      causationId: requestId,
      channel: 'web',
      timestamp: new Date(),
    };

    const command: OpenAccountCommand = {
      commandName: 'OpenAccount',
      commandId: randomUUID(),
      customerId: body.customerId,
      type: body.type,
      currency: body.currency,
      alias: body.alias,
      initialBalance: body.initialBalance,
      metadata,
    };

    const commandBus = container.resolve<ICommandBus>('ICommandBus');
    const result = await commandBus.dispatch<OpenAccountResult>(command);

    const response = ApiResponse.ok(result, 'Cuenta creada exitosamente').withRequestId(requestId);
    res.status(201).json(response);
  }

  /**
   * POST /api/accounts/search
   * Busca cuentas aplicando Criteria. Seguridad por rol:
   * - customer: fuerza customerId = JWT sub (nunca ve cuentas ajenas)
   * - admin/officer: listado general sin filtros o con filtros opcionales
   */
  static async searchAccounts(req: Request, res: Response): Promise<void> {
    const body = req.body as SearchAccountsBody;
    const requestId = req.headers['x-request-id'] as string;

    const filters = [...body.filters];

    if (req.user?.role === 'customer') {
      const withoutCustomerId = filters.filter((f) => f.field !== 'customerId');
      withoutCustomerId.unshift({ field: 'customerId', operator: 'EQUALS', value: req.user.sub });
      filters.length = 0;
      filters.push(...withoutCustomerId);
    }

    const query: SearchAccountsQuery = {
      queryName: 'SearchAccounts',
      criteria: {
        filters,
        order: body.order,
        limit: body.limit,
        offset: body.offset,
      },
    };

    const handler = container.resolve<SearchAccountsHandler>('SearchAccountsHandler');
    const result = await handler.execute(query);

    const response = ApiResponse.ok(result, 'Cuentas encontradas').withRequestId(requestId);
    res.status(200).json(response);
  }
}
