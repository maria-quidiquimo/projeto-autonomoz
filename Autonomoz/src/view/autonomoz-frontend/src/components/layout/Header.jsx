import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { useSidebar } from '../../hooks/useSidebar';
import logoImg from '../../assets/logo.png';

export default function Header() {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { isCollapsed, toggleMobileSidebar, activeAlertsCount } = useSidebar();
  const navigate = useNavigate();

  const [currentDateTime, setCurrentDateTime] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatted = new Intl.DateTimeFormat('pt-BR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).format(now);
      setCurrentDateTime(formatted.charAt(0).toUpperCase() + formatted.slice(1));
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/estoque?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header
      className={`fixed top-0 right-0 h-16 bg-surface-container-lowest/90 backdrop-blur-md border-b border-outline-variant/30 z-30 flex items-center justify-between px-4 sm:px-6 transition-all duration-200 left-0 ${
        isCollapsed ? 'lg:left-18' : 'lg:left-64'
      }`}
    >
      {/* Left items: Mobile toggle + Date/Time + Line Status */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          type="button"
          onClick={toggleMobileSidebar}
          className="lg:hidden p-2 rounded-md text-secondary hover:text-on-surface hover:bg-surface-container transition-colors"
          aria-label="Abrir menu lateral"
        >
          <span className="material-symbols-outlined text-[24px]">menu</span>
        </button>

        {/* Mobile Brand Logo */}
        <div className="lg:hidden flex items-center gap-2">
          <img src={logoImg} alt="Logo" className="h-7 w-auto object-contain rounded" />
        </div>

        <div className="hidden md:flex items-center gap-3">
          <span className="font-label-code text-[12px] text-on-surface-variant font-medium">
            {currentDateTime}
          </span>
          <span className="text-outline-variant text-[14px]">|</span>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container text-tertiary font-label-code text-[11px] font-semibold border border-tertiary/20">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Linha Operacional: Online (99.8%)</span>
          </div>
        </div>
      </div>

      {/* Right items: Search, Theme Toggle, Alerts, User Avatar */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Search */}
        <div className="relative hidden sm:flex items-center">
          <span className="material-symbols-outlined absolute left-3 text-secondary text-[18px] pointer-events-none">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Consultar SKU, Lote ou OP..."
            className="h-10 pl-9 pr-3 w-56 lg:w-72 rounded bg-surface-container-low border border-outline/30 font-label-code text-body-sm text-on-surface placeholder:text-secondary focus:outline-none focus:border-primary transition-all"
          />
        </div>

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 rounded text-secondary hover:text-on-surface hover:bg-surface-container transition-all"
          title={isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
          aria-label="Alternar tema visual"
        >
          <span
            className={`material-symbols-outlined text-[22px] transition-transform duration-300 ${
              isDark ? 'rotate-180 text-amber-400' : 'rotate-0 text-slate-700'
            }`}
          >
            {isDark ? 'light_mode' : 'dark_mode'}
          </span>
        </button>

        {/* Alerts Bell */}
        <button
          type="button"
          onClick={() => navigate('/alertas')}
          className="relative p-2 rounded text-secondary hover:text-on-surface hover:bg-surface-container transition-colors"
          title="Notificações e Alertas"
          aria-label="Ver alertas"
        >
          <span className="material-symbols-outlined text-[22px]">notifications</span>
          {activeAlertsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-error rounded-full ring-2 ring-surface-container-lowest" />
          )}
        </button>

        {/* User avatar / profile button */}
        <div
          onClick={() => navigate('/usuarios')}
          className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold shadow-xs cursor-pointer hover:opacity-90 transition-opacity shrink-0 ml-1"
          title={`${user?.nome || 'Usuário'} (${user?.tipo_acesso || ''})`}
        >
          <span className="text-[14px]">
            {user?.nome ? user.nome.charAt(0).toUpperCase() : 'U'}
          </span>
        </div>
      </div>
    </header>
  );
}
