import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ApiResponse } from '../shared/ApiResponse';

/**
 * Middleware factory que valida req.body con un esquema Zod.
 * Si la validación falla, responde 400 con los errores formateados.
 * Si pasa, deja los datos parseados en req.body y llama a next().
 */
export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const requestId = req.headers['x-request-id'] as string;
      const errors = formatZodErrors(result.error);
      res.status(400).json(
        ApiResponse.fail('Errores de validación', errors).withRequestId(requestId),
      );
      return;
    }

    req.body = result.data;
    next();
  };
}

function formatZodErrors(error: ZodError): Array<{ code: string; message: string }> {
  return error.issues.map((issue) => ({
    code: 'VALIDATION_ERROR',
    message: `${issue.path.join('.')}: ${issue.message}`,
  }));
}
