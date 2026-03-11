import { createApp } from './app';
import { loadEnvConfig } from './config/env';
import { setupContainer } from './di/container';

/**
 * Punto de entrada del servidor.
 */
async function main(): Promise<void> {
  const config = loadEnvConfig();
  await setupContainer(config);

  const app = createApp();

  app.listen(config.PORT, () => {
    console.log(`Servidor iniciado en puerto ${config.PORT} [${config.NODE_ENV}]`);
  });
}

main().catch((err) => {
  console.error('Error fatal al iniciar:', err);
  process.exit(1);
});
