import { Router, Request, Response } from 'express';

/**
 * Rutas de salud. Usadas por health checks y verificacion basica.
 */



export function healthRoutes(): Router {
  const router = Router();

  router.get('/health', (_req: Request, res: Response) => {
    res.json({
      success: true,
      message: 'OK',
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      },
    });
  });

  return router;
}
