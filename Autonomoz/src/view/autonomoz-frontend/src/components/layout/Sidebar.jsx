import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useSidebar } from '../../hooks/useSidebar';
import RoleBadge from '../shared/RoleBadge';
import logoImg from '../../assets/logo.png';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: 'grid_view' },
  { path: '/estoque', label: 'Estoque', icon: 'inventory_2' },
  { path: '/lotes', label: 'Lotes & Rastreabilidade', icon: 'qr_code_scanner' },
  { path: '/movimentacoes', label: 'Movimentações', icon: 'sync_alt' },
  { path: '/categorias', label: 'Categorias', icon: 'category' },
  { path: '/fornecedores', label: 'Fornecedores', icon: 'local_shipping' },
  { path: '/ordens-producao', label: 'Ordens de Produção', icon: 'precision_manufacturing' },
  { path: '/vendas', label: 'Vendas', icon: 'point_of_sale', gerenteOnly: true },
  { path: '/alertas', label: 'Alertas', icon: 'warning', hasBadge: true },
  { path: '/usuarios', label: 'Usuários & Cargos', icon: 'group', gerenteOnly: true },
  { path: '/relatorios', label: 'Logs & Relatórios', icon: 'analytics' },
];

export default function Sidebar() {
  const { user, isGerente, logout } = useAuth();
  const {
    isCollapsed,
    toggleSidebar,
    isMobileOpen,
    closeMobileSidebar,
    activeAlertsCount,
  } = useSidebar();

  const filteredNavItems = navItems.filter(
    (item) => !item.gerenteOnly || isGerente
  );

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between bg-[#131d2a] text-slate-100 select-none">
      {/* Brand Header */}
      <div>
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-700/50 bg-[#0f1722]">
          <div className="flex items-center gap-3 min-w-0 overflow-hidden">
            <img
              src={logoImg}
              alt="Autonomoz Logo"
              className="h-9 w-auto object-contain shrink-0 rounded"
            />
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-headline-md text-[16px] font-bold tracking-wider text-white leading-none truncate">
                  AUTONOMOZ
                </span>
                <span className="font-label-code text-[9px] uppercase tracking-widest text-slate-400 leading-tight">
                  ICS Platform
                </span>
              </div>
            )}
          </div>
          {!isCollapsed && user && (
            <RoleBadge role={user.tipo_acesso} className="shrink-0" />
          )}
        </div>

        {/* Navigation List */}
        <nav className="flex flex-col py-3 gap-1 px-2 overflow-y-auto max-h-[calc(100vh-140px)]">
          {filteredNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={closeMobileSidebar}
              title={isCollapsed ? item.label : undefined}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded transition-all min-h-[44px] group ${
                  isActive
                    ? 'bg-primary text-on-primary font-bold shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="material-symbols-outlined text-[20px] shrink-0">
                  {item.icon}
                </span>
                {!isCollapsed && (
                  <span className="text-body-md truncate">{item.label}</span>
                )}
              </div>

              {item.hasBadge && activeAlertsCount > 0 && (
                <span
                  className={`inline-flex items-center justify-center px-2 py-0.5 rounded font-label-code text-[11px] font-bold ${
                    isCollapsed
                      ? 'absolute right-2 w-2 h-2 p-0 rounded-full bg-error'
                      : 'bg-error text-on-error'
                  }`}
                >
                  {!isCollapsed && activeAlertsCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Footer / User Profile & Collapse Toggle */}
      <div className="p-3 border-t border-slate-700/50 bg-[#0f1722] flex flex-col gap-2">
        <div className="hidden lg:flex items-center justify-between">
          {!isCollapsed && (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded font-label-code text-[11px] text-cyan-300 bg-cyan-950/50 border border-cyan-800/40">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
              Planta Principal
            </span>
          )}
          <button
            type="button"
            onClick={toggleSidebar}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-auto"
            title={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
          >
            <span className="material-symbols-outlined text-[20px]">
              {isCollapsed ? 'chevron_right' : 'chevron_left'}
            </span>
          </button>
        </div>

        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold shrink-0">
              <span className="material-symbols-outlined text-[18px]">person</span>
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-body-sm font-bold truncate text-white">
                  {user?.nome || 'Operador'}
                </span>
                <span className="text-[11px] text-slate-400 truncate">
                  {user?.nome_cargo || user?.tipo_acesso || 'Terminal'}
                </span>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={logout}
            className="p-1.5 rounded text-slate-400 hover:text-error hover:bg-slate-800 transition-colors shrink-0"
            title="Encerrar Sessão"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside
        className={`hidden lg:block fixed left-0 top-0 h-full z-40 transition-all duration-200 shadow-xl border-r border-slate-800 ${
          isCollapsed ? 'w-[72px]' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          onClick={closeMobileSidebar}
          className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`lg:hidden fixed left-0 top-0 h-full w-64 z-50 transition-transform duration-200 shadow-2xl ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
