/**
 * @bank/audit — Bounded Context: Audit Log
 *
 * Proyección global: procesa TODOS los eventos del sistema
 * para mantener un log de auditoría inmutable.
 *
 * Estructura planificada:
 *
 * src/
 * ├── domain/
 * │   ├── AuditEntry.ts                  — Entity (read-model inmutable)
 * │   └── value-objects/
 * │       ├── AuditAction.ts             — CREATE | UPDATE | DELETE | AUTH | TRANSFER
 * │       └── AuditCategory.ts           — IDENTITY | ACCOUNT | TRANSFER | AML | SYSTEM
 * │
 * ├── application/
 * │   ├── event-handlers/
 * │   │   └── GlobalAuditHandler.ts      — suscrito a TODOS los eventos
 * │   └── queries/
 * │       ├── GetAuditLogHandler.ts       — paginado + filtros
 * │       └── GetEntityAuditTrailHandler.ts — trail por aggregateId
 * │
 * └── infrastructure/
 *     └── projections/
 *         └── AuditLogProjection.ts      — materializa log de auditoría
 */
