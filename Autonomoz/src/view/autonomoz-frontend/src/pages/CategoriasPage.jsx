import { useState, useEffect } from 'react';
import { api } from '../services/api';
import DataTable from '../components/ui/DataTable';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import FormField from '../components/ui/FormField';
import { useToast } from '../hooks/useToast';
import { useDialog } from '../hooks/useDialog';

export default function CategoriasPage() {
  const { toast } = useToast();
  const { destructiveConfirm } = useDialog();

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states for Categoria
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [selectedCat, setSelectedCat] = useState(null);
  const [catForm, setCatForm] = useState({ nome_categoria: '', descricao: '' });

  // Modal states for Subcategoria
  const [subModalOpen, setSubModalOpen] = useState(false);
  const [selectedSub, setSelectedSub] = useState(null);
  const [subForm, setSubForm] = useState({
    nome_subcategoria: '',
    fk_categoria: '',
    descricao: '',
  });

  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catRes, subRes] = await Promise.allSettled([
        api.get('/categorias'),
        api.get('/subcategoria'),
      ]);

      if (catRes.status === 'fulfilled' && Array.isArray(catRes.value)) {
        setCategories(catRes.value);
      }
      if (subRes.status === 'fulfilled' && Array.isArray(subRes.value)) {
        setSubcategories(subRes.value);
      }
    } catch (err) {
      toast.error('Erro ao carregar categorias.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handlers for Category
  const handleOpenCatModal = (cat = null) => {
    setSelectedCat(cat);
    if (cat) {
      setCatForm({
        nome_categoria: cat.nome_categoria || '',
        descricao: cat.descricao || '',
      });
    } else {
      setCatForm({ nome_categoria: '', descricao: '' });
    }
    setCatModalOpen(true);
  };

  const handleSubmitCat = async (e) => {
    e.preventDefault();
    if (!catForm.nome_categoria) {
      toast.warning('O nome da categoria é obrigatório.');
      return;
    }

    setSubmitting(true);
    try {
      if (selectedCat) {
        await api.put(`/categorias/${selectedCat.id_categoria || selectedCat.id}`, catForm);
        toast.success('Categoria atualizada com sucesso!');
      } else {
        await api.post('/categorias', catForm);
        toast.success('Categoria criada com sucesso!');
      }
      setCatModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Erro ao salvar categoria.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCat = async (cat) => {
    const id = cat.id_categoria || cat.id;
    const confirmed = await destructiveConfirm({
      title: 'Excluir Categoria',
      message: `Tem certeza que deseja excluir a categoria "${cat.nome_categoria}"?`,
    });
    if (confirmed) {
      try {
        await api.delete(`/categorias/${id}`);
        toast.success('Categoria excluída.');
        fetchData();
      } catch (err) {
        toast.error(err.message || 'Erro ao excluir categoria.');
      }
    }
  };

  // Handlers for Subcategory
  const handleOpenSubModal = (sub = null) => {
    setSelectedSub(sub);
    if (sub) {
      setSubForm({
        nome_subcategoria: sub.nome_subcategoria || '',
        fk_categoria: sub.fk_categoria || '',
        descricao: sub.descricao || '',
      });
    } else {
      setSubForm({
        nome_subcategoria: '',
        fk_categoria: categories[0]?.id_categoria || '',
        descricao: '',
      });
    }
    setSubModalOpen(true);
  };

  const handleSubmitSub = async (e) => {
    e.preventDefault();
    if (!subForm.nome_subcategoria || !subForm.fk_categoria) {
      toast.warning('Nome da subcategoria e categoria pai são obrigatórios.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...subForm,
        fk_categoria: Number(subForm.fk_categoria),
      };

      if (selectedSub) {
        await api.put(`/subcategoria/${selectedSub.id_subcategoria || selectedSub.id}`, payload);
        toast.success('Subcategoria atualizada!');
      } else {
        await api.post('/subcategoria', payload);
        toast.success('Subcategoria cadastrada!');
      }
      setSubModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Erro ao salvar subcategoria.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSub = async (sub) => {
    const id = sub.id_subcategoria || sub.id;
    const confirmed = await destructiveConfirm({
      title: 'Excluir Subcategoria',
      message: `Tem certeza que deseja excluir a subcategoria "${sub.nome_subcategoria}"?`,
    });
    if (confirmed) {
      try {
        await api.delete(`/subcategoria/${id}`);
        toast.success('Subcategoria excluída.');
        fetchData();
      } catch (err) {
        toast.error(err.message || 'Erro ao excluir subcategoria.');
      }
    }
  };

  const catColumns = [
    {
      header: 'ID',
      accessor: 'id_categoria',
      render: (val, row) => (
        <span className="font-label-code font-bold text-primary">
          #{val || row.id}
        </span>
      ),
    },
    {
      header: 'Categoria',
      accessor: 'nome_categoria',
      sortable: true,
      render: (val) => <span className="font-semibold text-on-surface">{val}</span>,
    },
    {
      header: 'Descrição',
      accessor: 'descricao',
      render: (val) => (
        <span className="text-secondary text-body-sm line-clamp-1">{val || '—'}</span>
      ),
    },
    {
      header: 'Ações',
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => handleOpenCatModal(row)}
            className="p-1.5 rounded text-secondary hover:text-primary hover:bg-surface-container transition-colors"
            title="Editar Categoria"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
          </button>
          <button
            type="button"
            onClick={() => handleDeleteCat(row)}
            className="p-1.5 rounded text-secondary hover:text-error hover:bg-surface-container transition-colors"
            title="Excluir Categoria"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>
      ),
    },
  ];

  const subColumns = [
    {
      header: 'ID',
      accessor: 'id_subcategoria',
      render: (val, row) => (
        <span className="font-label-code font-bold text-primary">
          #{val || row.id}
        </span>
      ),
    },
    {
      header: 'Subcategoria',
      accessor: 'nome_subcategoria',
      sortable: true,
      render: (val) => <span className="font-semibold text-on-surface">{val}</span>,
    },
    {
      header: 'Categoria Pai',
      accessor: 'fk_categoria',
      render: (val, row) => {
        const cat = categories.find((c) => (c.id_categoria || c.id) === val);
        return (
          <span className="px-2 py-0.5 rounded bg-surface-container text-body-sm font-medium">
            {cat ? cat.nome_categoria : `Categoria #${val}`}
          </span>
        );
      },
    },
    {
      header: 'Descrição',
      accessor: 'descricao',
      render: (val) => (
        <span className="text-secondary text-body-sm line-clamp-1">{val || '—'}</span>
      ),
    },
    {
      header: 'Ações',
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => handleOpenSubModal(row)}
            className="p-1.5 rounded text-secondary hover:text-primary hover:bg-surface-container transition-colors"
            title="Editar Subcategoria"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
          </button>
          <button
            type="button"
            onClick={() => handleDeleteSub(row)}
            className="p-1.5 rounded text-secondary hover:text-error hover:bg-surface-container transition-colors"
            title="Excluir Subcategoria"
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
            Categorias & Subcategorias
          </h1>
          <p className="text-body-md text-secondary">
            Estruturação e taxonomia técnica de peças, insumos e componentes industriais.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Categorias Section */}
        <div className="flex flex-col gap-4 bg-surface-container-lowest p-5 rounded-lg border border-outline-variant/30 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[22px]">
                folder
              </span>
              <h2 className="text-headline-sm font-bold text-on-surface">
                Categorias Principais ({categories.length})
              </h2>
            </div>
            <Button
              size="sm"
              variant="primary"
              icon="add"
              onClick={() => handleOpenCatModal()}
            >
              Nova Categoria
            </Button>
          </div>

          <DataTable
            columns={catColumns}
            data={categories}
            keyField="id_categoria"
            loading={loading}
            emptyTitle="Nenhuma categoria cadastrada"
            emptyActionLabel="Criar Categoria"
            onEmptyAction={() => handleOpenCatModal()}
          />
        </div>

        {/* Subcategorias Section */}
        <div className="flex flex-col gap-4 bg-surface-container-lowest p-5 rounded-lg border border-outline-variant/30 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-tertiary text-[22px]">
                subdirectory_arrow_right
              </span>
              <h2 className="text-headline-sm font-bold text-on-surface">
                Subcategorias ({subcategories.length})
              </h2>
            </div>
            <Button
              size="sm"
              variant="secondary"
              icon="add"
              onClick={() => handleOpenSubModal()}
            >
              Nova Subcategoria
            </Button>
          </div>

          <DataTable
            columns={subColumns}
            data={subcategories}
            keyField="id_subcategoria"
            loading={loading}
            emptyTitle="Nenhuma subcategoria cadastrada"
            emptyActionLabel="Criar Subcategoria"
            onEmptyAction={() => handleOpenSubModal()}
          />
        </div>
      </div>

      {/* Category Modal */}
      <Modal
        isOpen={catModalOpen}
        onClose={() => setCatModalOpen(false)}
        title={selectedCat ? 'Editar Categoria' : 'Nova Categoria'}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmitCat} className="flex flex-col gap-4">
          <FormField
            label="Nome da Categoria"
            name="nome_categoria"
            value={catForm.nome_categoria}
            onChange={(e) => setCatForm({ ...catForm, nome_categoria: e.target.value })}
            placeholder="Ex: Motor, Transmissão, Elétrica..."
            required
            icon="category"
          />

          <FormField
            label="Descrição"
            name="descricao"
            type="textarea"
            rows={2}
            value={catForm.descricao}
            onChange={(e) => setCatForm({ ...catForm, descricao: e.target.value })}
            placeholder="Finalidade da categoria..."
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant/30">
            <Button variant="ghost" onClick={() => setCatModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Salvar
            </Button>
          </div>
        </form>
      </Modal>

      {/* Subcategory Modal */}
      <Modal
        isOpen={subModalOpen}
        onClose={() => setSubModalOpen(false)}
        title={selectedSub ? 'Editar Subcategoria' : 'Nova Subcategoria'}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmitSub} className="flex flex-col gap-4">
          <FormField
            label="Categoria Pai"
            name="fk_categoria"
            type="select"
            value={subForm.fk_categoria}
            onChange={(e) => setSubForm({ ...subForm, fk_categoria: e.target.value })}
            required
            icon="folder"
          >
            <option value="">Selecione uma categoria...</option>
            {categories.map((c) => (
              <option key={c.id_categoria || c.id} value={c.id_categoria || c.id}>
                {c.nome_categoria}
              </option>
            ))}
          </FormField>

          <FormField
            label="Nome da Subcategoria"
            name="nome_subcategoria"
            value={subForm.nome_subcategoria}
            onChange={(e) => setSubForm({ ...subForm, nome_subcategoria: e.target.value })}
            placeholder="Ex: Rolamentos, Filtros de Óleo..."
            required
            icon="subdirectory_arrow_right"
          />

          <FormField
            label="Descrição"
            name="descricao"
            type="textarea"
            rows={2}
            value={subForm.descricao}
            onChange={(e) => setSubForm({ ...subForm, descricao: e.target.value })}
            placeholder="Detalhes..."
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant/30">
            <Button variant="ghost" onClick={() => setSubModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Salvar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
