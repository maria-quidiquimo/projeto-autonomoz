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

export default function OrdensProducaoPage() {
  const { toast } = useToast();
  const { destructiveConfirm } = useDialog();

  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // OP Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Materials & Staff Detail Modal
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [activeOPDetail, setActiveOPDetail] = useState(null);
  const [opMaterials, setOpMaterials] = useState([]);
  const [opEmployees, setOpEmployees] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Add material sub-form inside detail modal
  const [newMaterialProduct, setNewMaterialProduct] = useState('');
  const [newMaterialQty, setNewMaterialQty] = useState(1);

  // Add employee sub-form inside detail modal
  const [newEmployeeUser, setNewEmployeeUser] = useState('');

  const [formData, setFormData] = useState({
    nome_projeto: '',
    descricao: '',
    fk_usuario_responsavel: '',
    data_inicio: new Date().toISOString().split('T')[0],
    data_previsao_entrega: '',
    status_ordem: 'EM_ANDAMENTO',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [orderRes, userRes, prodRes] = await Promise.allSettled([
        api.get('/ordem_producao'),
        api.get('/usuarios'),
        api.get('/produtos'),
      ]);

      if (orderRes.status === 'fulfilled' && Array.isArray(orderRes.value)) {
        setOrders(orderRes.value);
      }
      if (userRes.status === 'fulfilled' && Array.isArray(userRes.value)) {
        setUsers(userRes.value);
      }
      if (prodRes.status === 'fulfilled' && Array.isArray(prodRes.value)) {
        setProducts(prodRes.value);
      }
    } catch (err) {
      toast.error('Erro ao carregar Ordens de Produção.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (order = null) => {
    setSelectedOrder(order);
    if (order) {
      setFormData({
        nome_projeto: order.nome_projeto || '',
        descricao: order.descricao || '',
        fk_usuario_responsavel: order.fk_usuario_responsavel || '',
        data_inicio: order.data_inicio ? order.data_inicio.split('T')[0] : '',
        data_previsao_entrega: order.data_previsao_entrega ? order.data_previsao_entrega.split('T')[0] : '',
        status_ordem: order.status_ordem || 'EM_ANDAMENTO',
      });
    } else {
      setFormData({
        nome_projeto: '',
        descricao: '',
        fk_usuario_responsavel: users[0]?.id_usuario || '',
        data_inicio: new Date().toISOString().split('T')[0],
        data_previsao_entrega: '',
        status_ordem: 'EM_ANDAMENTO',
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nome_projeto) {
      toast.warning('O nome do projeto/OP é obrigatório.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        fk_usuario_responsavel: formData.fk_usuario_responsavel ? Number(formData.fk_usuario_responsavel) : null,
      };

      if (selectedOrder) {
        await api.put(`/ordem_producao/${selectedOrder.id_ordem_producao || selectedOrder.id}`, payload);
        toast.success('Ordem de Produção atualizada!');
      } else {
        await api.post('/ordem_producao', payload);
        toast.success('Nova Ordem de Produção criada!');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Erro ao salvar OP.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (order) => {
    const id = order.id_ordem_producao || order.id;
    const confirmed = await destructiveConfirm({
      title: 'Excluir Ordem de Produção',
      message: `Tem certeza que deseja cancelar e excluir a OP "${order.nome_projeto}"?`,
    });

    if (confirmed) {
      try {
        await api.delete(`/ordem_producao/${id}`);
        toast.success('OP removida.');
        fetchData();
      } catch (err) {
        toast.error(err.message || 'Erro ao excluir OP.');
      }
    }
  };

  // Open Details Modal for materials & employees
  const handleOpenDetails = async (order) => {
    setActiveOPDetail(order);
    setDetailModalOpen(true);
    setLoadingDetails(true);

    try {
      const [matRes, empRes] = await Promise.allSettled([
        api.get('/ordem_producao_materiais'),
        api.get('/ordem_producao_funcionario'),
      ]);

      const opId = order.id_ordem_producao || order.id;

      if (matRes.status === 'fulfilled' && Array.isArray(matRes.value)) {
        setOpMaterials(matRes.value.filter((m) => m.fk_ordem_producao === opId));
      }
      if (empRes.status === 'fulfilled' && Array.isArray(empRes.value)) {
        setOpEmployees(empRes.value.filter((e) => e.fk_ordem_producao === opId));
      }
    } catch (err) {
      toast.error('Erro ao buscar alocações da OP.');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleAddMaterial = async (e) => {
    e.preventDefault();
    if (!newMaterialProduct || !newMaterialQty) return;
    try {
      const opId = activeOPDetail.id_ordem_producao || activeOPDetail.id;
      await api.post('/ordem_producao_materiais', {
        fk_ordem_producao: opId,
        fk_produto: Number(newMaterialProduct),
        quantidade_utilizada: Number(newMaterialQty),
      });
      toast.success('Material alocado com sucesso!');
      handleOpenDetails(activeOPDetail);
      setNewMaterialQty(1);
    } catch (err) {
      toast.error(err.message || 'Erro ao alocar material.');
    }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    if (!newEmployeeUser) return;
    try {
      const opId = activeOPDetail.id_ordem_producao || activeOPDetail.id;
      await api.post('/ordem_producao_funcionario', {
        fk_ordem_producao: opId,
        fk_usuario: Number(newEmployeeUser),
        data_alocacao: new Date().toISOString().split('T')[0],
      });
      toast.success('Funcionário alocado na linha!');
      handleOpenDetails(activeOPDetail);
    } catch (err) {
      toast.error(err.message || 'Erro ao alocar funcionário.');
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchSearch =
        !search ||
        (o.nome_projeto && o.nome_projeto.toLowerCase().includes(search.toLowerCase())) ||
        (o.descricao && o.descricao.toLowerCase().includes(search.toLowerCase()));

      if (!matchSearch) return false;
      if (statusFilter === 'ACTIVE') return o.status_ordem === 'EM_ANDAMENTO';
      if (statusFilter === 'DONE') return o.status_ordem === 'CONCLUIDA' || o.status_ordem === 'CONCLUIDO';
      return true;
    });
  }, [orders, search, statusFilter]);

  const paginatedOrders = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, page, pageSize]);

  const columns = [
    {
      header: 'ID / OP',
      accessor: 'id_ordem_producao',
      sortable: true,
      render: (val, row) => (
        <span className="font-label-code font-bold text-primary">
          OP-{String(val || row.id).padStart(4, '0')}
        </span>
      ),
    },
    {
      header: 'Projeto & Descrição',
      accessor: 'nome_projeto',
      sortable: true,
      render: (val, row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-on-surface">{val}</span>
          {row.descricao && (
            <span className="text-[12px] text-secondary line-clamp-1 max-w-sm">
              {row.descricao}
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Responsável',
      accessor: 'fk_usuario_responsavel',
      render: (val) => {
        const u = users.find((usr) => (usr.id_usuario || usr.id) === val);
        return (
          <span className="text-body-sm text-on-surface">
            {u ? u.nome || u.nome_completo : `Resp #${val || '—'}`}
          </span>
        );
      },
    },
    {
      header: 'Início',
      accessor: 'data_inicio',
      render: (val) => (
        <span className="font-label-code text-[12px] text-secondary">
          {val ? new Date(val).toLocaleDateString('pt-BR') : '—'}
        </span>
      ),
    },
    {
      header: 'Previsão',
      accessor: 'data_previsao_entrega',
      render: (val) => (
        <span className="font-label-code text-[12px] text-on-surface font-semibold">
          {val ? new Date(val).toLocaleDateString('pt-BR') : 'Sem prazo'}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status_ordem',
      render: (val) => <StatusBadge status={val} />,
    },
    {
      header: 'Ações',
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => handleOpenDetails(row)}
            className="p-1.5 rounded text-tertiary hover:bg-surface-container transition-colors"
            title="Alocação de Materiais e Pessoal"
          >
            <span className="material-symbols-outlined text-[18px]">build</span>
          </button>
          <button
            type="button"
            onClick={() => handleOpenModal(row)}
            className="p-1.5 rounded text-secondary hover:text-primary hover:bg-surface-container transition-colors"
            title="Editar OP"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
          </button>
          <button
            type="button"
            onClick={() => handleDelete(row)}
            className="p-1.5 rounded text-secondary hover:text-error hover:bg-surface-container transition-colors"
            title="Excluir OP"
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
            Ordens de Produção (OP)
          </h1>
          <p className="text-body-md text-secondary">
            Controle de linhas de montagem, alocação de peças e equipe operacional.
          </p>
        </div>

        <Button variant="primary" icon="precision_manufacturing" onClick={() => handleOpenModal()}>
          Nova Ordem de Produção
        </Button>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-surface-container-lowest p-4 rounded-lg border border-outline-variant/30 shadow-xs">
        <div className="w-full md:w-80">
          <SearchInput
            value={search}
            onChange={(val) => {
              setSearch(val);
              setPage(1);
            }}
            placeholder="Buscar por projeto ou descrição..."
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
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
            Todas ({orders.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setStatusFilter('ACTIVE');
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded text-body-sm font-semibold transition-all ${
              statusFilter === 'ACTIVE'
                ? 'bg-amber-500 text-slate-900 shadow-xs'
                : 'bg-surface-container-low text-secondary hover:text-on-surface'
            }`}
          >
            Em Andamento
          </button>
          <button
            type="button"
            onClick={() => {
              setStatusFilter('DONE');
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded text-body-sm font-semibold transition-all ${
              statusFilter === 'DONE'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-surface-container-low text-secondary hover:text-on-surface'
            }`}
          >
            Concluídas
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={paginatedOrders}
        keyField="id_ordem_producao"
        loading={loading}
        emptyTitle="Nenhuma ordem de produção registrada"
        emptyDescription="Crie uma nova OP para iniciar o fluxo fabril."
        emptyActionLabel="Criar OP"
        onEmptyAction={() => handleOpenModal()}
      />

      {filteredOrders.length > 0 && (
        <Pagination
          currentPage={page}
          totalItems={filteredOrders.length}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      )}

      {/* OP Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedOrder ? 'Editar Ordem de Produção' : 'Nova Ordem de Produção'}
        subtitle="Defina o projeto, prazo previsto e responsável técnico"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FormField
            label="Nome do Projeto / Linha"
            name="nome_projeto"
            value={formData.nome_projeto}
            onChange={(e) => setFormData({ ...formData, nome_projeto: e.target.value })}
            placeholder="Ex: Montagem Kit Suspensão Hilux 2024"
            required
            icon="precision_manufacturing"
          />

          <FormField
            label="Descrição Operacional"
            name="descricao"
            type="textarea"
            rows={2}
            value={formData.descricao}
            onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
            placeholder="Especificações da ordem..."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="Engenheiro / Responsável"
              name="fk_usuario_responsavel"
              type="select"
              value={formData.fk_usuario_responsavel}
              onChange={(e) => setFormData({ ...formData, fk_usuario_responsavel: e.target.value })}
              icon="person"
            >
              <option value="">Selecione o responsável...</option>
              {users.map((u) => (
                <option key={u.id_usuario || u.id} value={u.id_usuario || u.id}>
                  {u.nome || u.nome_completo} ({u.tipo_acesso})
                </option>
              ))}
            </FormField>

            <FormField
              label="Status da Linha"
              name="status_ordem"
              type="select"
              value={formData.status_ordem}
              onChange={(e) => setFormData({ ...formData, status_ordem: e.target.value })}
            >
              <option value="EM_ANDAMENTO">Em Andamento</option>
              <option value="PENDENTE">Pendente</option>
              <option value="CONCLUIDA">Concluída</option>
              <option value="CANCELADA">Cancelada</option>
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="Data de Início"
              name="data_inicio"
              type="date"
              value={formData.data_inicio}
              onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
              required
              icon="calendar_today"
            />

            <FormField
              label="Previsão de Entrega"
              name="data_previsao_entrega"
              type="date"
              value={formData.data_previsao_entrega}
              onChange={(e) => setFormData({ ...formData, data_previsao_entrega: e.target.value })}
              icon="event_available"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/30">
            <Button variant="ghost" onClick={() => setModalOpen(false)} disabled={submitting}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              {selectedOrder ? 'Salvar Alterações' : 'Criar Ordem'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Details Modal (Materials & Staff) */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={`Alocações da OP-${String(activeOPDetail?.id_ordem_producao || activeOPDetail?.id).padStart(4, '0')}: ${activeOPDetail?.nome_projeto || ''}`}
        subtitle="Gerenciamento de peças requisitadas e mão de obra alocada"
        maxWidth="max-w-3xl"
      >
        <div className="flex flex-col gap-6">
          {/* Materials Section */}
          <div className="flex flex-col gap-3 p-4 rounded-lg bg-surface-container-low border border-outline-variant/30">
            <h3 className="font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">
                inventory_2
              </span>
              <span>Materiais e Insumos Alocados ({opMaterials.length})</span>
            </h3>

            <form onSubmit={handleAddMaterial} className="flex flex-wrap items-end gap-2">
              <div className="flex-1 min-w-[200px]">
                <FormField
                  label="Adicionar Insumo/Peça"
                  type="select"
                  value={newMaterialProduct}
                  onChange={(e) => setNewMaterialProduct(e.target.value)}
                  required
                >
                  <option value="">Selecione o produto...</option>
                  {products.map((p) => (
                    <option key={p.id_produto || p.id} value={p.id_produto || p.id}>
                      {p.codigo_item} — {p.nome_produto}
                    </option>
                  ))}
                </FormField>
              </div>

              <div className="w-24">
                <FormField
                  label="Qtd."
                  type="number"
                  min="1"
                  value={newMaterialQty}
                  onChange={(e) => setNewMaterialQty(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" variant="primary" size="md" icon="add">
                Alocar
              </Button>
            </form>

            <div className="mt-2 flex flex-col gap-1 max-h-40 overflow-y-auto">
              {opMaterials.length === 0 ? (
                <span className="text-secondary text-[12px] italic">
                  Nenhum material alocado nesta OP ainda.
                </span>
              ) : (
                opMaterials.map((m, idx) => {
                  const prod = products.find((p) => (p.id_produto || p.id) === m.fk_produto);
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded bg-surface-container-lowest border border-outline-variant/20 text-body-sm"
                    >
                      <span className="font-semibold text-on-surface">
                        {prod ? `${prod.codigo_item} — ${prod.nome_produto}` : `Produto #${m.fk_produto}`}
                      </span>
                      <span className="font-label-metric font-bold text-primary">
                        {m.quantidade_utilizada} un
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Employees Section */}
          <div className="flex flex-col gap-3 p-4 rounded-lg bg-surface-container-low border border-outline-variant/30">
            <h3 className="font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-tertiary text-[20px]">
                engineering
              </span>
              <span>Funcionários Alocados na Linha ({opEmployees.length})</span>
            </h3>

            <form onSubmit={handleAddEmployee} className="flex flex-wrap items-end gap-2">
              <div className="flex-1 min-w-[200px]">
                <FormField
                  label="Alocar Operador/Técnico"
                  type="select"
                  value={newEmployeeUser}
                  onChange={(e) => setNewEmployeeUser(e.target.value)}
                  required
                >
                  <option value="">Selecione o operador...</option>
                  {users.map((u) => (
                    <option key={u.id_usuario || u.id} value={u.id_usuario || u.id}>
                      {u.nome || u.nome_completo} — Matrícula: {u.matricula}
                    </option>
                  ))}
                </FormField>
              </div>

              <Button type="submit" variant="secondary" size="md" icon="person_add">
                Vincular
              </Button>
            </form>

            <div className="mt-2 flex flex-col gap-1 max-h-40 overflow-y-auto">
              {opEmployees.length === 0 ? (
                <span className="text-secondary text-[12px] italic">
                  Nenhum operador vinculado ainda.
                </span>
              ) : (
                opEmployees.map((e, idx) => {
                  const emp = users.find((u) => (u.id_usuario || u.id) === e.fk_usuario);
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded bg-surface-container-lowest border border-outline-variant/20 text-body-sm"
                    >
                      <span className="font-semibold text-on-surface">
                        {emp ? emp.nome || emp.nome_completo : `Usuário #${e.fk_usuario}`}
                      </span>
                      <span className="font-label-code text-[12px] text-secondary">
                        {e.data_alocacao ? new Date(e.data_alocacao).toLocaleDateString('pt-BR') : 'Hoje'}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-outline-variant/30">
            <Button variant="ghost" onClick={() => setDetailModalOpen(false)}>
              Fechar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
