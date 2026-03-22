import type { EventMetadata } from '@bank/shared';

/** DTO del comando. Solo primitivos — sin VOs, sin lógica. */
export interface OpenAccountCommand {
  readonly customerId: string;
  readonly type: string;
  readonly currency: string;
  readonly alias: string;
  readonly initialBalance: number;
  readonly metadata: EventMetadata;
}

export interface OpenAccountResult {
  readonly accountId: string;
  readonly clabe: string;
}
