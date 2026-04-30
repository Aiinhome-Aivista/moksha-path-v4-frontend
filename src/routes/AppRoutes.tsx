import { ReactElement } from 'react';
import HomePage from '@/features/home/HomePage';
import SigninPage from '@/features/auth/SigninPage';
import RegisterPage from '@/features/auth/RegisterPage';
import DashboardPage from '@/features/dashboard/DashboardPage';
import NotFoundPage from '@/features/misc/NotFoundPage';
import { BlogPage } from '@/features/blog/blogpage';
import BlogDetail from '@/features/blog/blogdetail';
import LandingLayout from '@/components/layout/LandingLayout';
import AdminLayout from '@/components/layout/AdminLayout';
import ProtectedRoute from './ProtectedRoute';
import GuestRoute from './GuestRoute';

// Admin Pages
import AdminLogin from '@/features/admin/pages/category/AdminLogin';
import AdminDashboard from '@/features/admin/pages/AdminDashboard';
import ManageCategory from '@/features/admin/pages/category/ManageCategory';
import ManageBlog from '@/features/admin/pages/blog/ManageBlog';
import AddBlog from '@/features/admin/pages/blog/AddBlog';
import ManageSEO from '@/features/admin/pages/seo/ManageSEO';
import AddSEO from '@/features/admin/pages/seo/AddSEO';

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
  // --- Admin Routes ---
  {
    path: '/admin',
    element: <AdminLogin />, // AdminLogin has its own layout wrapped inside
  },
  {
    path: '/admin/dashboard',
    element: (
      <AdminLayout>
        <AdminDashboard />
      </AdminLayout>
    ),
  },
  {
    path: '/admin/manage-category',
    element: (
      <AdminLayout>
        <ManageCategory />
      </AdminLayout>
    ),
  },
  {
    path: '/admin/manage-blog',
    element: (
      <AdminLayout>
        <ManageBlog />
      </AdminLayout>
    ),
  },
  {
    path: '/admin/add-blog',
    element: (
      <AdminLayout>
        <AddBlog />
      </AdminLayout>
    ),
  },
  {
    path: '/admin/manage-seo',
    element: (
      <AdminLayout>
        <ManageSEO />
      </AdminLayout>
    ),
  },
  {
    path: '/admin/add-seo',
    element: (
      <AdminLayout>
        <AddSEO />
      </AdminLayout>
    ),
  },
  { path: '*', element: <NotFoundPage /> },
];

export default AppRoutes;
