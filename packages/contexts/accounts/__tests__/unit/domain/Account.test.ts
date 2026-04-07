import { describe, it, expect } from 'vitest';
import { Account } from '../../../src/domain/Account';
import { AccountId } from '../../../src/domain/value-objects/AccountId';
import { AccountType } from '../../../src/domain/value-objects/AccountType';
import { CLABE } from '../../../src/domain/value-objects/CLABE';
import { Currency } from '../../../src/domain/value-objects/Currency';
import { Money } from '../../../src/domain/value-objects/Money';
import { DailyLimit } from '../../../src/domain/value-objects/DailyLimit';
import type { EventMetadata } from '@bank/shared';

const metadata: EventMetadata = {
  correlationId: 'corr-1',
  causationId: 'caus-1',
  userId: 'user-1',
  channel: 'web',
};

function openTestAccount(overrides?: Partial<{ balance: number; type: string }>): Account {
  return Account.open({
    accountId: AccountId.generate(),
    customerId: 'cust-123',
    accountType: AccountType.fromString(overrides?.type ?? 'AHORRO'),
    clabe: new CLABE('012345678901234567'),
    currency: Currency.fromString('MXN'),
    initialBalance: Money.of(overrides?.balance ?? 1000, 'MXN'),
    dailyLimit: new DailyLimit(50_000),
    alias: 'Mi cuenta',
    metadata,
  });
}

describe('Account Aggregate', () => {
  describe('open', () => {
    it('debe crear cuenta con estado PENDING_ACTIVATION y un evento uncommitted', () => {
      const account = openTestAccount();

      expect(account.status).toBe('PENDING_ACTIVATION');
      expect(account.balance).toBe(1000);
      expect(account.currency).toBe('MXN');
      expect(account.clabe).toBe('012345678901234567');
      expect(account.uncommittedEvents).toHaveLength(1);
      expect(account.uncommittedEvents[0].eventType).toBe('AccountOpened');
    });

    it('debe asignar customerId correctamente', () => {
      const account = openTestAccount();
      expect(account.customerId).toBe('cust-123');
    });

    it('debe asignar alias correctamente', () => {
      const account = openTestAccount();
      expect(account.alias).toBe('Mi cuenta');
    });

    it('debe permitir saldo inicial cero', () => {
      const account = openTestAccount({ balance: 0 });
      expect(account.balance).toBe(0);
    });

    it('debe asignar tipo de cuenta correctamente', () => {
      const account = openTestAccount({ type: 'EMPRESARIAL' });
      expect(account.type).toBe('EMPRESARIAL');
    });
  });

  describe('Event Sourcing', () => {
    it('debe reconstruir estado desde historial de eventos', () => {
      const original = openTestAccount();
      const events = [...original.uncommittedEvents];

      const restored = new Account();
      restored.loadFromHistory(events, 0);

      expect(restored.id).toBe(original.id);
      expect(restored.customerId).toBe('cust-123');
      expect(restored.status).toBe('PENDING_ACTIVATION');
      expect(restored.balance).toBe(1000);
      expect(restored.uncommittedEvents).toHaveLength(0);
    });

    it('debe limpiar eventos no confirmados tras clearUncommittedEvents', () => {
      const account = openTestAccount();
      expect(account.uncommittedEvents).toHaveLength(1);

      account.clearUncommittedEvents();
      expect(account.uncommittedEvents).toHaveLength(0);
    });

    it('debe generar y restaurar snapshot correctamente', () => {
      const original = openTestAccount();
      const snapshot = original.takeSnapshot();

      const restored = new Account();
      restored.restoreFromSnapshot(snapshot);

      expect(restored.id).toBe(original.id);
      expect(restored.clabe).toBe(original.clabe);
      expect(restored.balance).toBe(original.balance);
      expect(restored.type).toBe(original.type);
      expect(restored.currency).toBe(original.currency);
      expect(restored.dailyLimit).toBe(original.dailyLimit);
      expect(restored.status).toBe('PENDING_ACTIVATION');
      expect(restored.alias).toBe('Mi cuenta');
    });
  });
});
