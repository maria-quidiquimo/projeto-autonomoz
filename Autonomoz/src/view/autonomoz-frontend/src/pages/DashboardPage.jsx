import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import KpiCard from '../components/ui/KpiCard';
import Button from '../components/ui/Button';
import DataTable from '../components/ui/DataTable';
import StatusBadge from '../components/ui/StatusBadge';
import Pagination from '../components/shared/Pagination';
import { useToast } from '../hooks/useToast';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [movements, setMovements] = useState([]);
  const [alertFilter, setAlertFilter] = useState('ALL'); // ALL | CRITICAL | WARNING
  const [movementPage, setMovementPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [prodRes, alertRes, orderRes, movRes] = await Promise.allSettled([
        api.get('/produtos'),
        api.get('/alertas_estoque'),
        api.get('/ordem_producao'),
        api.get('/movimentacoes'),
      ]);

      if (prodRes.status === 'fulfilled' && Array.isArray(prodRes.value)) {
        setProducts(prodRes.value);
      }
      if (alertRes.status === 'fulfilled' && Array.isArray(alertRes.value)) {
        setAlerts(alertRes.value);
      }
      if (orderRes.status === 'fulfilled' && Array.isArray(orderRes.value)) {
        setOrders(orderRes.value);
      }
      if (movRes.status === 'fulfilled' && Array.isArray(movRes.value)) {
        setMovements(movRes.value);
      }
    } catch (err) {
      toast.error('Erro ao carregar métricas do dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Compute KPIs
  const totalStockItems = useMemo(() => {
    return products.reduce((acc, p) => acc + (Number(p.estoque_atual) || 0), 0);
  }, [products]);

  const activeAlerts = useMemo(() => {
    return alerts.filter((a) => !a.resolvido);
  }, [alerts]);

  const criticalAlertsCount = useMemo(() => {
    return activeAlerts.filter(
      (a) =>
        a.tipo_alerta === 'ESTOQUE_MINIMO' ||
        String(a.tipo_alerta).includes('CRITICO')
    ).length;
  }, [activeAlerts]);

  const activeOrdersCount = useMemo(() => {
    return orders.filter(
      (o) =>
        o.status_ordem === 'EM_ANDAMENTO' ||
        o.status_ordem === 'EM PRODUÇÃO' ||
        o.status_ordem === 'PENDENTE'
    ).length;
  }, [orders]);

  const todayMovementsCount = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return movements.filter((m) => {
      const date = m.data_movimento || m.created_at || '';
      return date.startsWith(todayStr);
    }).length || movements.length;
  }, [movements]);

  // Filtered alerts for the alert list widget
  const filteredAlerts = useMemo(() => {
    if (alertFilter === 'CRITICAL') {
      return activeAlerts.filter(
        (a) =>
          a.tipo_alerta === 'ESTOQUE_MINIMO' ||
          String(a.tipo_alerta).includes('CRITICO')
      );
    }
    if (alertFilter === 'WARNING') {
      return activeAlerts.filter(
        (a) =>
          a.tipo_alerta === 'VALIDADE_PROXIMA' ||
          !String(a.tipo_alerta).includes('CRITICO')
      );
    }
    return activeAlerts;
  }, [activeAlerts, alertFilter]);

  // Paginated movements
  const paginatedMovements = useMemo(() => {
    const start = (movementPage - 1) * pageSize;
    return movements.slice(start, start + pageSize);
  }, [movements, movementPage, pageSize]);

  const movementColumns = [
    {
      header: 'ID / Data',
      accessor: 'id_movimentacao',
      render: (val, row) => (
        <div className="flex flex-col">
          <span className="font-label-code font-bold text-on-surface">
            #{val || row.id}
          </span>
          <span className="text-[11px] text-secondary font-label-code">
            {row.data_movimento ? new Date(row.data_movimento).toLocaleString('pt-BR') : 'Hoje'}
          </span>
        </div>
      ),
    },
    {
      header: 'Tipo',
      accessor: 'tipo_movimento',
      render: (val) => <StatusBadge status={val} />,
    },
    {
      header: 'Lote / Produto',
      accessor: 'fk_lote',
      render: (val, row) => (
        <div className="flex flex-col">
          <span className="font-label-code text-on-surface font-semibold">
            {row.codigo_lote || `Lote #${val}`}
          </span>
          <span className="text-[12px] text-secondary truncate max-w-[200px]">
            {row.nome_produto || row.motivo_saida || 'Material Operacional'}
          </span>
        </div>
      ),
    },
    {
      header: 'Quantidade',
      accessor: 'quantidade',
      render: (val, row) => {
        const isSaida = String(row.tipo_movimento).includes('SAIDA');
        return (
          <span
            className={`font-label-metric text-[15px] font-bold ${
              isSaida ? 'text-error' : 'text-emerald-600 dark:text-emerald-400'
            }`}
          >
            {isSaida ? `-${val}` : `+${val}`}
          </span>
        );
      },
    },
    {
      header: 'Responsável',
      accessor: 'nome_usuario',
      render: (val, row) => (
        <span className="text-body-sm text-secondary">
          {val || row.fk_usuario || 'Operador'}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Top Action & Overview Bar */}
      <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-surface-container-lowest p-5 rounded-lg border border-outline-variant/30 shadow-xs">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
            <h1 className="text-headline-lg font-bold text-on-surface tracking-tight">
              Visão Geral da Oficina e Manufatura
            </h1>
          </div>
          <p className="text-body-md text-secondary">
            Monitoramento em tempo real de suprimentos, lotes e fluxo de materiais.
          </p>
        </div>

        {/* Quick Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={fetchDashboardData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 h-11 rounded bg-surface-container-low text-secondary hover:text-on-surface font-label-code text-[12px] shadow-xs border border-outline-variant/30 cursor-pointer min-h-[44px]"
            title="Atualizar dados"
          >
            <span className={`material-symbols-outlined text-[18px] text-tertiary ${loading ? 'animate-spin' : ''}`}>
              sync
            </span>
            <span>Atualizar Painel</span>
          </button>

          <Button
            variant="secondary"
            icon="manage_search"
            onClick={() => navigate('/estoque')}
          >
            Consultar Estoque
          </Button>

          <Button
            variant="primary"
            icon="add_circle"
            onClick={() => navigate('/movimentacoes')}
          >
            Nova Movimentação
          </Button>
        </div>
      </section>

      {/* Top Row: 4 Industrial Metric KPI Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          title="Total de Itens em Estoque"
          value={loading ? '...' : totalStockItems.toLocaleString('pt-BR')}
          icon="inventory_2"
          subtext={`${products.length} SKUs cadastrados`}
          badgeText="Ativo"
          badgeVariant="info"
          loading={loading}
        />

        <KpiCard
          title="Alertas Ativos"
          value={loading ? '...' : String(activeAlerts.length).padStart(2, '0')}
          icon="warning"
          subtext={`${criticalAlertsCount} críticos de estoque mínimo`}
          badgeText={criticalAlertsCount > 0 ? 'Ação requerida' : 'Normal'}
          badgeVariant={criticalAlertsCount > 0 ? 'danger' : 'success'}
          variant={criticalAlertsCount > 0 ? 'danger' : 'default'}
          loading={loading}
        />

        <KpiCard
          title="Ordens em Andamento"
          value={loading ? '...' : String(activeOrdersCount).padStart(2, '0')}
          icon="precision_manufacturing"
          subtext={`${orders.length} OPs no histórico`}
          badgeText="Em linha"
          badgeVariant="warning"
          variant="warning"
          loading={loading}
        />

        <KpiCard
          title="Movimentações Registradas"
          value={loading ? '...' : movements.length.toLocaleString('pt-BR')}
          icon="sync_alt"
          subtext="Fluxo de entradas e saídas"
          badgeText="+ Hoje"
          badgeVariant="success"
          loading={loading}
        />
      </section>

      {/* Main Grid: Recent Movements & Active Alerts */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Movements Table (2 cols) */}
        <div className="lg:col-span-2 flex flex-col gap-3 bg-surface-container-lowest p-5 rounded-lg border border-outline-variant/30 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[22px]">
                swap_horiz
              </span>
              <h2 className="text-headline-sm font-bold text-on-surface">
                Movimentações Recentes
              </h2>
            </div>
            <button
              onClick={() => navigate('/movimentacoes')}
              className="text-body-sm font-semibold text-primary hover:underline flex items-center gap-1"
            >
              <span>Ver todas</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>

          <DataTable
            columns={movementColumns}
            data={paginatedMovements}
            keyField="id_movimentacao"
            loading={loading}
            emptyTitle="Nenhuma movimentação registrada"
            emptyDescription="Inicie registrando uma entrada ou saída de material."
            emptyActionLabel="Registrar Movimentação"
            onEmptyAction={() => navigate('/movimentacoes')}
          />

          {movements.length > 0 && (
            <Pagination
              currentPage={movementPage}
              totalItems={movements.length}
              pageSize={pageSize}
              onPageChange={setMovementPage}
              onPageSizeChange={setPageSize}
              pageSizeOptions={[5, 10, 20]}
            />
          )}
        </div>

        {/* Active Alerts Panel (1 col) */}
        <div className="flex flex-col gap-3 bg-surface-container-lowest p-5 rounded-lg border border-outline-variant/30 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-error text-[22px]">
                notifications_active
              </span>
              <h2 className="text-headline-sm font-bold text-on-surface">
                Painel de Alertas
              </h2>
            </div>
            <span className="px-2 py-0.5 rounded font-label-code text-[11px] font-bold bg-error/15 text-error">
              {activeAlerts.length}
            </span>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded">
            <button
              type="button"
              onClick={() => setAlertFilter('ALL')}
              className={`flex-1 py-1.5 rounded text-[12px] font-semibold transition-all ${
                alertFilter === 'ALL'
                  ? 'bg-surface-container-lowest text-on-surface shadow-xs'
                  : 'text-secondary hover:text-on-surface'
              }`}
            >
              Todos ({activeAlerts.length})
            </button>
            <button
              type="button"
              onClick={() => setAlertFilter('CRITICAL')}
              className={`flex-1 py-1.5 rounded text-[12px] font-semibold transition-all ${
                alertFilter === 'CRITICAL'
                  ? 'bg-surface-container-lowest text-error shadow-xs'
                  : 'text-secondary hover:text-on-surface'
              }`}
            >
              Críticos ({criticalAlertsCount})
            </button>
          </div>

          {/* Alert list */}
          <div className="flex flex-col gap-2.5 max-h-[380px] overflow-y-auto pr-1">
            {loading ? (
              Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="p-3 rounded bg-surface-container-low animate-pulse h-16" />
              ))
            ) : filteredAlerts.length === 0 ? (
              <div className="p-6 text-center text-secondary text-body-sm flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-emerald-500 text-[32px]">
                  check_circle
                </span>
                <span>Nenhum alerta pendente neste momento.</span>
              </div>
            ) : (
              filteredAlerts.slice(0, 5).map((alerta) => (
                <div
                  key={alerta.id_alerta}
                  className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/30 flex flex-col gap-1.5 hover:border-primary/40 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <StatusBadge status={alerta.tipo_alerta} />
                    <span className="font-label-code text-[11px] text-secondary">
                      {alerta.created_at ? new Date(alerta.created_at).toLocaleDateString('pt-BR') : 'Recente'}
                    </span>
                  </div>
                  <p className="text-body-sm text-on-surface font-medium line-clamp-2">
                    {alerta.descricao || 'Alerta de estoque gerado pelo sistema.'}
                  </p>
                </div>
              ))
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            className="w-full mt-2"
            onClick={() => navigate('/alertas')}
          >
            Ver Central Completa de Alertas
          </Button>
        </div>
      </section>
    </div>
  );
}
