import { describe, it, expect, vi, beforeEach } from 'vitest';
import { container } from 'tsyringe';
import type { Request, Response } from 'express';
import { AccountController } from '../../src/controllers/AccountController';
import type { ICommandBus } from '@bank/shared';

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
