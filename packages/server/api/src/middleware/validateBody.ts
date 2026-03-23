import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

/**
 * Middleware factory que valida req.body con un esquema Zod.
 * Si la validación falla, responde 400 con los errores formateados.
 * Si pasa, deja los datos parseados en req.body y llama a next().
 */
export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = formatZodErrors(result.error);
      res.status(400).json({
        success: false,
        message: 'Errores de validación',
        data: null,
        errors,
        requestId: req.headers['x-request-id'],
      });
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
