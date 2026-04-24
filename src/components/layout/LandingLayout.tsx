import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';

interface LandingLayoutProps {
  children: ReactNode;
}

const LandingLayout = ({ children }: LandingLayoutProps) => {
  return (
    <>
      <Header variant="landing" />
      <main>{children}</main>
      <Footer />
    </>
  );
};

export default LandingLayout;
