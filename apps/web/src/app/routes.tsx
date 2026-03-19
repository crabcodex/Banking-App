import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuthLayout from '@/shared/components/layout/AuthLayout';
import RegisterPage from '@/features/auth/pages/RegisterPage';

export const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="auth/register" element={<RegisterPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
