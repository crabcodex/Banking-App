import { z } from 'zod';

const filterSchema = z.object({
  field: z.enum(['customerId', 'type', 'currency', 'status', 'clabe'], {
    message: 'Campo de filtro inválido',
  }),
  operator: z.enum(['EQUALS', 'NOT_EQUALS', 'IN', 'CONTAINS'], {
    message: 'Operador inválido',
  }),
  value: z.union([z.string(), z.array(z.string())]),
});

/** Esquema Zod para validar el body de POST /api/accounts/search */
export const searchAccountsSchema = z.object({
  filters: z.array(filterSchema).default([]),
  order: z
    .object({
      field: z.enum(['openedAt', 'type', 'balance']),
      direction: z.enum(['ASC', 'DESC']),
    })
    .optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export type SearchAccountsBody = z.infer<typeof searchAccountsSchema>;
