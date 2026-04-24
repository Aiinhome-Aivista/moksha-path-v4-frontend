import { ReactNode } from 'react';
import Header from './Header';
import AuthFooter from './AuthFooter';

interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="auth-body">
      <Header variant="auth" />
      {children}
      <AuthFooter />
    </div>
  );
};

export default AuthLayout;
