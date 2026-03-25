# Banco San Patricio — Banking App

Sistema bancario digital con Event Sourcing + CQRS + DDD.

## Requisitos

- **Node.js** 24+
- **pnpm** 10+ (gestor de paquetes del monorepo)

## Primeros pasos

```bash
# 1. Clonar el repositorio
git clone <url-del-repo>
cd Banking-App

# 2. Instalar dependencias
pnpm install

# 3. Aprobar build scripts (primera vez)
pnpm approve-builds

# 4. Generar llaves JWT (RS256) para autenticación
pnpm generate-keys

# 5. Generar migraciones de base de datos
pnpm db:generate

# 6. Arrancar backend (puerto 3000) y frontend (Vite)
pnpm dev
```

> **No se necesita PostgreSQL externo.** El backend usa PGlite (PostgreSQL embebido en Node.js). Las migraciones se aplican automáticamente al arrancar.

## Estructura del monorepo

```
packages/
├── core/                  ← Infraestructura compartida
│   ├── shared/            ← Domain primitives, CQRS interfaces, errores
│   ├── event-store/       ← Drizzle + PGlite: Event Store, Snapshot Store, Event Bus
│   └── projection-engine/ ← ProjectionRunner, checkpoints
│
├── contexts/              ← Bounded Contexts (lógica de negocio)
│   ├── identity/          ← Registro, auth, KYC, MFA
│   ├── accounts/          ← Cuentas bancarias, operaciones
│   ├── transfers/         ← Transferencias, saga de compensación
│   ├── notifications/     ← Notificaciones en tiempo real
│   ├── aml/               ← Anti-Money Laundering
│   └── audit/             ← Log de auditoría inmutable
│
├── server/                ← Entry points
│   ├── api/               ← Express REST API
│   └── websocket/         ← Socket.io (real-time)
│
apps/
└── web/                   ← Frontend React + Vite + Tailwind
```

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `pnpm dev` | Arranca backend y frontend en modo desarrollo |
| `pnpm build` | Compila todos los paquetes |
| `pnpm typecheck` | Verifica tipos en todos los paquetes |
| `pnpm test` | Ejecuta tests (Vitest) |
| `pnpm lint` | Ejecuta linter |
| `pnpm format` | Formatea código con Prettier |
| `pnpm db:generate` | Genera migraciones para ambas bases (Write + Read) |
| `pnpm db:generate:write` | Genera migraciones solo para la Write DB (Event Store) |
| `pnpm db:generate:read` | Genera migraciones solo para la Read DB (Proyecciones) |

## Variables de entorno

Todas tienen valores por defecto para desarrollo local. No se requiere archivo `.env`:

| Variable | Default | Descripción |
|---|---|---|
| `NODE_ENV` | `development` | Entorno de ejecución |
| `PORT` | `3000` | Puerto del API |
| `PGLITE_WRITE_DIR` | (memoria) | Ruta para persistir Write DB (Event Store) en disco |
| `PGLITE_READ_DIR` | (memoria) | Ruta para persistir Read DB (Proyecciones) en disco |
| `JWT_PRIVATE_KEY_PATH` | `./keys/private.pem` | Llave privada RS256 |
| `JWT_PUBLIC_KEY_PATH` | `./keys/public.pem` | Llave pública RS256 |
| `JWT_ACCESS_EXPIRY` | `15m` | Expiración del access token |
| `JWT_REFRESH_EXPIRY` | `7d` | Expiración del refresh token |
| `SNAPSHOT_INTERVAL` | `50` | Eventos antes de tomar snapshot |
| `PROJECTION_POLL_MS` | `1000` | Intervalo de polling de proyecciones |

## Base de datos

Los schemas de Drizzle en `packages/core/event-store/src/schemas/` son la **fuente de verdad**. Al cambiar un schema:

```bash
pnpm db:generate   # genera migración SQL
# reiniciar el backend — aplica migraciones automáticamente
```

### Tablas del Event Store

- **events** — Append-only, un evento por fila. OCC via `UNIQUE(stream_id, stream_version)`
- **snapshots** — Un snapshot por agregado (upsert)
- **projection_checkpoints** — Posición de cada proyección catch-up

## Testing

```bash
pnpm test              # todos los tests
pnpm test --filter @bank/shared -- --watch   # modo watch en un paquete
```

Cobertura mínima: 80% statements. Patrón de tests: `Given (eventos) → When (comando) → Then (eventos emitidos)`.

## Desarrollo: autenticación

En modo desarrollo (`NODE_ENV=development`), el API expone un endpoint para generar tokens JWT válidos sin necesidad del contexto de Identity:

```bash
# Generar token con valores por defecto (admin, 24h)
curl -s -X POST http://localhost:3000/api/dev/token \
  -H "Content-Type: application/json" -d "{}"

# Generar token personalizado
curl -s -X POST http://localhost:3000/api/dev/token \
  -H "Content-Type: application/json" \
  -d '{"sub":"<uuid>","role":"admin","expiresIn":"7d"}'
```

> **El frontend (React) inyecta el token automáticamente** en modo desarrollo. No es necesario configurar nada para probar desde el navegador.
> También se genera un `Idempotency-Key` automático en cada request de escritura.

Este endpoint **no existe en producción**.
