import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import DataTable from '../components/ui/DataTable';
import Button from '../components/ui/Button';
import SearchInput from '../components/shared/SearchInput';
import StatusBadge from '../components/ui/StatusBadge';
import Pagination from '../components/shared/Pagination';
import CadastroProdutoModal from './CadastroProdutoModal';
import { useToast } from '../hooks/useToast';
import { useDialog } from '../hooks/useDialog';

export default function EstoquePage() {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { destructiveConfirm } = useDialog();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL | LOW | OK
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await api.get('/produtos');
      if (Array.isArray(data)) {
        setProducts(data);
      }
    } catch (err) {
      toast.error('Erro ao carregar catálogo de produtos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedProduct(null);
    setModalOpen(true);
  };

  const handleDelete = async (product) => {
    const id = product.id_produto || product.id;
    const confirmed = await destructiveConfirm({
      title: 'Excluir Produto',
      message: `Tem certeza que deseja inativar ou excluir o produto "${product.nome_produto}" (${product.codigo_item})?`,
      confirmText: 'Excluir Produto',
    });

    if (confirmed) {
      try {
        await api.delete(`/produtos/${id}`);
        toast.success('Produto removido com sucesso.');
        fetchProducts();
      } catch (err) {
        toast.error(err.message || 'Erro ao excluir produto.');
      }
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        !search ||
        (p.nome_produto && p.nome_produto.toLowerCase().includes(search.toLowerCase())) ||
        (p.codigo_item && p.codigo_item.toLowerCase().includes(search.toLowerCase())) ||
        (p.descricao && p.descricao.toLowerCase().includes(search.toLowerCase()));

      const atual = Number(p.estoque_atual) || 0;
      const minimo = Number(p.estoque_minimo) || 0;

      if (!matchSearch) return false;

      if (statusFilter === 'LOW') {
        return atual <= minimo;
      }
      if (statusFilter === 'OK') {
        return atual > minimo;
      }
      return true;
    });
  }, [products, search, statusFilter]);

  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, page, pageSize]);

  const columns = [
    {
      header: 'Código / SKU',
      accessor: 'codigo_item',
      sortable: true,
      render: (val) => (
        <span className="font-label-code font-bold text-primary">
          {val || '—'}
        </span>
      ),
    },
    {
      header: 'Produto & Descrição',
      accessor: 'nome_produto',
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
      header: 'Unid.',
      accessor: 'unidade_medida',
      render: (val) => (
        <span className="font-label-code text-[12px] uppercase text-secondary">
          {val || 'UN'}
        </span>
      ),
    },
    {
      header: 'Estoque Atual',
      accessor: 'estoque_atual',
      sortable: true,
      render: (val, row) => {
        const atual = Number(val) || 0;
        const minimo = Number(row.estoque_minimo) || 0;
        const isCritical = atual <= minimo;

        return (
          <div className="flex items-center gap-2">
            <span
              className={`font-label-metric text-[15px] font-bold ${
                isCritical ? 'text-error' : 'text-on-surface'
              }`}
            >
              {atual}
            </span>
            {isCritical && (
              <span
                className="material-symbols-outlined text-error text-[16px]"
                title="Abaixo do estoque mínimo!"
              >
                warning
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: 'Est. Mínimo',
      accessor: 'estoque_minimo',
      render: (val) => (
        <span className="font-label-code text-secondary text-[13px]">
          {val ?? 0}
        </span>
      ),
    },
    {
      header: 'Valor Unit.',
      accessor: 'valor_unitario',
      sortable: true,
      render: (val) => (
        <span className="font-label-code text-[13px] text-on-surface">
          {val !== null && val !== undefined
            ? `R$ ${Number(val).toFixed(2).replace('.', ',')}`
            : '—'}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (_, row) => {
        const atual = Number(row.estoque_atual) || 0;
        const minimo = Number(row.estoque_minimo) || 0;
        if (atual === 0) return <StatusBadge status="CRÍTICO" label="Sem Estoque" />;
        if (atual <= minimo) return <StatusBadge status="ATENÇÃO" label="Estoque Baixo" />;
        return <StatusBadge status="OK" label="Disponível" />;
      },
    },
    {
      header: 'Ações',
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => handleEdit(row)}
            className="p-1.5 rounded text-secondary hover:text-primary hover:bg-surface-container transition-colors"
            title="Editar Produto"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
          </button>
          <button
            type="button"
            onClick={() => handleDelete(row)}
            className="p-1.5 rounded text-secondary hover:text-error hover:bg-surface-container transition-colors"
            title="Excluir Produto"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-container-lowest p-5 rounded-lg border border-outline-variant/30 shadow-xs">
        <div>
          <h1 className="text-headline-lg font-bold text-on-surface">
            Catálogo de Estoque & Peças
          </h1>
          <p className="text-body-md text-secondary">
            Gestão de especificações técnicas, níveis de inventário e parâmetros industriais.
          </p>
        </div>

        <Button variant="primary" icon="add" onClick={handleCreate}>
          Novo Produto / SKU
        </Button>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-surface-container-lowest p-4 rounded-lg border border-outline-variant/30 shadow-xs">
        <div className="w-full md:w-80">
          <SearchInput
            value={search}
            onChange={(val) => {
              setSearch(val);
              setPage(1);
            }}
            placeholder="Buscar por código, nome ou descrição..."
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
            Todos ({products.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setStatusFilter('LOW');
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded text-body-sm font-semibold transition-all ${
              statusFilter === 'LOW'
                ? 'bg-error text-on-error shadow-xs'
                : 'bg-surface-container-low text-secondary hover:text-on-surface'
            }`}
          >
            Estoque Crítico / Baixo
          </button>
          <button
            type="button"
            onClick={() => {
              setStatusFilter('OK');
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded text-body-sm font-semibold transition-all ${
              statusFilter === 'OK'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-surface-container-low text-secondary hover:text-on-surface'
            }`}
          >
            Nível Regular
          </button>
        </div>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={paginatedProducts}
        keyField="id_produto"
        loading={loading}
        emptyTitle="Nenhum produto cadastrado"
        emptyDescription="Cadastre novos produtos para controlar o estoque da fábrica."
        emptyActionLabel="Cadastrar Primeiro Produto"
        onEmptyAction={handleCreate}
      />

      {filteredProducts.length > 0 && (
        <Pagination
          currentPage={page}
          totalItems={filteredProducts.length}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      )}

      {/* Product Modal */}
      <CadastroProdutoModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        product={selectedProduct}
        onSaved={fetchProducts}
      />
    </div>
  );
}
