/**
 * @bank/transfers — Bounded Context: Transfers (SPEI)
 *
 * Saga: TransferSaga (orquesta débito en origen → crédito en destino)
 *
 * Estructura planificada:
 *
 * src/
 * ├── domain/
 * │   ├── Transfer.ts                    — Aggregate Root (saga state)
 * │   ├── events/
 * │   │   ├── TransferInitiated.ts
 * │   │   ├── TransferCompleted.ts
 * │   │   └── TransferFailed.ts
 * │   └── value-objects/
 * │       ├── TransferAmount.ts
 * │       └── TransferStatus.ts          — PENDING | COMPLETED | FAILED
 * │
 * ├── application/
 * │   ├── commands/
 * │   │   └── InitiateTransferHandler.ts — valida límite diario, inicia saga
 * │   ├── queries/
 * │   │   └── GetTransferStatusHandler.ts
 * │   └── sagas/
 * │       └── TransferSaga.ts            — escucha FundsDebited → emite FundsCredited
 * │
 * └── infrastructure/
 *     └── projections/
 *         └── TransferProjection.ts
 */
