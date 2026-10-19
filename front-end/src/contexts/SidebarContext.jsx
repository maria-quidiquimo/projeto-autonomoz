import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

export const SidebarContext = createContext(null);

export function SidebarProvider({ children }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeAlertsCount, setActiveAlertsCount] = useState(0);

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

  const toggleMobileSidebar = () => setIsMobileOpen(prev => !prev);
  const closeMobileSidebar = () => setIsMobileOpen(false);
  const isCollapsed = !isHovered && !isMobileOpen;

  return (
    <SidebarContext.Provider
      value={{
        isCollapsed,
        setIsHovered,
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
