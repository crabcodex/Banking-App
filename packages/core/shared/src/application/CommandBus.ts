import { container } from "tsyringe";
import type { ICommandHandler } from "./ICommandHandler";
import { getCommandHandlers } from "./CommandHandler";

export class CommandBus {

  async execute(command: any): Promise<void> {

    const handlers = getCommandHandlers();

    const Handler = handlers.get(command.constructor.name);

    if (!Handler) {
      throw new Error(`No handler for command ${command.constructor.name}`);
    }

    const handlerInstance = container.resolve<ICommandHandler<any, any>>(Handler)

    await handlerInstance.execute(command);
  }

}