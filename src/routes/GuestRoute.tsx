import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface GuestRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

/** Keep authenticated users out of sign-in / register pages. */
const GuestRoute = ({ children, redirectTo = '/dashboard' }: GuestRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (isAuthenticated) return <Navigate to={redirectTo} replace />;
  return <>{children}</>;
};

export default GuestRoute;
