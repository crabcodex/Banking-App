import express from 'express';
import cors from 'cors';
import type { ITokenVerifier } from '@bank/shared';
import { securityHeaders } from './http/middleware/securityHeaders';
import { createRateLimiter } from './http/middleware/rateLimiter';
import { requestIdMiddleware } from './http/middleware/requestId';
import { requestLogger } from './http/middleware/requestLogger';
import { errorHandler } from './http/middleware/errorHandler';
import { healthRoutes } from './http/routes/health';
import { accountRoutes } from './http/routes/accounts';
import { devRoutes } from './http/routes/dev';

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

  if (config.nodeEnv === 'production' || config.nodeEnv === 'staging') {
    app.set('trust proxy', 1);
  }

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

  // -- Rutas de desarrollo (development y staging) --
  if ((config.nodeEnv === 'development' || config.nodeEnv === 'staging') && config.jwtPrivateKeyPath) {
    app.use('/api', devRoutes(config.jwtPrivateKeyPath));
    console.log('Rutas de desarrollo habilitadas: POST /api/dev/token');
  }

  // -- Error handler --
  app.use(errorHandler);

  return app;
}
