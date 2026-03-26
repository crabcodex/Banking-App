# Banco San Patricio — Banking App

Sistema bancario digital con Event Sourcing + CQRS + DDD.

## Requisitos

- **Node.js** 24+
- **pnpm** 10+ (gestor de paquetes del monorepo)
- **PostgreSQL** — Dos instancias en [Neon](https://neon.tech) (Write DB + Read DB)
- **RabbitMQ** — Instancia en [CloudAMQP](https://www.cloudamqp.com/) (mensajería entre contextos)

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

# 5. Configurar variables de entorno
cp packages/server/api/.env.example packages/server/api/.env
# Editar .env con las URLs de Neon y CloudAMQP

# 6. Aplicar migraciones a las bases de datos
pnpm db:migrate

# 7. Arrancar backend (puerto 3000) y frontend (Vite)
pnpm dev
```

> **Se requieren dos instancias de PostgreSQL (Neon) y una de RabbitMQ (CloudAMQP).** Ver la sección [Variables de entorno](#variables-de-entorno) para la configuración. PGlite se usa únicamente en tests unitarios e integración, donde crea bases en memoria sin infraestructura externa.

## Estructura del monorepo

```
packages/
├── core/                  ← Infraestructura compartida
│   ├── shared/            ← Domain primitives, CQRS interfaces, errores
│   ├── event-store/       ← Drizzle + PostgreSQL: Event Store, Snapshot Store, Event Bus
│   ├── messaging/         ← RabbitMQ: Outbox Relay, Publisher Confirms
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

Se configuran en `packages/server/api/.env`. Copiar `.env.example` como punto de partida:

| Variable | Descripción |
|---|---|
| `DATABASE_WRITE_URL` | Connection string de la Write DB (Neon — Event Store) |
| `DATABASE_READ_URL` | Connection string de la Read DB (Neon — Proyecciones) |
| `AMQP_URL` | Connection string de RabbitMQ (CloudAMQP) |
| `JWT_PRIVATE_KEY_PATH` | Llave privada RS256 (default: `../../../keys/private.pem`) |
| `JWT_PUBLIC_KEY_PATH` | Llave pública RS256 (default: `../../../keys/public.pem`) |
| `NODE_ENV` | Entorno de ejecución (default: `development`) |
| `PORT` | Puerto del API (default: `3000`) |
| `JWT_ACCESS_EXPIRY` | Expiración del access token (default: `15m`) |
| `JWT_REFRESH_EXPIRY` | Expiración del refresh token (default: `7d`) |
| `SNAPSHOT_INTERVAL` | Eventos antes de tomar snapshot (default: `50`) |
| `PROJECTION_POLL_MS` | Intervalo de polling de proyecciones (default: `1000`) |

## Base de datos

El proyecto usa **dos instancias de PostgreSQL** en Neon, separando la Write DB (Event Store) de la Read DB (Proyecciones).

Los schemas de Drizzle son la **fuente de verdad**. Al cambiar un schema:

```bash
pnpm db:generate   # genera migración SQL
pnpm db:migrate    # aplica migraciones a ambas bases
```

### Write DB (Event Store)

- **events** — Append-only, un evento por fila. OCC via `UNIQUE(stream_id, stream_version)`
- **snapshots** — Un snapshot por agregado (upsert)
- **outbox_checkpoint** — Posición del Outbox Relay

### Read DB (Proyecciones)

- **projection_checkpoints** — Posición de cada proyección catch-up
- Tablas de lectura generadas por cada bounded context

### PGlite (solo tests)

Los tests unitarios y de integración usan PGlite (PostgreSQL embebido en memoria). No requieren conexión a Neon ni infraestructura externa.

## Mensajería

La comunicación entre bounded contexts usa **RabbitMQ** (CloudAMQP) con el patrón **Transactional Outbox**:

1. Los eventos se persisten en la Write DB (tabla `events`)
2. El **Outbox Relay** los lee y publica al exchange de RabbitMQ con Publisher Confirms
3. Los consumidores procesan los eventos de forma asíncrona

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
