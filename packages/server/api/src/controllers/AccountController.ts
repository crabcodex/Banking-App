import { randomUUID } from 'node:crypto';
import { Request, Response } from 'express';
import { container } from 'tsyringe';
import type { ICommandBus, CommandMetadata } from '@bank/shared';
import type { OpenAccountCommand, OpenAccountResult } from '@bank/accounts';
import { ApiResponse } from '../http/shared/ApiResponse';
import type { OpenAccountBody } from '../http/schemas/openAccountSchema';

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
}
