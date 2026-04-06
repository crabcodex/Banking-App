import 'reflect-metadata';
import { container } from 'tsyringe';
import type { ITokenVerifier } from '@bank/shared';
import { createApp } from './app';
import type { AppConfig } from './app';
import { loadEnvConfig } from './config/env';
import { setupContainer } from './di/container';

/**
 * Punto de entrada del servidor.
 */
async function main(): Promise<void> {
  const config = loadEnvConfig();
  const teardown = await setupContainer(config);

  const appConfig: AppConfig = {
    tokenVerifier: container.resolve<ITokenVerifier>('ITokenVerifier'),
    corsOrigins: config.CORS_ORIGINS,
    rateLimitWindowMs: config.RATE_LIMIT_WINDOW_MS,
    rateLimitMax: config.RATE_LIMIT_MAX,
    idempotencyTtlMs: config.IDEMPOTENCY_TTL_MS,
    nodeEnv: config.NODE_ENV,
    jwtPrivateKeyPath: config.JWT_PRIVATE_KEY_PATH,
  };

  const app = createApp(appConfig);

  const server = app.listen(config.PORT, () => {
    console.log(`Servidor iniciado en puerto ${config.PORT} [${config.NODE_ENV}]`);
  });

  const onSignal = async () => {
    console.log('Señal recibida, cerrando servidor HTTP...');
    server.close();
    await teardown.shutdown();
    process.exit(0);
  };

  process.on('SIGTERM', onSignal);
  process.on('SIGINT', onSignal);
}

main().catch((err) => {
  console.error('Error fatal al iniciar:', err);
  process.exit(1);
});
