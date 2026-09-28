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

export default function FornecedoresPage() {
  const { toast } = useToast();
  const { destructiveConfirm } = useDialog();

  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    razao_social: '',
    contato_email: '',
    contato_telefone: '',
    ativo: 1,
  });

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const data = await api.get('/fornecedores');
      if (Array.isArray(data)) {
        setSuppliers(data);
      }
    } catch (err) {
      toast.error('Erro ao carregar fornecedores.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleOpenModal = (supplier = null) => {
    setSelectedSupplier(supplier);
    if (supplier) {
      setFormData({
        razao_social: supplier.razao_social || '',
        contato_email: supplier.contato_email || '',
        contato_telefone: supplier.contato_telefone || '',
        ativo: supplier.ativo !== undefined ? Number(supplier.ativo) : 1,
      });
    } else {
      setFormData({
        razao_social: '',
        contato_email: '',
        contato_telefone: '',
        ativo: 1,
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.razao_social) {
      toast.warning('A Razão Social do fornecedor é obrigatória.');
      return;
    }

    setSubmitting(true);
    try {
      if (selectedSupplier) {
        await api.put(`/fornecedores/${selectedSupplier.id_fornecedor || selectedSupplier.id}`, formData);
        toast.success('Fornecedor atualizado com sucesso!');
      } else {
        await api.post('/fornecedores', formData);
        toast.success('Fornecedor cadastrado com sucesso!');
      }
      setModalOpen(false);
      fetchSuppliers();
    } catch (err) {
      toast.error(err.message || 'Erro ao salvar fornecedor.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (supplier) => {
    const id = supplier.id_fornecedor || supplier.id;
    const confirmed = await destructiveConfirm({
      title: 'Excluir Fornecedor',
      message: `Tem certeza que deseja inativar/excluir "${supplier.razao_social}"?`,
      confirmText: 'Excluir',
    });

    if (confirmed) {
      try {
        await api.delete(`/fornecedores/${id}`);
        toast.success('Fornecedor removido com sucesso.');
        fetchSuppliers();
      } catch (err) {
        toast.error(err.message || 'Erro ao excluir fornecedor.');
      }
    }
  };

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((s) => {
      return (
        !search ||
        (s.razao_social && s.razao_social.toLowerCase().includes(search.toLowerCase())) ||
        (s.contato_email && s.contato_email.toLowerCase().includes(search.toLowerCase())) ||
        (s.contato_telefone && s.contato_telefone.includes(search))
      );
    });
  }, [suppliers, search]);

  const paginatedSuppliers = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredSuppliers.slice(start, start + pageSize);
  }, [filteredSuppliers, page, pageSize]);

  const columns = [
    {
      header: 'ID',
      accessor: 'id_fornecedor',
      render: (val, row) => (
        <span className="font-label-code font-bold text-primary">
          #{val || row.id}
        </span>
      ),
    },
    {
      header: 'Razão Social / Empresa',
      accessor: 'razao_social',
      sortable: true,
      render: (val) => (
        <span className="font-semibold text-on-surface text-body-md">{val}</span>
      ),
    },
    {
      header: 'E-mail de Contato',
      accessor: 'contato_email',
      render: (val) => (
        <div className="flex items-center gap-1.5 text-secondary text-body-sm">
          <span className="material-symbols-outlined text-[16px] text-tertiary">
            mail
          </span>
          <span>{val || '—'}</span>
        </div>
      ),
    },
    {
      header: 'Telefone Comercial',
      accessor: 'contato_telefone',
      render: (val) => (
        <div className="flex items-center gap-1.5 font-label-code text-[12px] text-on-surface">
          <span className="material-symbols-outlined text-[16px] text-secondary">
            call
          </span>
          <span>{val || '—'}</span>
        </div>
      ),
    },
    {
      header: 'Homologação',
      accessor: 'ativo',
      render: (val) => (
        <StatusBadge
          status={Number(val) === 1 ? 'ATIVO' : 'INATIVO'}
          label={Number(val) === 1 ? 'Homologado' : 'Inativo'}
        />
      ),
    },
    {
      header: 'Ações',
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => handleOpenModal(row)}
            className="p-1.5 rounded text-secondary hover:text-primary hover:bg-surface-container transition-colors"
            title="Editar Fornecedor"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
          </button>
          <button
            type="button"
            onClick={() => handleDelete(row)}
            className="p-1.5 rounded text-secondary hover:text-error hover:bg-surface-container transition-colors"
            title="Excluir Fornecedor"
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
            Fornecedores & Homologação Industrial
          </h1>
          <p className="text-body-md text-secondary">
            Gestão de parceiros comerciais, canais de contato e conformidade de suprimentos.
          </p>
        </div>

        <Button variant="primary" icon="local_shipping" onClick={() => handleOpenModal()}>
          Novo Fornecedor
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
            placeholder="Buscar por razão social, e-mail ou telefone..."
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={paginatedSuppliers}
        keyField="id_fornecedor"
        loading={loading}
        emptyTitle="Nenhum fornecedor cadastrado"
        emptyDescription="Cadastre parceiros e fornecedores homologados da montadora."
        emptyActionLabel="Cadastrar Fornecedor"
        onEmptyAction={() => handleOpenModal()}
      />

      {filteredSuppliers.length > 0 && (
        <Pagination
          currentPage={page}
          totalItems={filteredSuppliers.length}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      )}

      {/* Supplier Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedSupplier ? 'Editar Fornecedor' : 'Cadastrar Fornecedor'}
        subtitle="Informações cadastrais e contatos para pedidos de reposição"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FormField
            label="Razão Social / Nome da Empresa"
            name="razao_social"
            value={formData.razao_social}
            onChange={(e) => setFormData({ ...formData, razao_social: e.target.value })}
            placeholder="Ex: Rolamentos do Brasil Ind. e Com. Ltda"
            required
            icon="business"
          />

          <FormField
            label="E-mail de Contato"
            name="contato_email"
            type="email"
            value={formData.contato_email}
            onChange={(e) => setFormData({ ...formData, contato_email: e.target.value })}
            placeholder="vendas@fornecedor.com.br"
            icon="mail"
          />

          <FormField
            label="Telefone Comercial"
            name="contato_telefone"
            type="tel"
            value={formData.contato_telefone}
            onChange={(e) => setFormData({ ...formData, contato_telefone: e.target.value })}
            placeholder="(11) 98765-4321"
            icon="call"
          />

          <FormField
            label="Status de Homologação"
            name="ativo"
            type="select"
            value={formData.ativo}
            onChange={(e) => setFormData({ ...formData, ativo: Number(e.target.value) })}
          >
            <option value={1}>Ativo / Homologado</option>
            <option value={0}>Inativo / Suspenso</option>
          </FormField>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/30">
            <Button variant="ghost" onClick={() => setModalOpen(false)} disabled={submitting}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              {selectedSupplier ? 'Salvar Alterações' : 'Cadastrar Fornecedor'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
