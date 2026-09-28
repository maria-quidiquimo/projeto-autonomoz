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

export default function MovimentacoesPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [movements, setMovements] = useState([]);
  const [lotes, setLotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL'); // ALL | ENTRADA | SAIDA | AJUSTE
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [modalOpen, setModalOpen] = useState(false);
  const [isAjusteModal, setIsAjusteModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    fk_lote: '',
    tipo_movimento: 'ENTRADA',
    quantidade: 1,
    motivo_saida: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [movRes, loteRes] = await Promise.allSettled([
        api.get('/movimentacoes'),
        api.get('/lotes'),
      ]);

      if (movRes.status === 'fulfilled' && Array.isArray(movRes.value)) {
        setMovements(movRes.value);
      }
      if (loteRes.status === 'fulfilled' && Array.isArray(loteRes.value)) {
        setLotes(loteRes.value);
      }
    } catch (err) {
      toast.error('Erro ao carregar movimentações.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (isAjuste = false) => {
    setIsAjusteModal(isAjuste);
    setFormData({
      fk_lote: lotes[0]?.id_lote || '',
      tipo_movimento: isAjuste ? 'AJUSTE_POSITIVO' : 'ENTRADA',
      quantidade: 1,
      motivo_saida: isAjuste ? 'Ajuste de inventário físico' : '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fk_lote || !formData.quantidade) {
      toast.warning('Informe o lote e a quantidade.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        fk_lote: Number(formData.fk_lote),
        fk_usuario: user?.id_usuario || null,
        tipo_movimento: formData.tipo_movimento,
        quantidade: Number(formData.quantidade),
        motivo_saida: formData.motivo_saida || null,
      };

      if (isAjusteModal) {
        await api.post('/movimentacoes/ajuste', payload);
        toast.success('Ajuste de inventário executado com sucesso!');
      } else {
        await api.post('/movimentacoes', payload);
        toast.success('Movimentação registrada com sucesso!');
      }

      setModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Erro ao registrar movimentação.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredMovements = useMemo(() => {
    return movements.filter((m) => {
      const matchSearch =
        !search ||
        (m.motivo_saida && m.motivo_saida.toLowerCase().includes(search.toLowerCase())) ||
        (m.codigo_lote && m.codigo_lote.toLowerCase().includes(search.toLowerCase())) ||
        (m.nome_produto && m.nome_produto.toLowerCase().includes(search.toLowerCase()));

      if (!matchSearch) return false;

      if (typeFilter === 'ENTRADA') return m.tipo_movimento === 'ENTRADA';
      if (typeFilter === 'SAIDA') return m.tipo_movimento === 'SAIDA';
      if (typeFilter === 'AJUSTE') return String(m.tipo_movimento).startsWith('AJUSTE');

      return true;
    });
  }, [movements, search, typeFilter]);

  const paginatedMovements = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredMovements.slice(start, start + pageSize);
  }, [filteredMovements, page, pageSize]);

  const columns = [
    {
      header: 'ID / Data',
      accessor: 'id_movimentacao',
      sortable: true,
      render: (val, row) => (
        <div className="flex flex-col">
          <span className="font-label-code font-bold text-on-surface">
            #{val || row.id}
          </span>
          <span className="text-[11px] text-secondary font-label-code">
            {row.data_movimento ? new Date(row.data_movimento).toLocaleString('pt-BR') : '—'}
          </span>
        </div>
      ),
    },
    {
      header: 'Tipo',
      accessor: 'tipo_movimento',
      sortable: true,
      render: (val) => <StatusBadge status={val} />,
    },
    {
      header: 'Lote / Peça',
      accessor: 'fk_lote',
      render: (val, row) => (
        <div className="flex flex-col">
          <span className="font-label-code font-bold text-primary">
            {row.codigo_lote || `Lote #${val}`}
          </span>
          <span className="text-[12px] text-secondary">
            {row.nome_produto || 'Material'}
          </span>
        </div>
      ),
    },
    {
      header: 'Quantidade',
      accessor: 'quantidade',
      sortable: true,
      render: (val, row) => {
        const isOut = String(row.tipo_movimento).includes('SAIDA') || row.tipo_movimento === 'AJUSTE_NEGATIVO';
        return (
          <span
            className={`font-label-metric text-[15px] font-bold ${
              isOut ? 'text-error' : 'text-emerald-600 dark:text-emerald-400'
            }`}
          >
            {isOut ? `-${val}` : `+${val}`}
          </span>
        );
      },
    },
    {
      header: 'Motivo / Aplicação',
      accessor: 'motivo_saida',
      render: (val) => (
        <span className="text-body-sm text-secondary line-clamp-1 max-w-xs">
          {val || '—'}
        </span>
      ),
    },
    {
      header: 'Operador',
      accessor: 'nome_usuario',
      render: (val, row) => (
        <span className="font-label-code text-[12px] text-on-surface">
          {val || row.fk_usuario || 'Operador'}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-container-lowest p-5 rounded-lg border border-outline-variant/30 shadow-xs">
        <div>
          <h1 className="text-headline-lg font-bold text-on-surface">
            Movimentações de Estoque
          </h1>
          <p className="text-body-md text-secondary">
            Registro detalhado de entrada, saída de suprimentos e reconciliação física.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" icon="tune" onClick={() => handleOpenModal(true)}>
            Ajuste de Balanço
          </Button>
          <Button variant="primary" icon="sync_alt" onClick={() => handleOpenModal(false)}>
            Nova Movimentação
          </Button>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-surface-container-lowest p-4 rounded-lg border border-outline-variant/30 shadow-xs">
        <div className="w-full md:w-80">
          <SearchInput
            value={search}
            onChange={(val) => {
              setSearch(val);
              setPage(1);
            }}
            placeholder="Buscar por lote, motivo ou produto..."
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <button
            type="button"
            onClick={() => {
              setTypeFilter('ALL');
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded text-body-sm font-semibold transition-all ${
              typeFilter === 'ALL'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'bg-surface-container-low text-secondary hover:text-on-surface'
            }`}
          >
            Todas ({movements.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setTypeFilter('ENTRADA');
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded text-body-sm font-semibold transition-all ${
              typeFilter === 'ENTRADA'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-surface-container-low text-secondary hover:text-on-surface'
            }`}
          >
            Entradas
          </button>
          <button
            type="button"
            onClick={() => {
              setTypeFilter('SAIDA');
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded text-body-sm font-semibold transition-all ${
              typeFilter === 'SAIDA'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-surface-container-low text-secondary hover:text-on-surface'
            }`}
          >
            Saídas
          </button>
          <button
            type="button"
            onClick={() => {
              setTypeFilter('AJUSTE');
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded text-body-sm font-semibold transition-all ${
              typeFilter === 'AJUSTE'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-surface-container-low text-secondary hover:text-on-surface'
            }`}
          >
            Ajustes
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={paginatedMovements}
        keyField="id_movimentacao"
        loading={loading}
        emptyTitle="Nenhuma movimentação encontrada"
        emptyDescription="Lance entradas ou baixas de peças para acompanhar o fluxo."
        emptyActionLabel="Lançar Movimentação"
        onEmptyAction={() => handleOpenModal(false)}
      />

      {filteredMovements.length > 0 && (
        <Pagination
          currentPage={page}
          totalItems={filteredMovements.length}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      )}

      {/* Movement / Adjustment Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isAjusteModal ? 'Ajuste de Inventário / Balanço' : 'Registrar Movimentação'}
        subtitle="Atualize o estoque físico com rastreabilidade do operador"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FormField
            label="Lote do Produto"
            name="fk_lote"
            type="select"
            value={formData.fk_lote}
            onChange={(e) => setFormData({ ...formData, fk_lote: e.target.value })}
            required
            icon="qr_code"
          >
            <option value="">Selecione o lote...</option>
            {lotes.map((l) => (
              <option key={l.id_lote || l.id} value={l.id_lote || l.id}>
                {l.codigo_lote} — {l.nome_produto || `Item #${l.fk_produto}`} (Qtd atual: {l.quantidade})
              </option>
            ))}
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="Tipo de Movimento"
              name="tipo_movimento"
              type="select"
              value={formData.tipo_movimento}
              onChange={(e) => setFormData({ ...formData, tipo_movimento: e.target.value })}
              required
            >
              {isAjusteModal ? (
                <>
                  <option value="AJUSTE_POSITIVO">Ajuste Positivo (+)</option>
                  <option value="AJUSTE_NEGATIVO">Ajuste Negativo (-)</option>
                </>
              ) : (
                <>
                  <option value="ENTRADA">Entrada no Estoque (+)</option>
                  <option value="SAIDA">Saída para Produção/Oficina (-)</option>
                </>
              )}
            </FormField>

            <FormField
              label="Quantidade"
              name="quantidade"
              type="number"
              min="1"
              value={formData.quantidade}
              onChange={(e) => setFormData({ ...formData, quantidade: e.target.value })}
              required
              icon="pin"
            />
          </div>

          <FormField
            label="Motivo / Justificativa Operacional"
            name="motivo_saida"
            type="textarea"
            rows={2}
            value={formData.motivo_saida}
            onChange={(e) => setFormData({ ...formData, motivo_saida: e.target.value })}
            placeholder="Ex: Utilizado na OP-881 / Recontagem de almoxarifado..."
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/30">
            <Button variant="ghost" onClick={() => setModalOpen(false)} disabled={submitting}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Confirmar Lançamento
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
