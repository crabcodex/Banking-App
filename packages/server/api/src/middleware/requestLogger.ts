import pinoHttp from 'pino-http';
import pino from 'pino';

/**
 * Middleware de logging estructurado con Pino.
 * Incluye requestId en cada log line para correlacion.
 */
export const requestLogger = pinoHttp({
  logger: pino({
    level: process.env.NODE_ENV === 'test' ? 'silent' : 'info',
    transport:
      process.env.NODE_ENV === 'development'
        ? { target: 'pino/file', options: { destination: 1 } }
        : undefined,
  }),
  customProps: (req) => ({
    requestId: req.headers['x-request-id'],
  }),
});
