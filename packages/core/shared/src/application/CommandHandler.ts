const commandHandlers = new Map<string, any>();

export function commandHandler(command: any) {
  return function (target: any) {
    commandHandlers.set(command.name, target);
  };
}

export function getCommandHandlers() {
  return commandHandlers;
}