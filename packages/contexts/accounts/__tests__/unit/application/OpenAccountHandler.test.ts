import { describe, it, expect, vi } from 'vitest';
import { OpenAccountHandler } from '../../../src/application/commands/OpenAccountHandler';
import { Account } from '../../../src/domain/Account';
import { AccountId } from '../../../src/domain/value-objects/AccountId';
import { AccountType } from '../../../src/domain/value-objects/AccountType';
import { CLABE } from '../../../src/domain/value-objects/CLABE';
import { Currency } from '../../../src/domain/value-objects/Currency';
import { Money } from '../../../src/domain/value-objects/Money';
import { DailyLimit } from '../../../src/domain/value-objects/DailyLimit';
import type { AccountFactory } from '../../../src/domain/AccountFactory';
import type { IAccountRepository } from '../../../src/domain/repositories/IAccountRepository';
import type { EventMetadata } from '@bank/shared';

const metadata: EventMetadata = {
  correlationId: 'c-1',
  causationId: 'cs-1',
  userId: 'u-1',
  channel: 'web',
};

function fakeAccount(): Account {
  return Account.open({
    accountId: new AccountId('550e8400-e29b-41d4-a716-446655440000'),
    customerId: 'cust-1',
    accountType: AccountType.fromString('AHORRO'),
    clabe: new CLABE('012345678901234567'),
    currency: Currency.fromString('MXN'),
    initialBalance: Money.of(500, 'MXN'),
    dailyLimit: new DailyLimit(50_000),
    alias: 'Test',
    metadata,
  });
}

describe('OpenAccountHandler', () => {
  it('debe delegar a factory y repository, retornar id y clabe', async () => {
    const account = fakeAccount();
    const factory: AccountFactory = { create: vi.fn().mockResolvedValue(account) } as any;
    const repository: IAccountRepository = { save: vi.fn().mockResolvedValue(undefined), findById: vi.fn() };

    const handler = new OpenAccountHandler(factory, repository);
    const result = await handler.execute({
      customerId: 'cust-1',
      type: 'AHORRO',
      currency: 'MXN',
      alias: 'Test',
      initialBalance: 500,
      metadata,
    });

    expect(result.accountId).toBe(account.id);
    expect(result.clabe).toBe('012345678901234567');
    expect(factory.create).toHaveBeenCalledOnce();
    expect(repository.save).toHaveBeenCalledWith(account);
  });

  it('debe propagar error de factory sin capturarlo', async () => {
    const error = new Error('spec failed');
    const factory: AccountFactory = { create: vi.fn().mockRejectedValue(error) } as any;
    const repository: IAccountRepository = { save: vi.fn(), findById: vi.fn() };

    const handler = new OpenAccountHandler(factory, repository);
    await expect(handler.execute({
      customerId: 'x', type: 'AHORRO', currency: 'MXN', alias: 'A', initialBalance: 0, metadata,
    })).rejects.toThrow('spec failed');

    expect(repository.save).not.toHaveBeenCalled();
  });

  it('debe propagar error de repository sin capturarlo', async () => {
    const account = fakeAccount();
    const factory: AccountFactory = { create: vi.fn().mockResolvedValue(account) } as any;
    const repository: IAccountRepository = {
      save: vi.fn().mockRejectedValue(new Error('db error')),
      findById: vi.fn(),
    };

    const handler = new OpenAccountHandler(factory, repository);
    await expect(handler.execute({
      customerId: 'cust-1', type: 'AHORRO', currency: 'MXN', alias: 'Test', initialBalance: 500, metadata,
    })).rejects.toThrow('db error');
  });
});
