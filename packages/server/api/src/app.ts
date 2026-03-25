import express from 'express';
import cors from 'cors';
import type { ITokenVerifier } from '@bank/shared';
import { securityHeaders } from './middleware/securityHeaders';
import { createRateLimiter } from './middleware/rateLimiter';
import { requestIdMiddleware } from './middleware/requestId';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';
import { healthRoutes } from './routes/health';
import { accountRoutes } from './routes/accounts';
import { devRoutes } from './routes/dev';

export interface AppConfig {
  tokenVerifier?: ITokenVerifier;
  corsOrigins?: string;
  rateLimitWindowMs?: number;
  rateLimitMax?: number;
  idempotencyTtlMs?: number;
  nodeEnv?: string;
  jwtPrivateKeyPath?: string;
}

/**
 * Fabrica de la aplicacion Express.
 * Separada del server.ts para facilitar testing con supertest.
 */
export function createApp(config: AppConfig = {}): express.Application {
  const app = express();

  // -- Seguridad --
  app.use(securityHeaders());

  const origins = config.corsOrigins ?? '*';
  app.use(cors({
    origin: origins === '*' ? '*' : origins.split(',').map(s => s.trim()),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key', 'X-Request-Id'],
    exposedHeaders: ['X-Request-Id', 'RateLimit-Remaining', 'RateLimit-Reset'],
    credentials: true,
    maxAge: 86_400,
  }));

  app.use(express.json({ limit: '10kb' }));
  app.use(requestIdMiddleware);
  app.use(requestLogger);

  // -- Rate limiter global --
  app.use(createRateLimiter({
    windowMs: config.rateLimitWindowMs,
    limit: config.rateLimitMax,
  }));

  // -- Rutas --
  app.use('/api', healthRoutes());
  app.use('/api', accountRoutes({
    tokenVerifier: config.tokenVerifier,
    idempotencyTtlMs: config.idempotencyTtlMs,
  }));

  // -- Rutas de desarrollo (solo en development) --
  if (config.nodeEnv === 'development' && config.jwtPrivateKeyPath) {
    app.use('/api', devRoutes(config.jwtPrivateKeyPath));
    console.log('Rutas de desarrollo habilitadas: POST /api/dev/token');
  }

  // -- Error handler --
  app.use(errorHandler);

  return app;
}
