/**
 * @bank/notifications — Bounded Context: Notifications
 *
 * Proyección reactiva: escucha eventos de todos los contextos
 * para generar notificaciones en tiempo real.
 *
 * Estructura planificada:
 *
 * src/
 * ├── domain/
 * │   ├── Notification.ts                — Entity (no es aggregate, es read-model)
 * │   └── value-objects/
 * │       ├── NotificationType.ts        — TRANSFER | SECURITY | ACCOUNT | AML
 * │       └── NotificationChannel.ts     — IN_APP | EMAIL | SMS | PUSH
 * │
 * ├── application/
 * │   ├── event-handlers/
 * │   │   ├── OnTransferCompleted.ts     — genera notificación de transferencia
 * │   │   ├── OnTransferFailed.ts
 * │   │   ├── OnUserLoggedIn.ts          — notificación de seguridad
 * │   │   ├── OnAccountFrozen.ts
 * │   │   └── OnAMLAlertRaised.ts
 * │   └── queries/
 * │       └── GetCustomerNotificationsHandler.ts
 * │
 * └── infrastructure/
 *     └── projections/
 *         └── NotificationProjection.ts  — materializa notificaciones
 */
