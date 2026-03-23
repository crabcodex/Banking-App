import { injectable, inject } from 'tsyringe';
import type { ICommandHandler } from '@bank/shared';
import type { OpenAccountCommand, OpenAccountResult } from './OpenAccountCommand';
import type { AccountFactory } from '../../domain/AccountFactory';
import type { IAccountRepository } from '../../domain/repositories/IAccountRepository';

/**
 * Handler: ORQUESTADOR PURO.
 * No valida, no verifica, no construye.
 * Delega a Factory (construcción + specs) y Repository (persistencia).
 */
@injectable()
export class OpenAccountHandler implements ICommandHandler<OpenAccountCommand, OpenAccountResult> {
  constructor(
    @inject('AccountFactory') private readonly factory: AccountFactory,
    @inject('IAccountRepository') private readonly repository: IAccountRepository,
  ) {}

  async execute(command: OpenAccountCommand): Promise<OpenAccountResult> {
    const account = await this.factory.create(command);
    await this.repository.save(account);
    return { accountId: account.id, clabe: account.clabe };
  }
}
