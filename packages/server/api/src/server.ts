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
  await setupContainer(config);

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

  app.listen(config.PORT, () => {
    console.log(`Servidor iniciado en puerto ${config.PORT} [${config.NODE_ENV}]`);
  });
}

main().catch((err) => {
  console.error('Error fatal al iniciar:', err);
  process.exit(1);
});
