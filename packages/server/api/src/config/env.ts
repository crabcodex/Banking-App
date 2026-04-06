import { z } from 'zod';

/**
 * Configuracion del entorno validada con Zod.
 * Falla rapido si faltan variables requeridas.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),

  // PostgreSQL (Supabase)
  DATABASE_WRITE_URL: z.string(),
  DATABASE_READ_URL: z.string(),

  // JWT
  JWT_PRIVATE_KEY_PATH: z.string().default('./keys/private.pem'),
  JWT_PUBLIC_KEY_PATH: z.string().default('./keys/public.pem'),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),

  // Snapshots
  SNAPSHOT_INTERVAL: z.coerce.number().default(50),

  // Projection polling
  PROJECTION_POLL_MS: z.coerce.number().default(1000),

  // CORS
  CORS_ORIGINS: z.string().default('*'),

  // Rate Limit
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60_000),
  RATE_LIMIT_MAX: z.coerce.number().default(100),

  // Idempotency
  IDEMPOTENCY_TTL_MS: z.coerce.number().default(86_400_000),

  // RabbitMQ (opcional — sin URL, no se conecta)
  AMQP_URL: z.string().url().optional(),
  OUTBOX_POLL_MS: z.coerce.number().default(1000),
  OUTBOX_BATCH_SIZE: z.coerce.number().default(100),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function loadEnvConfig(): EnvConfig {
  return envSchema.parse(process.env);
}
