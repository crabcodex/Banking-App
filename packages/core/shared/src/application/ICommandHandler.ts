/**
 * Handler de comando (CQRS - lado de escritura).
 * TCommand: DTO del comando. TResult: resultado de la ejecucion.
 */
export interface ICommandHandler<TCommand, TResult = void> {
  execute(command: TCommand): Promise<TResult>;
}
