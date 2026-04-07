import { describe, it, expect, vi } from 'vitest';
import { AccountFactory } from '../../../src/domain/AccountFactory';
import { CLABE } from '../../../src/domain/value-objects/CLABE';
import { CustomerNotActiveError, MaxAccountsReachedError, InvalidAccountTypeError, InvalidCurrencyError } from '../../../src/domain/errors';
import type { ICustomerActiveSpec } from '../../../src/domain/specifications/ICustomerActiveSpec';
import type { IMaxAccountsPerTypeSpec } from '../../../src/domain/specifications/IMaxAccountsPerTypeSpec';
import type { ICLABEGenerator } from '../../../src/domain/services/ICLABEGenerator';
import type { EventMetadata } from '@bank/shared';

const metadata: EventMetadata = {
  correlationId: 'c-1',
  causationId: 'cs-1',
  userId: 'u-1',
  channel: 'web',
};

function createMocks() {
  const customerActiveSpec: ICustomerActiveSpec = {
    check: vi.fn().mockResolvedValue(undefined),
  };
  const maxAccountsSpec: IMaxAccountsPerTypeSpec = {
    check: vi.fn().mockResolvedValue(undefined),
  };
  const clabeGenerator: ICLABEGenerator = {
    generate: vi.fn().mockReturnValue(new CLABE('012345678901234567')),
  };
  return { customerActiveSpec, maxAccountsSpec, clabeGenerator };
}

function validInput() {
  return {
    customerId: 'cust-1',
    type: 'AHORRO',
    currency: 'MXN',
    alias: 'Mi ahorro',
    metadata,
  };
}

describe('AccountFactory', () => {
  it('debe crear cuenta cuando todas las specs pasan', async () => {
    const mocks = createMocks();
    const factory = new AccountFactory(
      mocks.customerActiveSpec,
      mocks.maxAccountsSpec,
      mocks.clabeGenerator,
    );

    const account = await factory.create(validInput());

    expect(account.status).toBe('PENDING_ACTIVATION');
    expect(account.balance).toBe(0);
    expect(account.clabe).toBe('012345678901234567');
    expect(mocks.customerActiveSpec.check).toHaveBeenCalledWith('cust-1');
    expect(mocks.maxAccountsSpec.check).toHaveBeenCalled();
  });

  it('debe lanzar CustomerNotActiveError si cliente inactivo', async () => {
    const mocks = createMocks();
    (mocks.customerActiveSpec.check as ReturnType<typeof vi.fn>).mockRejectedValue(new CustomerNotActiveError());
    const factory = new AccountFactory(
      mocks.customerActiveSpec,
      mocks.maxAccountsSpec,
      mocks.clabeGenerator,
    );

    await expect(factory.create(validInput())).rejects.toThrow(CustomerNotActiveError);
  });

  it('debe lanzar MaxAccountsReachedError si se excede el máximo', async () => {
    const mocks = createMocks();
    (mocks.maxAccountsSpec.check as ReturnType<typeof vi.fn>).mockRejectedValue(new MaxAccountsReachedError('AHORRO'));
    const factory = new AccountFactory(
      mocks.customerActiveSpec,
      mocks.maxAccountsSpec,
      mocks.clabeGenerator,
    );

    await expect(factory.create(validInput())).rejects.toThrow(MaxAccountsReachedError);
  });

  it('debe lanzar error de VO si tipo de cuenta es inválido', async () => {
    const mocks = createMocks();
    const factory = new AccountFactory(
      mocks.customerActiveSpec,
      mocks.maxAccountsSpec,
      mocks.clabeGenerator,
    );

    const input = { ...validInput(), type: 'CRIPTO' };
    await expect(factory.create(input)).rejects.toThrow(InvalidAccountTypeError);
  });

  it('debe lanzar error de VO si moneda es inválida', async () => {
    const mocks = createMocks();
    const factory = new AccountFactory(
      mocks.customerActiveSpec,
      mocks.maxAccountsSpec,
      mocks.clabeGenerator,
    );

    const input = { ...validInput(), currency: 'EUR' };
    await expect(factory.create(input)).rejects.toThrow(InvalidCurrencyError);
  });

  it('no debe llamar a specs si la construcción de VOs falla', async () => {
    const mocks = createMocks();
    const factory = new AccountFactory(
      mocks.customerActiveSpec,
      mocks.maxAccountsSpec,
      mocks.clabeGenerator,
    );

    const input = { ...validInput(), type: 'CRIPTO' };
    await expect(factory.create(input)).rejects.toThrow();

    expect(mocks.customerActiveSpec.check).not.toHaveBeenCalled();
    expect(mocks.maxAccountsSpec.check).not.toHaveBeenCalled();
  });
});
