import { z } from 'zod';

/** Esquema Zod para validar el body de POST /api/accounts */
export const openAccountSchema = z.object({
  customerId: z.string().uuid('customerId debe ser un UUID válido'),
  type: z.enum(['AHORRO', 'CHEQUES', 'NOMINA', 'INVERSION', 'EMPRESARIAL'], {
    message: 'Tipo de cuenta inválido',
  }),
  currency: z.enum(['MXN', 'USD'], {
    message: 'Moneda inválida',
  }),
  alias: z
    .string()
    .max(50, 'El alias no puede superar 50 caracteres')
    .optional(),
});

export type OpenAccountBody = z.infer<typeof openAccountSchema>;
