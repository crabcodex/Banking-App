/**
 * @bank/accounts — Bounded Context: Account Management
 *
 * Aggregate: Account (11 eventos)
 *
 * Estructura planificada:
 *
 * src/
 * ├── domain/
 * │   ├── Account.ts                     — Aggregate Root
 * │   ├── events/
 * │   │   ├── AccountOpened.ts
 * │   │   ├── AccountAliasChanged.ts
 * │   │   ├── FundsDeposited.ts
 * │   │   ├── FundsWithdrawn.ts
 * │   │   ├── FundsDebited.ts
 * │   │   ├── FundsCredited.ts
 * │   │   ├── FundsDebitReversed.ts
 * │   │   ├── DailyLimitChanged.ts
 * │   │   ├── AccountFrozen.ts
 * │   │   ├── AccountUnfrozen.ts
 * │   │   └── AccountClosed.ts
 * │   └── value-objects/
 * │       ├── Money.ts                   — DECIMAL(18,2), nunca FLOAT
 * │       ├── CLABE.ts                   — 18 dígitos
 * │       ├── AccountType.ts             — AHORRO | CHEQUES | NOMINA | INVERSION | EMPRESARIAL
 * │       └── DailyLimit.ts
 * │
 * ├── application/
 * │   ├── commands/
 * │   │   ├── OpenAccountHandler.ts
 * │   │   ├── ChangeAccountAliasHandler.ts
 * │   │   ├── DepositFundsHandler.ts
 * │   │   ├── WithdrawFundsHandler.ts
 * │   │   ├── FreezeAccountHandler.ts
 * │   │   ├── UnfreezeAccountHandler.ts
 * │   │   ├── CloseAccountHandler.ts
 * │   │   └── ChangeDailyLimitHandler.ts
 * │   └── queries/
 * │       ├── GetAccountDetailHandler.ts
 * │       ├── ListCustomerAccountsHandler.ts
 * │       ├── GetAccountHistoryHandler.ts
 * │       └── GetDashboardSummaryHandler.ts
 * │
 * └── infrastructure/
 *     └── projections/
 *         ├── AccountProjection.ts
 *         ├── TransactionHistoryProjection.ts
 *         └── DailyBalanceProjection.ts
 */
