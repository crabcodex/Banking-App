import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';
import { OpenAccountPage } from '@/features/accounts/pages/OpenAccountPage';

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'accounts/new', element: <OpenAccountPage /> },
    ],
  },
]);
