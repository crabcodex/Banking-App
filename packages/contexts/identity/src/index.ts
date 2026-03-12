/**
 * @bank/identity — Bounded Context: Identity & Authentication
 *
 * Aggregate: Customer (10 eventos)
 *
 * Estructura planificada:
 *
 * src/
 * ├── domain/
 * │   ├── Customer.ts                    — Aggregate Root
 * │   ├── events/
 * │   │   ├── CustomerRegistered.ts
 * │   │   ├── EmailVerified.ts
 * │   │   ├── KYCVerified.ts
 * │   │   ├── KYCUpgraded.ts
 * │   │   ├── MFAEnabled.ts
 * │   │   ├── MFADisabled.ts
 * │   │   ├── PasswordChanged.ts
 * │   │   ├── UserLoggedIn.ts
 * │   │   ├── UserLockedOut.ts
 * │   │   └── SessionRevoked.ts
 * │   └── value-objects/
 * │       ├── Email.ts
 * │       ├── Password.ts                — Argon2id hash
 * │       ├── DocumentId.ts
 * │       └── KYCLevel.ts                — BASICO | INTERMEDIO | COMPLETO
 * │
 * ├── application/
 * │   ├── commands/
 * │   │   ├── RegisterCustomerHandler.ts
 * │   │   ├── VerifyEmailHandler.ts
 * │   │   ├── VerifyKYCHandler.ts
 * │   │   ├── EnableMFAHandler.ts
 * │   │   └── ChangePasswordHandler.ts
 * │   └── queries/
 * │       ├── GetCustomerProfileHandler.ts
 * │       └── GetCustomerSessionsHandler.ts
 * │
 * └── infrastructure/
 *     ├── auth/
 *     │   ├── JwtService.ts              — RS256, 15min access, 7d refresh
 *     │   ├── Argon2Service.ts
 *     │   └── TOTPService.ts             — Speakeasy TOTP
 *     └── projections/
 *         ├── CustomerProjection.ts
 *         └── SessionProjection.ts
 */
