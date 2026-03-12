/**
 * @bank/aml — Bounded Context: Anti-Money Laundering
 *
 * Proyección reactiva: analiza patrones de transacciones
 * para detectar actividad sospechosa.
 *
 * Estructura planificada:
 *
 * src/
 * ├── domain/
 * │   ├── AMLAlert.ts                    — Entity (read-model)
 * │   └── value-objects/
 * │       ├── AlertSeverity.ts           — LOW | MEDIUM | HIGH | CRITICAL
 * │       └── AlertType.ts              — STRUCTURING | VELOCITY | LARGE_AMOUNT | PATTERN
 * │
 * ├── application/
 * │   ├── event-handlers/
 * │   │   ├── OnFundsDeposited.ts        — evalúa reglas de monto
 * │   │   ├── OnFundsWithdrawn.ts        — detecta structuring
 * │   │   └── OnTransferCompleted.ts     — analiza velocidad/patrones
 * │   ├── commands/
 * │   │   └── ResolveAMLAlertHandler.ts  — marca alerta como resuelta
 * │   └── queries/
 * │       ├── GetPendingAlertsHandler.ts
 * │       └── GetAlertDetailHandler.ts
 * │
 * └── infrastructure/
 *     └── projections/
 *         └── AMLAlertProjection.ts      — materializa alertas AML
 */
