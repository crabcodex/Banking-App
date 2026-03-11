/**
 * @bank/web — Frontend: NovaBanca
 *
 * Stack: React 18-  Vite 5 + Shadcn/ui + Tailwind CSS 3.4
 * State: Zustand (auth/transfer) + TanStack Query v5 (server state)
 * Forms: React Hook Form + Zod
 * Routing: React Router v6
 * Real-time: Socket.io Client
 * Charts: Recharts
 * Icons: Lucide React
 * Testing: Testing Library + Playwright + MSW
 *
 * Arquitectura: Feature-Sliced Design
 *
 * Estructura planificada:
 *
 * src/
 * ├── main.tsx                           — Entry point (React.createRoot)
 * ├── App.tsx                            — Router + Providers (QueryClient, Auth, Theme)
 * │
 * ├── features/
 * │   ├── auth/
 * │   │   ├── pages/
 * │   │   │   ├── LoginPage.tsx
 * │   │   │   ├── RegisterPage.tsx
 * │   │   │   ├── MFAVerifyPage.tsx
 * │   │   │   ├── ForgotPasswordPage.tsx
 * │   │   │   └── ResetPasswordPage.tsx
 * │   │   ├── components/
 * │   │   │   ├── LoginForm.tsx
 * │   │   │   ├── RegisterForm.tsx
 * │   │   │   └── MFAInput.tsx
 * │   │   ├── hooks/
 * │   │   │   ├── useAuth.ts
 * │   │   │   └── useInactivityTimeout.ts — 15min timeout (warning 2min antes)
 * │   │   ├── store/
 * │   │   │   └── authStore.ts            — Zustand: tokens en memoria NUNCA persisten
 * │   │   ├── api/
 * │   │   │   └── authApi.ts
 * │   │   └── types/
 * │   │       └── auth.types.ts
 * │   │
 * │   ├── dashboard/
 * │   │   ├── pages/
 * │   │   │   └── DashboardPage.tsx       — resumen cuentas + saldos + gráficos
 * │   │   ├── components/
 * │   │   │   ├── BalanceSummary.tsx
 * │   │   │   ├── RecentTransactions.tsx
 * │   │   │   ├── QuickActions.tsx
 * │   │   │   └── BalanceChart.tsx         — Recharts
 * │   │   └── hooks/
 * │   │       └── useDashboard.ts
 * │   │
 * │   ├── accounts/
 * │   │   ├── pages/
 * │   │   │   ├── AccountListPage.tsx
 * │   │   │   ├── AccountDetailPage.tsx
 * │   │   │   └── OpenAccountPage.tsx
 * │   │   ├── components/
 * │   │   │   ├── AccountCard.tsx
 * │   │   │   ├── AccountHistory.tsx
 * │   │   │   └── DailyBalanceChart.tsx
 * │   │   ├── api/
 * │   │   │   └── accountsApi.ts
 * │   │   └── types/
 * │   │       └── accounts.types.ts
 * │   │
 * │   ├── transactions/
 * │   │   ├── pages/
 * │   │   │   ├── DepositPage.tsx
 * │   │   │   ├── WithdrawPage.tsx
 * │   │   │   ├── TransferPage.tsx        — multi-step (stepper)
 * │   │   │   └── TransactionHistoryPage.tsx
 * │   │   ├── components/
 * │   │   │   ├── TransferStepper.tsx     — 4 pasos: datos → confirmar → MFA → resultado
 * │   │   │   ├── AmountInput.tsx
 * │   │   │   └── TransactionRow.tsx
 * │   │   ├── store/
 * │   │   │   └── transferStore.ts        — Zustand: state machine del flujo
 * │   │   └── api/
 * │   │       └── transactionsApi.ts
 * │   │
 * │   ├── notifications/
 * │   │   ├── pages/
 * │   │   │   └── NotificationsPage.tsx
 * │   │   ├── components/
 * │   │   │   ├── NotificationBell.tsx    — badge con count
 * │   │   │   └── NotificationItem.tsx
 * │   │   └── hooks/
 * │   │       └── useNotifications.ts     — Socket.io real-time
 * │   │
 * │   ├── profile/
 * │   │   ├── pages/
 * │   │   │   ├── ProfilePage.tsx
 * │   │   │   └── SecurityPage.tsx        — MFA, cambio password, sesiones
 * │   │   └── components/
 * │   │       ├── SessionList.tsx
 * │   │       └── MFASetup.tsx
 * │   │
 * │   └── admin/
 * │       ├── pages/
 * │       │   ├── CustomerListPage.tsx
 * │       │   ├── CustomerDetailPage.tsx
 * │       │   ├── AuditLogPage.tsx
 * │       │   └── EventExplorerPage.tsx
 * │       └── components/
 * │           ├── CustomerTable.tsx
 * │           └── AuditTable.tsx
 * │
 * ├── shared/
 * │   ├── components/
 * │   │   ├── ui/                         — Shadcn/ui (Button, Input, Card, Dialog, etc.)
 * │   │   ├── layout/
 * │   │   │   ├── AppLayout.tsx           — Sidebar + TopBar
 * │   │   │   ├── AuthLayout.tsx          — centrado, fondo sutil
 * │   │   │   ├── Sidebar.tsx
 * │   │   │   ├── TopBar.tsx
 * │   │   │   └── MobileNav.tsx           — bottom bar (<640px)
 * │   │   └── domain/
 * │   │       ├── MoneyDisplay.tsx         — DECIMAL formateado, color semántico
 * │   │       ├── CLABEDisplay.tsx         — monospace, agrupado 4-4-10
 * │   │       ├── StatusBadge.tsx          — colores por estado
 * │   │       └── AccountSelector.tsx
 * │   │
 * │   ├── hooks/
 * │   │   ├── useSocket.ts                — conexión Socket.io singleton
 * │   │   └── useMediaQuery.ts
 * │   │
 * │   ├── lib/
 * │   │   ├── api.ts                      — fetch wrapper con interceptors JWT
 * │   │   ├── queryClient.ts              — TanStack Query config
 * │   │   └── cn.ts                       — clsx + tailwind-merge helper
 * │   │
 * │   └── types/
 * │       └── common.types.ts
 * │
 * ├── routes/
 * │   ├── index.tsx                       — route definitions
 * │   ├── ProtectedRoute.tsx              — auth guard
 * │   └── AdminRoute.tsx                  — role guard (AUDITOR | ADMIN)
 * │
 * └── styles/
 *     └── globals.css                     — Tailwind directives + design tokens
 *
 * Rutas:
 * ├── /auth/login, /register, /mfa-verify, /forgot-password, /reset-password
 * ├── /dashboard
 * ├── /accounts, /accounts/:id
 * ├── /deposit, /withdraw, /transfer
 * ├── /transactions
 * ├── /notifications
 * ├── /profile, /profile/security
 * └── /admin/customers, /admin/customers/:id, /admin/audit, /admin/events
 *
 * Design Tokens:
 * - Primary: #1B3A5C (azul marino)
 * - Success: #22C55E | Danger: #EF4444 | Warning: #F59E0B | Info: #3B82F6
 * - Font: Inter (text) + JetBrains Mono (montos/CLABE)
 * - Breakpoints: Mobile <640, Tablet 640-1023, Desktop 1024+
 */
