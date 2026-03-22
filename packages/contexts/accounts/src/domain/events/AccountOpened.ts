import { DomainEvent } from '@bank/shared';
import type { EventMetadata } from '@bank/shared';

export interface AccountOpenedData {
  readonly customerId: string;
  readonly type: string;
  readonly clabe: string;
  readonly currency: string;
  readonly balance: number;
  readonly dailyLimit: number;
  readonly alias: string;
  readonly openedAt: string; // ISO 8601
}

export class AccountOpened extends DomainEvent {
  constructor(
    aggregateId: string,
    data: AccountOpenedData,
    metadata: EventMetadata,
  ) {
    super('AccountOpened', aggregateId, data as unknown as Record<string, unknown>, metadata);
  }
}
