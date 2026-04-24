import { ReactElement } from 'react';
import HomePage from '@/features/home/HomePage';
import SigninPage from '@/features/auth/SigninPage';
import RegisterPage from '@/features/auth/RegisterPage';
import DashboardPage from '@/features/dashboard/DashboardPage';
import NotFoundPage from '@/features/misc/NotFoundPage';
import ProtectedRoute from './ProtectedRoute';
import GuestRoute from './GuestRoute';

interface AppRoute {
  path: string;
  element: ReactElement;
}

const AppRoutes: AppRoute[] = [
  { path: '/', element: <HomePage /> },
  {
    path: '/signin',
    element: (
      <GuestRoute>
        <SigninPage />
      </GuestRoute>
    ),
  },
  {
    path: '/register',
    element: (
      <GuestRoute>
        <RegisterPage />
      </GuestRoute>
    ),
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
  { path: '*', element: <NotFoundPage /> },
];

export default AppRoutes;
