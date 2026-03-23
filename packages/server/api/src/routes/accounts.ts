import { Router } from 'express';
import { AccountController } from '../controllers/AccountController';
import { validateBody } from '../middleware/validateBody';
import { openAccountSchema } from '../schemas/openAccountSchema';

/**
 * Rutas del bounded context Accounts.
 * POST /api/accounts → Abrir nueva cuenta.
 */
export function accountRoutes(): Router {
  const router = Router();

  router.post('/accounts', validateBody(openAccountSchema), AccountController.openAccount);

  return router;
}
