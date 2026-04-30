import { ReactNode, useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import AdminSidebar from '@/features/admin/pages/common/AdminSidebar';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background-dark flex">
      {/* Sidebar */}
      <AdminSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content Area */}
      <div 
        className={`flex-1 flex flex-col min-w-0 transition-all duration-500 ${isSidebarOpen ? 'ml-64' : 'ml-0 md:ml-[88px]'}`}
      >
                <Header variant="landing" />
        
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto w-full mt-4">
            {children}
          </div>
        </main>
                
        <Footer />

      </div>
    </div>
  );
};

export default AdminLayout;
