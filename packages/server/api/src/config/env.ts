import { z } from 'zod';

/**
 * Configuracion del entorno validada con Zod.
 * Falla rapido si faltan variables requeridas.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),

  // PGlite
  PGLITE_WRITE_DIR: z.string().optional(),
  PGLITE_READ_DIR: z.string().optional(),

  // JWT
  JWT_PRIVATE_KEY_PATH: z.string().default('./keys/private.pem'),
  JWT_PUBLIC_KEY_PATH: z.string().default('./keys/public.pem'),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),

  // Snapshots
  SNAPSHOT_INTERVAL: z.coerce.number().default(50),

  // Projection polling
  PROJECTION_POLL_MS: z.coerce.number().default(1000),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function loadEnvConfig(): EnvConfig {
  return envSchema.parse(process.env);
}
