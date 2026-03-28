import pinoHttp from 'pino-http';
import pino from 'pino';

const isDev = process.env.NODE_ENV === 'development';

/**
 * Middleware de logging estructurado con Pino.
 * En desarrollo: una linea legible por request (metodo, url, status, tiempo).
 * En produccion: JSON estructurado completo.
 */
export const requestLogger = pinoHttp({
  logger: pino({
    level: process.env.NODE_ENV === 'test' ? 'silent' : 'info',
  }),
  customProps: (req) => ({
    requestId: req.headers['x-request-id'],
  }),
  ...(isDev && {
    serializers: {
      req: (req) => ({ method: req.method, url: req.url }),
      res: (res) => ({ statusCode: res.statusCode }),
    },
  }),
});
