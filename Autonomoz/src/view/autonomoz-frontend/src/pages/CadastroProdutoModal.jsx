import { useState, useEffect } from 'react';
import Modal from '../components/ui/Modal';
import FormField from '../components/ui/FormField';
import Button from '../components/ui/Button';
import { api } from '../services/api';
import { useToast } from '../hooks/useToast';

export default function CadastroProdutoModal({
  isOpen,
  onClose,
  product = null,
  onSaved,
}) {
  const { toast } = useToast();
  const isEditing = !!product;

  const [loading, setLoading] = useState(false);
  const [subcategories, setSubcategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const [formData, setFormData] = useState({
    codigo_item: '',
    nome_produto: '',
    descricao: '',
    fk_subcategoria: '',
    fk_fornecedor: '',
    unidade_medida: 'UN',
    valor_unitario: '',
    estoque_minimo: 10,
    estoque_atual: 0,
    ativo: 1,
  });

  useEffect(() => {
    if (isOpen) {
      // Fetch subcategories and suppliers for selects
      Promise.allSettled([api.get('/subcategoria'), api.get('/fornecedores')]).then(
        ([subRes, suppRes]) => {
          if (subRes.status === 'fulfilled' && Array.isArray(subRes.value)) {
            setSubcategories(subRes.value);
          }
          if (suppRes.status === 'fulfilled' && Array.isArray(suppRes.value)) {
            setSuppliers(suppRes.value);
          }
        }
      );

      if (product) {
        setFormData({
          codigo_item: product.codigo_item || '',
          nome_produto: product.nome_produto || '',
          descricao: product.descricao || '',
          fk_subcategoria: product.fk_subcategoria || '',
          fk_fornecedor: product.fk_fornecedor || '',
          unidade_medida: product.unidade_medida || 'UN',
          valor_unitario: product.valor_unitario ?? '',
          estoque_minimo: product.estoque_minimo ?? 10,
          estoque_atual: product.estoque_atual ?? 0,
          ativo: product.ativo !== undefined ? Number(product.ativo) : 1,
        });
      } else {
        setFormData({
          codigo_item: `AUT-${Math.floor(1000 + Math.random() * 9000)}`,
          nome_produto: '',
          descricao: '',
          fk_subcategoria: '',
          fk_fornecedor: '',
          unidade_medida: 'UN',
          valor_unitario: '',
          estoque_minimo: 10,
          estoque_atual: 0,
          ativo: 1,
        });
      }
    }
  }, [isOpen, product]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.codigo_item || !formData.nome_produto) {
      toast.warning('Código do item e nome do produto são obrigatórios.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        valor_unitario: formData.valor_unitario ? Number(formData.valor_unitario) : 0,
        estoque_minimo: Number(formData.estoque_minimo) || 0,
        estoque_atual: Number(formData.estoque_atual) || 0,
        fk_subcategoria: formData.fk_subcategoria ? Number(formData.fk_subcategoria) : null,
        fk_fornecedor: formData.fk_fornecedor ? Number(formData.fk_fornecedor) : null,
      };

      if (isEditing) {
        await api.put(`/produtos/${product.id_produto || product.id}`, payload);
        toast.success('Produto atualizado com sucesso!');
      } else {
        await api.post('/produtos', payload);
        toast.success('Produto cadastrado com sucesso!');
      }

      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Erro ao salvar produto.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Produto / SKU' : 'Cadastrar Novo Produto'}
      subtitle="Defina os parâmetros técnicos e estoque mínimo para controle da oficina"
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            label="Código do Item / SKU"
            name="codigo_item"
            value={formData.codigo_item}
            onChange={handleChange}
            placeholder="Ex: AUT-ROL-001"
            required
            icon="qr_code"
          />

          <FormField
            label="Nome do Produto"
            name="nome_produto"
            value={formData.nome_produto}
            onChange={handleChange}
            placeholder="Ex: Rolamento Cônico 45mm"
            required
            icon="inventory_2"
          />
        </div>

        <FormField
          label="Descrição Técnica"
          name="descricao"
          type="textarea"
          rows={2}
          value={formData.descricao}
          onChange={handleChange}
          placeholder="Especificações, tolerância, aplicação automotiva..."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            label="Subcategoria"
            name="fk_subcategoria"
            type="select"
            value={formData.fk_subcategoria}
            onChange={handleChange}
            icon="category"
          >
            <option value="">Selecione uma subcategoria...</option>
            {subcategories.map((sub) => (
              <option
                key={sub.id_subcategoria || sub.id}
                value={sub.id_subcategoria || sub.id}
              >
                {sub.nome_subcategoria || sub.nome}
              </option>
            ))}
          </FormField>

          <FormField
            label="Fornecedor Homologado"
            name="fk_fornecedor"
            type="select"
            value={formData.fk_fornecedor}
            onChange={handleChange}
            icon="local_shipping"
          >
            <option value="">Selecione um fornecedor...</option>
            {suppliers.map((supp) => (
              <option
                key={supp.id_fornecedor || supp.id}
                value={supp.id_fornecedor || supp.id}
              >
                {supp.razao_social || supp.nome}
              </option>
            ))}
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormField
            label="Unidade de Medida"
            name="unidade_medida"
            type="select"
            value={formData.unidade_medida}
            onChange={handleChange}
          >
            <option value="UN">Unidade (UN)</option>
            <option value="CX">Caixa (CX)</option>
            <option value="KG">Quilograma (KG)</option>
            <option value="L">Litro (L)</option>
            <option value="M">Metro (M)</option>
            <option value="PAR">Par (PAR)</option>
            <option value="JOGO">Jogo (JOGO)</option>
          </FormField>

          <FormField
            label="Valor Unitário (R$)"
            name="valor_unitario"
            type="number"
            step="0.01"
            value={formData.valor_unitario}
            onChange={handleChange}
            placeholder="0.00"
            icon="attach_money"
          />

          <FormField
            label="Estoque Mínimo (Alerta)"
            name="estoque_minimo"
            type="number"
            value={formData.estoque_minimo}
            onChange={handleChange}
            placeholder="10"
            required
            icon="warning"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/30">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            icon={isEditing ? 'save' : 'add'}
          >
            {isEditing ? 'Salvar Alterações' : 'Cadastrar Produto'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
