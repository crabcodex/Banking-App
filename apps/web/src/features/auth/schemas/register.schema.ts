import { z } from 'zod';

export const registerSchema = z
  .object({
    email: z.email('Email inválido'),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
    confirmPassword: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;
