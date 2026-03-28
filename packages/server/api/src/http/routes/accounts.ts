import { Router } from 'express';
import type { RequestHandler } from 'express';
import type { ITokenVerifier } from '@bank/shared';
import { AccountController } from '../../controllers/AccountController';
import { asyncHandler } from '../middleware/asyncHandler';
import { validateBody } from '../middleware/validateBody';
import { requireAuth } from '../middleware/auth';
import { idempotency } from '../middleware/idempotency';
import { sensitiveRateLimiter } from '../middleware/rateLimiter';
import { openAccountSchema } from '../schemas/openAccountSchema';
import { searchAccountsSchema } from '../schemas/searchAccountsSchema';

export interface AccountRoutesConfig {
  tokenVerifier?: ITokenVerifier;
  idempotencyTtlMs?: number;
}

/**
 * Rutas del bounded context Accounts.
 * POST /api/accounts → Abrir nueva cuenta.
 */
export function accountRoutes(config: AccountRoutesConfig = {}): Router {
  const router = Router();

  const pipeline: RequestHandler[] = [];

  if (config.tokenVerifier) {
    pipeline.push(requireAuth(config.tokenVerifier));
  }

  pipeline.push(sensitiveRateLimiter());
  pipeline.push(idempotency({ ttlMs: config.idempotencyTtlMs }));
  pipeline.push(validateBody(openAccountSchema));

  router.post('/accounts', ...pipeline, asyncHandler(AccountController.openAccount));

  // -- Búsqueda con Criteria --
  const searchPipeline: RequestHandler[] = [];

  if (config.tokenVerifier) {
    searchPipeline.push(requireAuth(config.tokenVerifier));
  }

  searchPipeline.push(sensitiveRateLimiter());
  searchPipeline.push(validateBody(searchAccountsSchema));

  router.post('/accounts/search', ...searchPipeline, asyncHandler(AccountController.searchAccounts));

  return router;
}
