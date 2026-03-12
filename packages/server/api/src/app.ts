import express from 'express';
import cors from 'cors';
import { requestIdMiddleware } from './middleware/requestId';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';
import { healthRoutes } from './routes/health';

/**
 * Fabrica de la aplicacion Express.
 * Separada del server.ts para facilitar testing con supertest.
 */
export function createApp(): express.Application {
  const app = express();

  // -- Middleware global --
  app.use(cors());
  app.use(express.json());
  app.use(requestIdMiddleware);
  app.use(requestLogger);

  // -- Rutas --
  app.use('/api', healthRoutes());

  // -- Error handler --
  app.use(errorHandler);

  return app;
}
