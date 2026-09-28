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

export default function LotesPage() {
  const { toast } = useToast();
  const { destructiveConfirm } = useDialog();

  const [lotes, setLotes] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLote, setSelectedLote] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    codigo_lote: '',
    fk_produto: '',
    fk_fornecedor: '',
    quantidade: 100,
    localizacao_fisica: '',
    data_entrada: new Date().toISOString().split('T')[0],
    data_validade: '',
    ativo: 1,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [loteRes, prodRes, suppRes] = await Promise.allSettled([
        api.get('/lotes'),
        api.get('/produtos'),
        api.get('/fornecedores'),
      ]);

      if (loteRes.status === 'fulfilled' && Array.isArray(loteRes.value)) {
        setLotes(loteRes.value);
      }
      if (prodRes.status === 'fulfilled' && Array.isArray(prodRes.value)) {
        setProducts(prodRes.value);
      }
      if (suppRes.status === 'fulfilled' && Array.isArray(suppRes.value)) {
        setSuppliers(suppRes.value);
      }
    } catch (err) {
      toast.error('Erro ao carregar dados de lotes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (lote = null) => {
    setSelectedLote(lote);
    if (lote) {
      setFormData({
        codigo_lote: lote.codigo_lote || '',
        fk_produto: lote.fk_produto || '',
        fk_fornecedor: lote.fk_fornecedor || '',
        quantidade: lote.quantidade || 0,
        localizacao_fisica: lote.localizacao_fisica || '',
        data_entrada: lote.data_entrada ? lote.data_entrada.split('T')[0] : '',
        data_validade: lote.data_validade ? lote.data_validade.split('T')[0] : '',
        ativo: lote.ativo !== undefined ? Number(lote.ativo) : 1,
      });
    } else {
      setFormData({
        codigo_lote: `LOT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
        fk_produto: products[0]?.id_produto || '',
        fk_fornecedor: suppliers[0]?.id_fornecedor || '',
        quantidade: 50,
        localizacao_fisica: 'GALPAO-A / RUA-01 / PRAT-02',
        data_entrada: new Date().toISOString().split('T')[0],
        data_validade: '',
        ativo: 1,
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.codigo_lote || !formData.fk_produto) {
      toast.warning('Código do lote e produto associado são obrigatórios.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        fk_produto: Number(formData.fk_produto),
        fk_fornecedor: formData.fk_fornecedor ? Number(formData.fk_fornecedor) : null,
        quantidade: Number(formData.quantidade) || 0,
      };

      if (selectedLote) {
        await api.put(`/lotes/${selectedLote.id_lote || selectedLote.id}`, payload);
        toast.success('Lote atualizado com sucesso!');
      } else {
        await api.post('/lotes', payload);
        toast.success('Novo lote cadastrado com sucesso!');
      }

      setModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Erro ao salvar lote.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (lote) => {
    const id = lote.id_lote || lote.id;
    const confirmed = await destructiveConfirm({
      title: 'Excluir Lote',
      message: `Tem certeza que deseja excluir o lote "${lote.codigo_lote}"? Esta ação removerá o histórico físico do lote.`,
      confirmText: 'Excluir Lote',
    });

    if (confirmed) {
      try {
        await api.delete(`/lotes/${id}`);
        toast.success('Lote excluído.');
        fetchData();
      } catch (err) {
        toast.error(err.message || 'Erro ao excluir lote.');
      }
    }
  };

  const filteredLotes = useMemo(() => {
    return lotes.filter((l) => {
      const matchSearch =
        !search ||
        (l.codigo_lote && l.codigo_lote.toLowerCase().includes(search.toLowerCase())) ||
        (l.localizacao_fisica && l.localizacao_fisica.toLowerCase().includes(search.toLowerCase())) ||
        (l.nome_produto && l.nome_produto.toLowerCase().includes(search.toLowerCase()));
      return matchSearch;
    });
  }, [lotes, search]);

  const paginatedLotes = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredLotes.slice(start, start + pageSize);
  }, [filteredLotes, page, pageSize]);

  const columns = [
    {
      header: 'Código do Lote',
      accessor: 'codigo_lote',
      sortable: true,
      render: (val) => (
        <span className="font-label-code font-bold text-primary">
          {val || '—'}
        </span>
      ),
    },
    {
      header: 'Produto Vinculado',
      accessor: 'nome_produto',
      sortable: true,
      render: (val, row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-on-surface">
            {val || products.find((p) => (p.id_produto || p.id) === row.fk_produto)?.nome_produto || `SKU #${row.fk_produto}`}
          </span>
          <span className="text-[12px] text-secondary font-label-code">
            {row.codigo_item || ''}
          </span>
        </div>
      ),
    },
    {
      header: 'Quantidade',
      accessor: 'quantidade',
      sortable: true,
      render: (val) => (
        <span className="font-label-metric text-[15px] font-bold text-on-surface">
          {val ?? 0}
        </span>
      ),
    },
    {
      header: 'Localização Física',
      accessor: 'localizacao_fisica',
      render: (val) => (
        <div className="flex items-center gap-1.5 font-label-code text-[12px] text-on-surface bg-surface-container px-2 py-0.5 rounded w-fit">
          <span className="material-symbols-outlined text-[15px] text-tertiary">
            location_on
          </span>
          <span>{val || 'Não atribuída'}</span>
        </div>
      ),
    },
    {
      header: 'Data de Entrada',
      accessor: 'data_entrada',
      render: (val) => (
        <span className="font-label-code text-[12px] text-secondary">
          {val ? new Date(val).toLocaleDateString('pt-BR') : '—'}
        </span>
      ),
    },
    {
      header: 'Validade / Risco',
      accessor: 'data_validade',
      render: (val) => {
        if (!val) return <span className="text-secondary text-[12px]">Sem validade</span>;
        const expDate = new Date(val);
        const now = new Date();
        const diffDays = Math.ceil((expDate - now) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
          return <StatusBadge status="CRÍTICO" label="Vencido" />;
        }
        if (diffDays <= 30) {
          return <StatusBadge status="ATENÇÃO" label={`${diffDays} dias`} />;
        }
        return <StatusBadge status="OK" label={expDate.toLocaleDateString('pt-BR')} />;
      },
    },
    {
      header: 'Ações',
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => handleOpenModal(row)}
            className="p-1.5 rounded text-secondary hover:text-primary hover:bg-surface-container transition-colors"
            title="Editar Lote"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
          </button>
          <button
            type="button"
            onClick={() => handleDelete(row)}
            className="p-1.5 rounded text-secondary hover:text-error hover:bg-surface-container transition-colors"
            title="Excluir Lote"
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
            Lotes & Rastreabilidade Física
          </h1>
          <p className="text-body-md text-secondary">
            Rastreamento de remessas industriais, datas de validade e posicionamento em prateleiras.
          </p>
        </div>

        <Button variant="primary" icon="qr_code_scanner" onClick={() => handleOpenModal()}>
          Novo Lote de Peças
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
            placeholder="Buscar por lote, produto ou galpão..."
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={paginatedLotes}
        keyField="id_lote"
        loading={loading}
        emptyTitle="Nenhum lote registrado"
        emptyDescription="Cadastre lotes recebidos para manter a rastreabilidade da oficina."
        emptyActionLabel="Cadastrar Lote"
        onEmptyAction={() => handleOpenModal()}
      />

      {filteredLotes.length > 0 && (
        <Pagination
          currentPage={page}
          totalItems={filteredLotes.length}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      )}

      {/* Lote Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedLote ? 'Editar Lote' : 'Cadastrar Novo Lote'}
        subtitle="Vincule a peça ao fornecedor e defina a localização no almoxarifado"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="Código do Lote"
              name="codigo_lote"
              value={formData.codigo_lote}
              onChange={(e) => setFormData({ ...formData, codigo_lote: e.target.value })}
              placeholder="Ex: LOT-2024-041"
              required
              icon="qr_code"
            />

            <FormField
              label="Produto Vinculado"
              name="fk_produto"
              type="select"
              value={formData.fk_produto}
              onChange={(e) => setFormData({ ...formData, fk_produto: e.target.value })}
              required
              icon="inventory_2"
            >
              <option value="">Selecione o produto...</option>
              {products.map((p) => (
                <option key={p.id_produto || p.id} value={p.id_produto || p.id}>
                  {p.codigo_item} — {p.nome_produto}
                </option>
              ))}
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="Fornecedor de Origem"
              name="fk_fornecedor"
              type="select"
              value={formData.fk_fornecedor}
              onChange={(e) => setFormData({ ...formData, fk_fornecedor: e.target.value })}
              icon="local_shipping"
            >
              <option value="">Selecione o fornecedor...</option>
              {suppliers.map((s) => (
                <option key={s.id_fornecedor || s.id} value={s.id_fornecedor || s.id}>
                  {s.razao_social}
                </option>
              ))}
            </FormField>

            <FormField
              label="Quantidade no Lote"
              name="quantidade"
              type="number"
              value={formData.quantidade}
              onChange={(e) => setFormData({ ...formData, quantidade: Number(e.target.value) })}
              required
              icon="pin"
            />
          </div>

          <FormField
            label="Localização Física no Almoxarifado"
            name="localizacao_fisica"
            value={formData.localizacao_fisica}
            onChange={(e) => setFormData({ ...formData, localizacao_fisica: e.target.value })}
            placeholder="Ex: Galpão B / Rua 04 / Prateleira 2 / Gaveta 12"
            icon="location_on"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="Data de Entrada"
              name="data_entrada"
              type="date"
              value={formData.data_entrada}
              onChange={(e) => setFormData({ ...formData, data_entrada: e.target.value })}
              required
              icon="calendar_today"
            />

            <FormField
              label="Data de Validade (Opcional)"
              name="data_validade"
              type="date"
              value={formData.data_validade}
              onChange={(e) => setFormData({ ...formData, data_validade: e.target.value })}
              icon="event_busy"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/30">
            <Button variant="ghost" onClick={() => setModalOpen(false)} disabled={submitting}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              {selectedLote ? 'Salvar Lote' : 'Registrar Lote'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
