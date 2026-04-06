import { z } from 'zod';

const fieldEnum = z.enum(['customerId', 'type', 'currency', 'status', 'clabe'], {
  message: 'Campo de filtro inválido',
});

const scalarFilter = z.object({
  field: fieldEnum,
  operator: z.enum(['EQUALS', 'NOT_EQUALS', 'CONTAINS'], { message: 'Operador inválido' }),
  value: z.string({ message: 'value debe ser string para este operador' }),
});

const inFilter = z.object({
  field: fieldEnum,
  operator: z.literal('IN'),
  value: z.array(z.string()).nonempty({ message: 'value debe ser un array no vacío para IN' }),
});

const filterSchema = z.discriminatedUnion('operator', [scalarFilter, inFilter]);

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
