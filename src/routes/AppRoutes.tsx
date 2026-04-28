import { ReactElement } from 'react';
import HomePage from '@/features/home/HomePage';
import SigninPage from '@/features/auth/SigninPage';
import RegisterPage from '@/features/auth/RegisterPage';
import DashboardPage from '@/features/dashboard/DashboardPage';
import NotFoundPage from '@/features/misc/NotFoundPage';
import { BlogPage } from '@/features/blog/blogpage';
import BlogDetail from '@/features/blog/blogdetail';
import LandingLayout from '@/components/layout/LandingLayout';
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
  {
    path: '/blog',
    element: (
      <LandingLayout>
        <BlogPage />
      </LandingLayout>
    ),
  },
  {
    path: '/blogs/:slug',
    element: (
      <LandingLayout>
        <BlogDetail />
      </LandingLayout>
    ),
  },
  { path: '*', element: <NotFoundPage /> },
];

export default AppRoutes;
