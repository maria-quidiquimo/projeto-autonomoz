import { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import DataTable from '../components/ui/DataTable';
import Button from '../components/ui/Button';
import SearchInput from '../components/shared/SearchInput';
import RoleBadge from '../components/shared/RoleBadge';
import StatusBadge from '../components/ui/StatusBadge';
import Pagination from '../components/shared/Pagination';
import Modal from '../components/ui/Modal';
import FormField from '../components/ui/FormField';
import { useToast } from '../hooks/useToast';
import { useDialog } from '../hooks/useDialog';

export default function UsuariosPage() {
  const { toast } = useToast();
  const { destructiveConfirm } = useDialog();

  const [activeTab, setActiveTab] = useState('USERS'); // USERS | ROLES
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // User Modal
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userForm, setUserForm] = useState({
    nome_completo: '',
    matricula: '',
    senha: '',
    tipo_acesso: 'FUNCIONARIO',
    fk_cargo: '',
    cpf: '',
    data_nascimento: '',
    cargo_descritivo: '',
    ativo: 1,
  });

  // Role Modal
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [roleForm, setRoleForm] = useState({
    nome_cargo: '',
    descricao: '',
  });

  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [uRes, rRes] = await Promise.allSettled([
        api.get('/usuarios'),
        api.get('/cargos'),
      ]);

      if (uRes.status === 'fulfilled' && Array.isArray(uRes.value)) {
        setUsers(uRes.value);
      }
      if (rRes.status === 'fulfilled' && Array.isArray(rRes.value)) {
        setRoles(rRes.value);
      }
    } catch (err) {
      toast.error('Erro ao carregar dados de usuários e cargos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handlers for User
  const handleOpenUserModal = (u = null) => {
    setSelectedUser(u);
    if (u) {
      setUserForm({
        nome_completo: u.nome_completo || u.nome || '',
        matricula: u.matricula || '',
        senha: '',
        tipo_acesso: u.tipo_acesso || 'FUNCIONARIO',
        fk_cargo: u.fk_cargo || '',
        cpf: u.cpf || '',
        data_nascimento: u.data_nascimento ? u.data_nascimento.split('T')[0] : '',
        cargo_descritivo: u.cargo_descritivo || '',
        ativo: u.ativo !== undefined ? Number(u.ativo) : 1,
      });
    } else {
      setUserForm({
        nome_completo: '',
        matricula: `OP-${Math.floor(1000 + Math.random() * 9000)}`,
        senha: '',
        tipo_acesso: 'FUNCIONARIO',
        fk_cargo: roles[0]?.id_cargo || '',
        cpf: '',
        data_nascimento: '',
        cargo_descritivo: 'Operador de Montagem',
        ativo: 1,
      });
    }
    setUserModalOpen(true);
  };

  const handleSubmitUser = async (e) => {
    e.preventDefault();
    if (!userForm.nome_completo || !userForm.matricula) {
      toast.warning('Nome completo e matrícula são obrigatórios.');
      return;
    }
    if (!selectedUser && !userForm.senha) {
      toast.warning('Informe a senha do novo usuário.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...userForm,
        fk_cargo: userForm.fk_cargo ? Number(userForm.fk_cargo) : null,
      };
      if (selectedUser && !userForm.senha) {
        delete payload.senha;
      }

      if (selectedUser) {
        await api.put(`/usuarios/${selectedUser.id_usuario || selectedUser.id}`, payload);
        toast.success('Usuário atualizado com sucesso!');
      } else {
        await api.post('/usuarios', payload);
        toast.success('Novo usuário cadastrado com sucesso!');
      }
      setUserModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Erro ao salvar usuário.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (u) => {
    const id = u.id_usuario || u.id;
    const confirmed = await destructiveConfirm({
      title: 'Excluir / Desativar Usuário',
      message: `Tem certeza que deseja inativar o acesso de ${u.nome_completo || u.nome} (${u.matricula})?`,
    });

    if (confirmed) {
      try {
        await api.delete(`/usuarios/${id}`);
        toast.success('Usuário inativado.');
        fetchData();
      } catch (err) {
        toast.error(err.message || 'Erro ao remover usuário.');
      }
    }
  };

  // Handlers for Role
  const handleOpenRoleModal = (r = null) => {
    setSelectedRole(r);
    if (r) {
      setRoleForm({
        nome_cargo: r.nome_cargo || '',
        descricao: r.descricao || '',
      });
    } else {
      setRoleForm({ nome_cargo: '', descricao: '' });
    }
    setRoleModalOpen(true);
  };

  const handleSubmitRole = async (e) => {
    e.preventDefault();
    if (!roleForm.nome_cargo) {
      toast.warning('Nome do cargo é obrigatório.');
      return;
    }

    setSubmitting(true);
    try {
      if (selectedRole) {
        await api.put(`/cargos/${selectedRole.id_cargo || selectedRole.id}`, roleForm);
        toast.success('Cargo atualizado!');
      } else {
        await api.post('/cargos', roleForm);
        toast.success('Novo cargo cadastrado!');
      }
      setRoleModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Erro ao salvar cargo.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRole = async (r) => {
    const id = r.id_cargo || r.id;
    const confirmed = await destructiveConfirm({
      title: 'Excluir Cargo',
      message: `Tem certeza que deseja excluir o cargo "${r.nome_cargo}"?`,
    });
    if (confirmed) {
      try {
        await api.delete(`/cargos/${id}`);
        toast.success('Cargo excluído.');
        fetchData();
      } catch (err) {
        toast.error(err.message || 'Erro ao excluir cargo.');
      }
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        !search ||
        (u.nome && u.nome.toLowerCase().includes(search.toLowerCase())) ||
        (u.nome_completo && u.nome_completo.toLowerCase().includes(search.toLowerCase())) ||
        (u.matricula && u.matricula.toLowerCase().includes(search.toLowerCase()));
      return matchSearch;
    });
  }, [users, search]);

  const paginatedUsers = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, page, pageSize]);

  const userColumns = [
    {
      header: 'Matrícula',
      accessor: 'matricula',
      sortable: true,
      render: (val) => (
        <span className="font-label-code font-bold text-primary">
          {val}
        </span>
      ),
    },
    {
      header: 'Nome Completo',
      accessor: 'nome_completo',
      sortable: true,
      render: (val, row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-on-surface">
            {val || row.nome}
          </span>
          <span className="text-[12px] text-secondary">
            {row.cargo_descritivo || row.nome_cargo || 'Operador'}
          </span>
        </div>
      ),
    },
    {
      header: 'Perfil de Acesso',
      accessor: 'tipo_acesso',
      sortable: true,
      render: (val) => <RoleBadge role={val} />,
    },
    {
      header: 'Cargo / Função',
      accessor: 'fk_cargo',
      render: (val, row) => {
        const c = roles.find((r) => (r.id_cargo || r.id) === val);
        return (
          <span className="text-body-sm text-on-surface">
            {c ? c.nome_cargo : row.nome_cargo || 'Geral'}
          </span>
        );
      },
    },
    {
      header: 'Status',
      accessor: 'ativo',
      render: (val) => (
        <StatusBadge
          status={Number(val) === 1 ? 'ATIVO' : 'INATIVO'}
          label={Number(val) === 1 ? 'Ativo' : 'Inativo'}
        />
      ),
    },
    {
      header: 'Ações',
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => handleOpenUserModal(row)}
            className="p-1.5 rounded text-secondary hover:text-primary hover:bg-surface-container transition-colors"
            title="Editar Usuário"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
          </button>
          <button
            type="button"
            onClick={() => handleDeleteUser(row)}
            className="p-1.5 rounded text-secondary hover:text-error hover:bg-surface-container transition-colors"
            title="Inativar Usuário"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>
      ),
    },
  ];

  const roleColumns = [
    {
      header: 'ID',
      accessor: 'id_cargo',
      render: (val, row) => (
        <span className="font-label-code font-bold text-primary">
          #{val || row.id}
        </span>
      ),
    },
    {
      header: 'Nome do Cargo',
      accessor: 'nome_cargo',
      sortable: true,
      render: (val) => <span className="font-semibold text-on-surface">{val}</span>,
    },
    {
      header: 'Descrição de Atribuições',
      accessor: 'descricao',
      render: (val) => (
        <span className="text-body-sm text-secondary line-clamp-1">{val || '—'}</span>
      ),
    },
    {
      header: 'Ações',
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => handleOpenRoleModal(row)}
            className="p-1.5 rounded text-secondary hover:text-primary hover:bg-surface-container transition-colors"
            title="Editar Cargo"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
          </button>
          <button
            type="button"
            onClick={() => handleDeleteRole(row)}
            className="p-1.5 rounded text-secondary hover:text-error hover:bg-surface-container transition-colors"
            title="Excluir Cargo"
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
            Usuários, Operadores & Cargos
          </h1>
          <p className="text-body-md text-secondary">
            Administração de credenciais de crachá, níveis de permissão (RBAC) e funções da fábrica.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'USERS' ? (
            <Button variant="primary" icon="person_add" onClick={() => handleOpenUserModal()}>
              Novo Usuário
            </Button>
          ) : (
            <Button variant="primary" icon="add" onClick={() => handleOpenRoleModal()}>
              Novo Cargo
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-1">
        <button
          type="button"
          onClick={() => {
            setActiveTab('USERS');
            setPage(1);
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-md font-body-md font-bold transition-colors cursor-pointer ${
            activeTab === 'USERS'
              ? 'bg-surface-container-lowest text-primary border-b-2 border-primary shadow-xs'
              : 'text-secondary hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">group</span>
          <span>Colaboradores & Acessos ({users.length})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('ROLES');
            setPage(1);
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-md font-body-md font-bold transition-colors cursor-pointer ${
            activeTab === 'ROLES'
              ? 'bg-surface-container-lowest text-primary border-b-2 border-primary shadow-xs'
              : 'text-secondary hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">badge</span>
          <span>Estrutura de Cargos ({roles.length})</span>
        </button>
      </div>

      {activeTab === 'USERS' ? (
        <>
          <div className="flex items-center justify-between gap-4 bg-surface-container-lowest p-4 rounded-lg border border-outline-variant/30 shadow-xs">
            <div className="w-full md:w-80">
              <SearchInput
                value={search}
                onChange={(val) => {
                  setSearch(val);
                  setPage(1);
                }}
                placeholder="Buscar por nome ou matrícula..."
              />
            </div>
          </div>

          <DataTable
            columns={userColumns}
            data={paginatedUsers}
            keyField="id_usuario"
            loading={loading}
            emptyTitle="Nenhum usuário encontrado"
            emptyActionLabel="Cadastrar Usuário"
            onEmptyAction={() => handleOpenUserModal()}
          />

          {filteredUsers.length > 0 && (
            <Pagination
              currentPage={page}
              totalItems={filteredUsers.length}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          )}
        </>
      ) : (
        <DataTable
          columns={roleColumns}
          data={roles}
          keyField="id_cargo"
          loading={loading}
          emptyTitle="Nenhum cargo cadastrado"
          emptyActionLabel="Cadastrar Cargo"
          onEmptyAction={() => handleOpenRoleModal()}
        />
      )}

      {/* User Modal */}
      <Modal
        isOpen={userModalOpen}
        onClose={() => setUserModalOpen(false)}
        title={selectedUser ? 'Editar Usuário' : 'Cadastrar Novo Usuário'}
        subtitle="Defina a matrícula de crachá e nível de autorização"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmitUser} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="Nome Completo"
              name="nome_completo"
              value={userForm.nome_completo}
              onChange={(e) => setUserForm({ ...userForm, nome_completo: e.target.value })}
              placeholder="Ex: Carlos Eduardo Santos"
              required
              icon="person"
            />

            <FormField
              label="Matrícula Funcional"
              name="matricula"
              value={userForm.matricula}
              onChange={(e) => setUserForm({ ...userForm, matricula: e.target.value })}
              placeholder="Ex: OP-4820"
              required
              icon="badge"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="Perfil de Acesso (RBAC)"
              name="tipo_acesso"
              type="select"
              value={userForm.tipo_acesso}
              onChange={(e) => setUserForm({ ...userForm, tipo_acesso: e.target.value })}
              required
            >
              <option value="FUNCIONARIO">FUNCIONÁRIO (Acesso Padrão)</option>
              <option value="GERENTE">GERENTE (Acesso Completo & Vendas)</option>
            </FormField>

            <FormField
              label="Cargo / Função"
              name="fk_cargo"
              type="select"
              value={userForm.fk_cargo}
              onChange={(e) => setUserForm({ ...userForm, fk_cargo: e.target.value })}
            >
              <option value="">Selecione o cargo...</option>
              {roles.map((r) => (
                <option key={r.id_cargo || r.id} value={r.id_cargo || r.id}>
                  {r.nome_cargo}
                </option>
              ))}
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label={selectedUser ? 'Senha (deixe em branco para não alterar)' : 'Senha de Terminal'}
              name="senha"
              type="password"
              value={userForm.senha}
              onChange={(e) => setUserForm({ ...userForm, senha: e.target.value })}
              placeholder="••••••••"
              required={!selectedUser}
              icon="lock"
            />

            <FormField
              label="Cargo Descritivo"
              name="cargo_descritivo"
              value={userForm.cargo_descritivo}
              onChange={(e) => setUserForm({ ...userForm, cargo_descritivo: e.target.value })}
              placeholder="Ex: Torneiro Mecânico / Almoxarife"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="CPF (Opcional)"
              name="cpf"
              value={userForm.cpf}
              onChange={(e) => setUserForm({ ...userForm, cpf: e.target.value })}
              placeholder="000.000.000-00"
            />

            <FormField
              label="Data de Nascimento"
              name="data_nascimento"
              type="date"
              value={userForm.data_nascimento}
              onChange={(e) => setUserForm({ ...userForm, data_nascimento: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/30">
            <Button variant="ghost" onClick={() => setUserModalOpen(false)} disabled={submitting}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              {selectedUser ? 'Salvar Alterações' : 'Cadastrar Colaborador'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Role Modal */}
      <Modal
        isOpen={roleModalOpen}
        onClose={() => setRoleModalOpen(false)}
        title={selectedRole ? 'Editar Cargo' : 'Novo Cargo'}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmitRole} className="flex flex-col gap-4">
          <FormField
            label="Título do Cargo"
            name="nome_cargo"
            value={roleForm.nome_cargo}
            onChange={(e) => setRoleForm({ ...roleForm, nome_cargo: e.target.value })}
            placeholder="Ex: Engenheiro de Manufatura"
            required
            icon="badge"
          />

          <FormField
            label="Descrição das Responsabilidades"
            name="descricao"
            type="textarea"
            rows={3}
            value={roleForm.descricao}
            onChange={(e) => setRoleForm({ ...roleForm, descricao: e.target.value })}
            placeholder="Responsabilidades técnicas na fábrica..."
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant/30">
            <Button variant="ghost" onClick={() => setRoleModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Salvar Cargo
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
