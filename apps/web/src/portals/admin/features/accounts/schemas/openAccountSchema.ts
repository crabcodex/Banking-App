import { z } from 'zod';

export const ACCOUNT_TYPES = [
  { value: 'AHORRO', label: 'Ahorro' },
  { value: 'CHEQUES', label: 'Cheques' },
  { value: 'NOMINA', label: 'Nómina' },
  { value: 'INVERSION', label: 'Inversión' },
  { value: 'EMPRESARIAL', label: 'Empresarial' },
] as const;

export const CURRENCIES = [
  { value: 'MXN', label: 'Peso Mexicano (MXN)' },
  { value: 'USD', label: 'Dólar Estadounidense (USD)' },
] as const;

export const openAccountSchema = z.object({
  customerId: z.string().uuid('El ID de cliente debe ser un UUID válido'),
  type: z.enum(['AHORRO', 'CHEQUES', 'NOMINA', 'INVERSION', 'EMPRESARIAL'], {
    message: 'Selecciona un tipo de cuenta',
  }),
  currency: z.enum(['MXN', 'USD'], {
    message: 'Selecciona una moneda',
  }),
  alias: z
    .string()
    .min(1, 'El alias es obligatorio')
    .max(50, 'El alias no puede superar 50 caracteres'),
  initialBalance: z
    .number({ message: 'El saldo inicial es obligatorio' })
    .positive('El saldo inicial debe ser mayor a 0'),
});

export type OpenAccountFormData = z.infer<typeof openAccountSchema>;
