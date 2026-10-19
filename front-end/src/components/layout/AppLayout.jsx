import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useSidebar } from '../../hooks/useSidebar';

export default function AppLayout() {
  const { isCollapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col selection:bg-primary/20 selection:text-primary">
      <Sidebar />
      <Header />
      
      <main
        className={`flex-1 pt-16 transition-all duration-200 min-h-screen ${
          isCollapsed ? 'lg:pl-[72px]' : 'lg:pl-64'
        }`}
      >
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto w-full animate-in fade-in duration-200">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
