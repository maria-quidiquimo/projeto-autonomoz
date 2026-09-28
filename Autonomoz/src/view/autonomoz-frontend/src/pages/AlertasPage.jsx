import { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import DataTable from '../components/ui/DataTable';
import Button from '../components/ui/Button';
import SearchInput from '../components/shared/SearchInput';
import StatusBadge from '../components/ui/StatusBadge';
import Pagination from '../components/shared/Pagination';
import Modal from '../components/ui/Modal';
import FormField from '../components/ui/FormField';
import { useToast } from '../hooks/useToast';
import { useDialog } from '../hooks/useDialog';
import { useSidebar } from '../hooks/useSidebar';

export default function AlertasPage() {
  const { toast } = useToast();
  const { destructiveConfirm } = useDialog();
  const { setActiveAlertsCount } = useSidebar();

  const [alerts, setAlerts] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('UNRESOLVED'); // UNRESOLVED | RESOLVED | ALL
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    tipo_alerta: 'ESTOQUE_MINIMO',
    fk_produto: '',
    descricao: '',
  });

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const [alertRes, prodRes] = await Promise.allSettled([
        api.get('/alertas_estoque'),
        api.get('/produtos'),
      ]);

      if (alertRes.status === 'fulfilled' && Array.isArray(alertRes.value)) {
        setAlerts(alertRes.value);
        setActiveAlertsCount(alertRes.value.filter((a) => !a.resolvido).length);
      }
      if (prodRes.status === 'fulfilled' && Array.isArray(prodRes.value)) {
        setProducts(prodRes.value);
      }
    } catch (err) {
      toast.error('Erro ao carregar alertas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleResolve = async (alerta) => {
    const id = alerta.id_alerta || alerta.id;
    try {
      await api.put(`/alertas_estoque/${id}`, {
        ...alerta,
        resolvido: 1,
        resolvido_em: new Date().toISOString(),
      });
      toast.success('Alerta marcado como resolvido!');
      fetchAlerts();
    } catch (err) {
      toast.error(err.message || 'Erro ao resolver alerta.');
    }
  };

  const handleDelete = async (alerta) => {
    const id = alerta.id_alerta || alerta.id;
    const confirmed = await destructiveConfirm({
      title: 'Excluir Alerta',
      message: 'Tem certeza que deseja excluir permanentemente este alerta?',
    });

    if (confirmed) {
      try {
        await api.delete(`/alertas_estoque/${id}`);
        toast.success('Alerta removido.');
        fetchAlerts();
      } catch (err) {
        toast.error(err.message || 'Erro ao excluir alerta.');
      }
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.descricao) {
      toast.warning('Informe a descrição do alerta.');
      return;
    }

    try {
      await api.post('/alertas_estoque', {
        ...formData,
        fk_produto: formData.fk_produto ? Number(formData.fk_produto) : null,
        resolvido: 0,
      });
      toast.success('Alerta operacional registrado!');
      setModalOpen(false);
      fetchAlerts();
    } catch (err) {
      toast.error(err.message || 'Erro ao registrar alerta.');
    }
  };

  const filteredAlerts = useMemo(() => {
    return alerts.filter((a) => {
      const matchSearch =
        !search ||
        (a.descricao && a.descricao.toLowerCase().includes(search.toLowerCase())) ||
        (a.tipo_alerta && a.tipo_alerta.toLowerCase().includes(search.toLowerCase()));

      if (!matchSearch) return false;
      if (statusFilter === 'UNRESOLVED') return !a.resolvido;
      if (statusFilter === 'RESOLVED') return !!a.resolvido;
      return true;
    });
  }, [alerts, search, statusFilter]);

  const paginatedAlerts = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredAlerts.slice(start, start + pageSize);
  }, [filteredAlerts, page, pageSize]);

  const columns = [
    {
      header: 'ID',
      accessor: 'id_alerta',
      render: (val, row) => (
        <span className="font-label-code font-bold text-primary">
          #{val || row.id}
        </span>
      ),
    },
    {
      header: 'Tipo de Evento',
      accessor: 'tipo_alerta',
      sortable: true,
      render: (val) => <StatusBadge status={val} />,
    },
    {
      header: 'Descrição do Problema',
      accessor: 'descricao',
      render: (val) => (
        <span className="text-body-md font-medium text-on-surface">
          {val || 'Sem descrição cadastrada.'}
        </span>
      ),
    },
    {
      header: 'Item Vinculado',
      accessor: 'fk_produto',
      render: (val) => {
        if (!val) return <span className="text-secondary text-body-sm">Geral</span>;
        const p = products.find((prod) => (prod.id_produto || prod.id) === val);
        return (
          <span className="font-label-code text-[12px] text-on-surface">
            {p ? `${p.codigo_item} — ${p.nome_produto}` : `SKU #${val}`}
          </span>
        );
      },
    },
    {
      header: 'Status',
      accessor: 'resolvido',
      render: (val) => (
        <StatusBadge
          status={val ? 'RESOLVIDO' : 'CRÍTICO'}
          label={val ? 'Resolvido' : 'Pendente'}
        />
      ),
    },
    {
      header: 'Ações',
      render: (_, row) => (
        <div className="flex items-center gap-1.5">
          {!row.resolvido && (
            <Button
              size="sm"
              variant="outline"
              icon="check_circle"
              onClick={() => handleResolve(row)}
            >
              Resolver
            </Button>
          )}
          <button
            type="button"
            onClick={() => handleDelete(row)}
            className="p-1.5 rounded text-secondary hover:text-error hover:bg-surface-container transition-colors"
            title="Excluir Alerta"
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
            Monitoramento de Alertas Operacionais
          </h1>
          <p className="text-body-md text-secondary">
            Vigilância ativa sobre estoques mínimos, anomalias de linha e vencimentos de lotes.
          </p>
        </div>

        <Button
          variant="primary"
          icon="add_alert"
          onClick={() => {
            setFormData({
              tipo_alerta: 'ESTOQUE_MINIMO',
              fk_produto: '',
              descricao: '',
            });
            setModalOpen(true);
          }}
        >
          Novo Alerta Manual
        </Button>
      </div>

      <div className="flex items-center justify-between gap-4 bg-surface-container-lowest p-4 rounded-lg border border-outline-variant/30 shadow-xs">
        <div className="w-full md:w-80">
          <SearchInput
            value={search}
            onChange={(val) => {
              setSearch(val);
              setPage(1);
            }}
            placeholder="Buscar descrição ou tipo de alerta..."
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setStatusFilter('UNRESOLVED');
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded text-body-sm font-semibold transition-all ${
              statusFilter === 'UNRESOLVED'
                ? 'bg-error text-on-error shadow-xs'
                : 'bg-surface-container-low text-secondary hover:text-on-surface'
            }`}
          >
            Pendentes ({alerts.filter((a) => !a.resolvido).length})
          </button>
          <button
            type="button"
            onClick={() => {
              setStatusFilter('RESOLVED');
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded text-body-sm font-semibold transition-all ${
              statusFilter === 'RESOLVED'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-surface-container-low text-secondary hover:text-on-surface'
            }`}
          >
            Resolvidos
          </button>
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
            Todos ({alerts.length})
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={paginatedAlerts}
        keyField="id_alerta"
        loading={loading}
        emptyTitle="Nenhum alerta pendente"
        emptyDescription="O sistema não identificou nenhuma anomalia de estoque ou prazo."
      />

      {filteredAlerts.length > 0 && (
        <Pagination
          currentPage={page}
          totalItems={filteredAlerts.length}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      )}

      {/* Alert Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Gerar Alerta Operacional"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <FormField
            label="Tipo de Alerta"
            name="tipo_alerta"
            type="select"
            value={formData.tipo_alerta}
            onChange={(e) => setFormData({ ...formData, tipo_alerta: e.target.value })}
            required
          >
            <option value="ESTOQUE_MINIMO">Estoque Mínimo Atingido</option>
            <option value="VALIDADE_PROXIMA">Validade Próxima</option>
            <option value="ANOMALIA_PRODUCAO">Anomalia em Linha de Produção</option>
            <option value="DIVERGENCIA_FISICA">Divergência de Contagem Física</option>
          </FormField>

          <FormField
            label="Produto Relacionado (Opcional)"
            name="fk_produto"
            type="select"
            value={formData.fk_produto}
            onChange={(e) => setFormData({ ...formData, fk_produto: e.target.value })}
            icon="inventory_2"
          >
            <option value="">Nenhum (alerta geral)</option>
            {products.map((p) => (
              <option key={p.id_produto || p.id} value={p.id_produto || p.id}>
                {p.codigo_item} — {p.nome_produto}
              </option>
            ))}
          </FormField>

          <FormField
            label="Descrição do Alerta / Instrução"
            name="descricao"
            type="textarea"
            rows={3}
            value={formData.descricao}
            onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
            placeholder="Descreva a ação corretiva necessária..."
            required
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant/30">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              Publicar Alerta
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
