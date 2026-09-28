import { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import DataTable from '../components/ui/DataTable';
import Button from '../components/ui/Button';
import SearchInput from '../components/shared/SearchInput';
import StatusBadge from '../components/ui/StatusBadge';
import Pagination from '../components/shared/Pagination';
import Modal from '../components/ui/Modal';
import FormField from '../components/ui/FormField';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { useDialog } from '../hooks/useDialog';

export default function VendasPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { destructiveConfirm } = useDialog();

  const [sales, setSales] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    fk_ordem_producao: '',
    fk_usuario_gerente: '',
    valor_venda: '',
    data_venda: new Date().toISOString().split('T')[0],
    data_entrega_final: '',
    status_venda: 'PENDENTE',
    observacoes: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [salesRes, ordersRes] = await Promise.allSettled([
        api.get('/vendas'),
        api.get('/ordem_producao'),
      ]);

      if (salesRes.status === 'fulfilled' && Array.isArray(salesRes.value)) {
        setSales(salesRes.value);
      }
      if (ordersRes.status === 'fulfilled' && Array.isArray(ordersRes.value)) {
        setOrders(ordersRes.value);
      }
    } catch (err) {
      toast.error('Erro ao carregar faturamento e vendas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (sale = null) => {
    setSelectedSale(sale);
    if (sale) {
      setFormData({
        fk_ordem_producao: sale.fk_ordem_producao || '',
        fk_usuario_gerente: sale.fk_usuario_gerente || user?.id_usuario || '',
        valor_venda: sale.valor_venda || '',
        data_venda: sale.data_venda ? sale.data_venda.split('T')[0] : '',
        data_entrega_final: sale.data_entrega_final ? sale.data_entrega_final.split('T')[0] : '',
        status_venda: sale.status_venda || 'PENDENTE',
        observacoes: sale.observacoes || '',
      });
    } else {
      setFormData({
        fk_ordem_producao: orders[0]?.id_ordem_producao || '',
        fk_usuario_gerente: user?.id_usuario || '',
        valor_venda: '',
        data_venda: new Date().toISOString().split('T')[0],
        data_entrega_final: '',
        status_venda: 'PENDENTE',
        observacoes: '',
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.valor_venda) {
      toast.warning('Informe o valor da venda.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        fk_ordem_producao: formData.fk_ordem_producao ? Number(formData.fk_ordem_producao) : null,
        fk_usuario_gerente: user?.id_usuario || Number(formData.fk_usuario_gerente),
        valor_venda: Number(formData.valor_venda),
      };

      if (selectedSale) {
        await api.put(`/vendas/${selectedSale.id_venda || selectedSale.id}`, payload);
        toast.success('Venda atualizada com sucesso!');
      } else {
        await api.post('/vendas', payload);
        toast.success('Venda faturada com sucesso!');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Erro ao registrar venda.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (sale) => {
    const id = sale.id_venda || sale.id;
    const confirmed = await destructiveConfirm({
      title: 'Cancelar / Excluir Venda',
      message: `Tem certeza que deseja cancelar o registro de venda #${id}?`,
    });

    if (confirmed) {
      try {
        await api.delete(`/vendas/${id}`);
        toast.success('Venda removida.');
        fetchData();
      } catch (err) {
        toast.error(err.message || 'Erro ao excluir venda.');
      }
    }
  };

  const totalFaturamento = useMemo(() => {
    return sales
      .filter((s) => s.status_venda === 'PAGO' || s.status_venda === 'CONCLUIDO')
      .reduce((acc, s) => acc + (Number(s.valor_venda) || 0), 0);
  }, [sales]);

  const filteredSales = useMemo(() => {
    return sales.filter((s) => {
      const matchSearch =
        !search ||
        (s.observacoes && s.observacoes.toLowerCase().includes(search.toLowerCase())) ||
        String(s.id_venda).includes(search);

      if (!matchSearch) return false;
      if (statusFilter === 'PAGO') return s.status_venda === 'PAGO';
      if (statusFilter === 'PENDENTE') return s.status_venda === 'PENDENTE';
      return true;
    });
  }, [sales, search, statusFilter]);

  const paginatedSales = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredSales.slice(start, start + pageSize);
  }, [filteredSales, page, pageSize]);

  const columns = [
    {
      header: 'ID / Venda',
      accessor: 'id_venda',
      sortable: true,
      render: (val, row) => (
        <span className="font-label-code font-bold text-primary">
          VD-{String(val || row.id).padStart(4, '0')}
        </span>
      ),
    },
    {
      header: 'OP Vinculada',
      accessor: 'fk_ordem_producao',
      render: (val) => {
        const op = orders.find((o) => (o.id_ordem_producao || o.id) === val);
        return (
          <div className="flex flex-col">
            <span className="font-semibold text-on-surface">
              {op ? op.nome_projeto : val ? `OP #${val}` : 'Venda Direta'}
            </span>
          </div>
        );
      },
    },
    {
      header: 'Valor Faturado',
      accessor: 'valor_venda',
      sortable: true,
      render: (val) => (
        <span className="font-label-metric text-[16px] font-bold text-emerald-600 dark:text-emerald-400">
          R$ {Number(val || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      header: 'Data da Venda',
      accessor: 'data_venda',
      render: (val) => (
        <span className="font-label-code text-[12px] text-secondary">
          {val ? new Date(val).toLocaleDateString('pt-BR') : '—'}
        </span>
      ),
    },
    {
      header: 'Entrega Final',
      accessor: 'data_entrega_final',
      render: (val) => (
        <span className="font-label-code text-[12px] text-on-surface">
          {val ? new Date(val).toLocaleDateString('pt-BR') : 'A programar'}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status_venda',
      render: (val) => <StatusBadge status={val} />,
    },
    {
      header: 'Ações',
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => handleOpenModal(row)}
            className="p-1.5 rounded text-secondary hover:text-primary hover:bg-surface-container transition-colors"
            title="Editar Venda"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
          </button>
          <button
            type="button"
            onClick={() => handleDelete(row)}
            className="p-1.5 rounded text-secondary hover:text-error hover:bg-surface-container transition-colors"
            title="Excluir Venda"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-container-lowest p-5 rounded-lg border border-outline-variant/30 shadow-xs">
        <div>
          <h1 className="text-headline-lg font-bold text-on-surface">
            Gestão Comercial & Faturamento
          </h1>
          <p className="text-body-md text-secondary">
            Controle de contratos, pedidos entregues e faturamento consolidado.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-label-code text-[13px] font-bold">
            Total Faturado: R$ {totalFaturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <Button variant="primary" icon="point_of_sale" onClick={() => handleOpenModal()}>
            Lançar Venda
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 bg-surface-container-lowest p-4 rounded-lg border border-outline-variant/30 shadow-xs">
        <div className="w-full md:w-80">
          <SearchInput
            value={search}
            onChange={(val) => {
              setSearch(val);
              setPage(1);
            }}
            placeholder="Buscar por ID ou observação..."
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setStatusFilter('ALL');
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded text-body-sm font-semibold transition-all ${
              statusFilter === 'ALL'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'bg-surface-container-low text-secondary hover:text-on-surface'
            }`}
          >
            Todas ({sales.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setStatusFilter('PAGO');
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded text-body-sm font-semibold transition-all ${
              statusFilter === 'PAGO'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-surface-container-low text-secondary hover:text-on-surface'
            }`}
          >
            Pagas
          </button>
          <button
            type="button"
            onClick={() => {
              setStatusFilter('PENDENTE');
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded text-body-sm font-semibold transition-all ${
              statusFilter === 'PENDENTE'
                ? 'bg-amber-500 text-slate-900 shadow-xs'
                : 'bg-surface-container-low text-secondary hover:text-on-surface'
            }`}
          >
            Pendentes
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={paginatedSales}
        keyField="id_venda"
        loading={loading}
        emptyTitle="Nenhuma venda faturada"
        emptyDescription="Registre faturamentos e entregas de ordens de produção."
        emptyActionLabel="Lançar Venda"
        onEmptyAction={() => handleOpenModal()}
      />

      {filteredSales.length > 0 && (
        <Pagination
          currentPage={page}
          totalItems={filteredSales.length}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      )}

      {/* Sales Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedSale ? 'Editar Venda' : 'Lançar Nova Venda'}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FormField
            label="Ordem de Produção Relacionada (Opcional)"
            name="fk_ordem_producao"
            type="select"
            value={formData.fk_ordem_producao}
            onChange={(e) => setFormData({ ...formData, fk_ordem_producao: e.target.value })}
            icon="precision_manufacturing"
          >
            <option value="">Venda direta (sem OP)</option>
            {orders.map((o) => (
              <option key={o.id_ordem_producao || o.id} value={o.id_ordem_producao || o.id}>
                OP-{String(o.id_ordem_producao || o.id).padStart(4, '0')}: {o.nome_projeto}
              </option>
            ))}
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="Valor da Venda (R$)"
              name="valor_venda"
              type="number"
              step="0.01"
              value={formData.valor_venda}
              onChange={(e) => setFormData({ ...formData, valor_venda: e.target.value })}
              placeholder="0.00"
              required
              icon="attach_money"
            />

            <FormField
              label="Status da Venda"
              name="status_venda"
              type="select"
              value={formData.status_venda}
              onChange={(e) => setFormData({ ...formData, status_venda: e.target.value })}
            >
              <option value="PENDENTE">Pendente</option>
              <option value="PAGO">Pago / Liquidado</option>
              <option value="CANCELADO">Cancelado</option>
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="Data da Venda"
              name="data_venda"
              type="date"
              value={formData.data_venda}
              onChange={(e) => setFormData({ ...formData, data_venda: e.target.value })}
              required
              icon="calendar_today"
            />

            <FormField
              label="Data de Entrega Final"
              name="data_entrega_final"
              type="date"
              value={formData.data_entrega_final}
              onChange={(e) => setFormData({ ...formData, data_entrega_final: e.target.value })}
              icon="local_shipping"
            />
          </div>

          <FormField
            label="Observações / Cliente"
            name="observacoes"
            type="textarea"
            rows={2}
            value={formData.observacoes}
            onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
            placeholder="Informações do cliente, nota fiscal..."
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant/30">
            <Button variant="ghost" onClick={() => setModalOpen(false)} disabled={submitting}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              {selectedSale ? 'Salvar Venda' : 'Confirmar Venda'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
