import type { ICommand } from '@bank/shared';

/** Comando para abrir una nueva cuenta bancaria. */
export interface OpenAccountCommand extends ICommand {
  readonly commandName: 'OpenAccount';
  readonly customerId: string;
  readonly type: string;
  readonly currency: string;
  readonly alias: string;
  readonly initialBalance: number;
}

export interface OpenAccountResult {
  readonly accountId: string;
  readonly clabe: string;
}
