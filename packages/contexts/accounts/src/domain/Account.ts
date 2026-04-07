import { AggregateRoot } from '@bank/shared';
import type { AggregateSnapshot, EventMetadata } from '@bank/shared';
import { AccountOpened } from './events/AccountOpened';
import type { AccountId } from './value-objects/AccountId';
import type { AccountType } from './value-objects/AccountType';
import type { CLABE } from './value-objects/CLABE';
import type { Currency } from './value-objects/Currency';
import type { Money } from './value-objects/Money';
import type { DailyLimit } from './value-objects/DailyLimit';

/** Unión de todos los eventos del agregado. Crece con cada feature. */
type AccountEvent = AccountOpened;

export interface OpenAccountProps {
  readonly accountId: AccountId;
  readonly customerId: string;
  readonly accountType: AccountType;
  readonly clabe: CLABE;
  readonly currency: Currency;
  readonly initialBalance: Money;
  readonly dailyLimit: DailyLimit;
  readonly alias: string;
  readonly metadata: EventMetadata;
}

export class Account extends AggregateRoot<AccountEvent> {
  private _id!: string;
  private _customerId!: string;
  private _clabe!: string;
  private _type!: string;
  private _currency!: string;
  private _balance!: number;
  private _dailyLimit!: number;
  private _status!: string;
  private _alias!: string;
  private _openedAt!: string;

  // ── Getters ──
  get id(): string { return this._id; }
  get customerId(): string { return this._customerId; }
  get clabe(): string { return this._clabe; }
  get type(): string { return this._type; }
  get currency(): string { return this._currency; }
  get balance(): number { return this._balance; }
  get dailyLimit(): number { return this._dailyLimit; }
  get status(): string { return this._status; }
  get alias(): string { return this._alias; }

  // ── Métodos de dominio ──

  /**
   * Abre una cuenta nueva. Solo se invoca desde AccountFactory.
   * Aplica AccountOpened → muta estado vía when().
   */
  static open(props: OpenAccountProps): Account {
    const account = new Account();
    const now = new Date().toISOString();

    account.apply(
      new AccountOpened(
        props.accountId.value,
        {
          customerId: props.customerId,
          type: props.accountType.value,
          clabe: props.clabe.value,
          currency: props.currency.value,
          balance: props.initialBalance.amount,
          dailyLimit: props.dailyLimit.value,
          alias: props.alias,
          openedAt: now,
        },
        props.metadata,
      ),
    );

    return account;
  }

  // ── Event Sourcing ──

  protected when(event: AccountEvent): void {
    switch (event.eventType) {
      case 'AccountOpened': {
        const d = event.data as Record<string, unknown>;
        this._id = event.aggregateId;
        this._customerId = d['customerId'] as string;
        this._clabe = d['clabe'] as string;
        this._type = d['type'] as string;
        this._currency = d['currency'] as string;
        this._balance = d['balance'] as number;
        this._dailyLimit = d['dailyLimit'] as number;
        this._status = 'PENDING_ACTIVATION';
        this._alias = d['alias'] as string;
        this._openedAt = d['openedAt'] as string;
        break;
      }
    }
  }

  takeSnapshot(): AggregateSnapshot {
    return {
      aggregateId: this._id,
      version: this.version,
      state: {
        customerId: this._customerId,
        clabe: this._clabe,
        type: this._type,
        currency: this._currency,
        balance: this._balance,
        dailyLimit: this._dailyLimit,
        status: this._status,
        alias: this._alias,
        openedAt: this._openedAt,
      },
    };
  }

  restoreFromSnapshot(snapshot: AggregateSnapshot): void {
    const s = snapshot.state;
    this._id = snapshot.aggregateId;
    this._customerId = s['customerId'] as string;
    this._clabe = s['clabe'] as string;
    this._type = s['type'] as string;
    this._currency = s['currency'] as string;
    this._balance = s['balance'] as number;
    this._dailyLimit = s['dailyLimit'] as number;
    this._status = s['status'] as string;
    this._alias = s['alias'] as string;
    this._openedAt = s['openedAt'] as string;
    this.setVersion(snapshot.version);
  }
}
