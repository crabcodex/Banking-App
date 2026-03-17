import "reflect-metadata";
import { createApp } from './app';
import { container } from 'tsyringe';

import { loadEnvConfig } from './config/env';
import { setupContainer } from './di/container';
import {InMemoryEventBus} from "@bank/event-store"
import { CommandBus } from "@bank/shared";


async function main(): Promise<void> {

  const config = loadEnvConfig();

  await setupContainer(config);

  const commandBus = new CommandBus();

  const app = createApp(commandBus);

  app.listen(config.PORT, () => {
    console.log(`Servidor iniciado en puerto ${config.PORT} [${config.NODE_ENV}]`);
  });

}

main().catch((err) => {
  console.error('Error fatal al iniciar:', err);
  process.exit(1);
});