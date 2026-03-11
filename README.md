# Banco San Patricio — Banking App

Sistema bancario digital con Event Sourcing + CQRS + DDD.

## Requisitos

- **Node.js** 20+
- **npm** 10+ (usa workspaces nativos)

## Primeros pasos

```bash
# 1. Clonar el repositorio
git clone <url-del-repo>
cd Banking-App

# 2. Instalar dependencias
npm install

# 3. Generar llaves JWT (RS256) para autenticación
npm run generate-keys

# 4. Generar migraciones de base de datos
npm run db:generate

# 5. Arrancar backend (puerto 3000) y frontend (Vite)
npm run dev
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
| `npm run dev` | Arranca backend y frontend en modo desarrollo |
| `npm run build` | Compila todos los paquetes |
| `npm run typecheck` | Verifica tipos en todos los paquetes |
| `npm run test` | Ejecuta tests (Vitest) |
| `npm run lint` | Ejecuta linter |
| `npm run format` | Formatea código con Prettier |
| `npm run db:generate` | Genera migraciones SQL desde los schemas de Drizzle |
| `npm run db:migrate` | Aplica migraciones pendientes |

## Variables de entorno

Todas tienen valores por defecto para desarrollo local. No se requiere archivo `.env`:

| Variable | Default | Descripción |
|---|---|---|
| `NODE_ENV` | `development` | Entorno de ejecución |
| `PORT` | `3000` | Puerto del API |
| `PGLITE_DATA_DIR` | (memoria) | Ruta para persistir PGlite en disco |
| `JWT_PRIVATE_KEY_PATH` | `./keys/private.pem` | Llave privada RS256 |
| `JWT_PUBLIC_KEY_PATH` | `./keys/public.pem` | Llave pública RS256 |
| `JWT_ACCESS_EXPIRY` | `15m` | Expiración del access token |
| `JWT_REFRESH_EXPIRY` | `7d` | Expiración del refresh token |
| `SNAPSHOT_INTERVAL` | `50` | Eventos antes de tomar snapshot |
| `PROJECTION_POLL_MS` | `1000` | Intervalo de polling de proyecciones |

## Base de datos

Los schemas de Drizzle en `packages/core/event-store/src/schemas/` son la **fuente de verdad**. Al cambiar un schema:

```bash
npm run db:generate   # genera migración SQL
# reiniciar el backend — aplica migraciones automáticamente
```

### Tablas del Event Store

- **events** — Append-only, un evento por fila. OCC via `UNIQUE(stream_id, stream_version)`
- **snapshots** — Un snapshot por agregado (upsert)
- **projection_checkpoints** — Posición de cada proyección catch-up

## Testing

```bash
npm run test              # todos los tests
npm run test -- --watch   # modo watch
```

Cobertura mínima: 80% statements. Patrón de tests: `Given (eventos) → When (comando) → Then (eventos emitidos)`.
