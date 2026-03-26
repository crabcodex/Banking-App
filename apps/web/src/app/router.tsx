import { createBrowserRouter } from 'react-router-dom';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { PortalSelector } from '@/components/layout/PortalSelector';
import { AdminDashboardPage } from '@/portals/admin/features/dashboard/pages/AdminDashboardPage';
import { DashboardPage } from '@/portals/client/features/dashboard/pages/DashboardPage';
import { AccountsListPage } from '@/portals/admin/features/accounts/pages/AccountsListPage';
import { OpenAccountPage } from '@/portals/admin/features/accounts/pages/OpenAccountPage';
import { CustomersPage } from '@/portals/admin/features/customers/pages/CustomersPage';
import { CustomerProfilePage } from '@/portals/admin/features/customers/pages/CustomerProfilePage';
import { TransfersPage } from '@/portals/admin/features/transfers/pages/TransfersPage';
import { LoansPage } from '@/portals/admin/features/loans/pages/LoansPage';
import { CompliancePage } from '@/portals/admin/features/compliance/pages/CompliancePage';
import { ReportsPage } from '@/portals/admin/features/reports/pages/ReportsPage';
import { AuditPage } from '@/portals/admin/features/audit/pages/AuditPage';
import { UsersPage } from '@/portals/admin/features/users/pages/UsersPage';
import { SettingsPage } from '@/portals/admin/features/settings/pages/SettingsPage';

export const router = createBrowserRouter([
  {
    index: true,
    element: <PortalSelector />,
  },
  {
    path: 'admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminDashboardPage /> },
      { path: 'customers', element: <CustomersPage /> },
      { 
        path: 'customers/:customerId', 
        element: <CustomerProfilePage />,
        children: [
          { path: 'accounts/new', element: <OpenAccountPage /> }
        ]
      },      
      { path: 'accounts', element: <AccountsListPage /> },
      { path: 'accounts/new', element: <OpenAccountPage /> },
      { path: 'transfers', element: <TransfersPage /> },
      { path: 'loans', element: <LoansPage /> },
      { path: 'compliance', element: <CompliancePage /> },
      { path: 'reports', element: <ReportsPage /> },
      { path: 'audit', element: <AuditPage /> },
      { path: 'users', element: <UsersPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
  {
    path: 'portal',
    children: [
      { index: true, element: <DashboardPage /> },
    ],
  },
]);
