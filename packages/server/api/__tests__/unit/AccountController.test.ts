import { describe, it, expect, vi, beforeEach } from 'vitest';
import { container } from 'tsyringe';
import type { Request, Response } from 'express';
import { AccountController } from '../../src/controllers/AccountController';
import type { ICommandBus } from '@bank/shared';
// Importa augmentation de Express.Request.user
import '../../src/http/middleware/auth';

function mockReq(body: Record<string, unknown> = {}): Request {
  return {
    body,
    headers: { 'x-request-id': 'req-456' },
  } as unknown as Request;
}

function mockRes() {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
  return res;
}

describe('AccountController', () => {
  let commandBus: { dispatch: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    commandBus = { dispatch: vi.fn() };
    container.register('ICommandBus', { useValue: commandBus });
  });

  it('debe responder 201 con cuenta creada exitosamente', async () => {
    commandBus.dispatch.mockResolvedValue({
      accountId: 'acc-1',
      clabe: '012345678901234567',
    });

    const req = mockReq({
      customerId: '550e8400-e29b-41d4-a716-446655440000',
      type: 'AHORRO',
      currency: 'MXN',
      alias: 'Mi Ahorro',
      initialBalance: 1000,
    });
    const res = mockRes();

    await AccountController.openAccount(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: 'Cuenta creada exitosamente',
        data: { accountId: 'acc-1', clabe: '012345678901234567' },
        requestId: 'req-456',
      }),
    );
  });

  it('debe despachar comando con commandName OpenAccount', async () => {
    commandBus.dispatch.mockResolvedValue({ accountId: 'a', clabe: '0'.repeat(18) });

    const req = mockReq({
      customerId: '550e8400-e29b-41d4-a716-446655440000',
      type: 'CHEQUES',
      currency: 'USD',
      alias: 'Business',
      initialBalance: 5000,
    });
    const res = mockRes();

    await AccountController.openAccount(req, res);

    expect(commandBus.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        commandName: 'OpenAccount',
        customerId: '550e8400-e29b-41d4-a716-446655440000',
        type: 'CHEQUES',
        currency: 'USD',
        alias: 'Business',
        initialBalance: 5000,
      }),
    );
  });

  it('debe incluir metadata con correlationId del requestId', async () => {
    commandBus.dispatch.mockResolvedValue({ accountId: 'a', clabe: '0'.repeat(18) });

    const req = mockReq({
      customerId: '550e8400-e29b-41d4-a716-446655440000',
      type: 'AHORRO',
      currency: 'MXN',
      alias: 'Test',
      initialBalance: 1000,
    });
    const res = mockRes();

    await AccountController.openAccount(req, res);

    const dispatched = commandBus.dispatch.mock.calls[0][0];
    expect(dispatched.metadata.correlationId).toBe('req-456');
    expect(dispatched.metadata.channel).toBe('web');
    expect(dispatched.metadata.timestamp).toBeInstanceOf(Date);
  });

  it('debe propagar errores (asyncHandler los delegara a next)', async () => {
    const error = new Error('domain error');
    commandBus.dispatch.mockRejectedValue(error);

    const req = mockReq({
      customerId: '550e8400-e29b-41d4-a716-446655440000',
      type: 'AHORRO',
      currency: 'MXN',
      alias: 'A',
      initialBalance: 100,
    });
    const res = mockRes();

    await expect(AccountController.openAccount(req, res)).rejects.toThrow('domain error');
    expect(res.status).not.toHaveBeenCalled();
  });
});

describe('AccountController.searchAccounts', () => {
  let searchHandler: { execute: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    searchHandler = { execute: vi.fn() };
    container.register('SearchAccountsHandler', { useValue: searchHandler });
  });

  it('debe responder 200 con resultado paginado', async () => {
    const paginatedResult = {
      items: [{ id: 'acc-1', customerId: 'cust-1', type: 'AHORRO' }],
      total: 1,
      limit: 20,
      offset: 0,
    };
    searchHandler.execute.mockResolvedValue(paginatedResult);

    const req = mockReq({
      filters: [{ field: 'customerId', operator: 'EQUALS', value: 'cust-1' }],
      limit: 20,
      offset: 0,
    });
    const res = mockRes();

    await AccountController.searchAccounts(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: 'Cuentas encontradas',
        data: paginatedResult,
        requestId: 'req-456',
      }),
    );
  });

  it('debe forzar customerId desde JWT cuando el rol es customer', async () => {
    searchHandler.execute.mockResolvedValue({ items: [], total: 0, limit: 20, offset: 0 });

    const req = mockReq({
      filters: [{ field: 'type', operator: 'EQUALS', value: 'AHORRO' }],
      limit: 20,
      offset: 0,
    });
    req.user = { sub: 'jwt-customer-id', role: 'customer' };
    const res = mockRes();

    await AccountController.searchAccounts(req, res);

    const query = searchHandler.execute.mock.calls[0][0];
    expect(query.criteria.filters[0]).toEqual({
      field: 'customerId',
      operator: 'EQUALS',
      value: 'jwt-customer-id',
    });
  });

  it('debe ignorar customerId del body si el rol es customer', async () => {
    searchHandler.execute.mockResolvedValue({ items: [], total: 0, limit: 20, offset: 0 });

    const req = mockReq({
      filters: [{ field: 'customerId', operator: 'EQUALS', value: 'otro-customer' }],
      limit: 20,
      offset: 0,
    });
    req.user = { sub: 'jwt-customer-id', role: 'customer' };
    const res = mockRes();

    await AccountController.searchAccounts(req, res);

    const query = searchHandler.execute.mock.calls[0][0];
    const customerFilters = query.criteria.filters.filter(
      (f: any) => f.field === 'customerId',
    );
    expect(customerFilters).toHaveLength(1);
    expect(customerFilters[0].value).toBe('jwt-customer-id');
  });

  it('debe propagar errores del handler', async () => {
    searchHandler.execute.mockRejectedValue(new Error('read db error'));

    const req = mockReq({
      filters: [{ field: 'customerId', operator: 'EQUALS', value: 'cust-1' }],
      limit: 20,
      offset: 0,
    });
    const res = mockRes();

    await expect(AccountController.searchAccounts(req, res)).rejects.toThrow('read db error');
  });
});
