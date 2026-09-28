import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

export const SidebarContext = createContext(null);

export function SidebarProvider({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('autonomoz_sidebar_collapsed') === 'true';
  });
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeAlertsCount, setActiveAlertsCount] = useState(0);

  useEffect(() => {
    localStorage.setItem('autonomoz_sidebar_collapsed', isCollapsed ? 'true' : 'false');
  }, [isCollapsed]);

  // Fetch active alerts count periodically or on mount
  useEffect(() => {
    let isMounted = true;
    const fetchAlerts = async () => {
      try {
        const data = await api.get('/alertas_estoque');
        if (isMounted && Array.isArray(data)) {
          const count = data.filter(a => !a.resolvido).length;
          setActiveAlertsCount(count);
        }
      } catch (err) {
        // Silently fail if not logged in or endpoint unavailable
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const toggleSidebar = () => setIsCollapsed(prev => !prev);
  const toggleMobileSidebar = () => setIsMobileOpen(prev => !prev);
  const closeMobileSidebar = () => setIsMobileOpen(false);

  return (
    <SidebarContext.Provider
      value={{
        isCollapsed,
        setIsCollapsed,
        toggleSidebar,
        isMobileOpen,
        setIsMobileOpen,
        toggleMobileSidebar,
        closeMobileSidebar,
        activeAlertsCount,
        setActiveAlertsCount,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar deve ser usado dentro de um SidebarProvider');
  }
  return context;
};
