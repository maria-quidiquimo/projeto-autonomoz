import { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import DataTable from '../components/ui/DataTable';
import Button from '../components/ui/Button';
import SearchInput from '../components/shared/SearchInput';
import StatusBadge from '../components/ui/StatusBadge';
import Pagination from '../components/shared/Pagination';
import { useToast } from '../hooks/useToast';

export default function LogsRelatoriosPage() {
  const { toast } = useToast();

  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [eventFilter, setEventFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const [logRes, userRes] = await Promise.allSettled([
        api.get('/logs_sistema'),
        api.get('/usuarios'),
      ]);

      if (logRes.status === 'fulfilled' && Array.isArray(logRes.value)) {
        setLogs(logRes.value);
      }
      if (userRes.status === 'fulfilled' && Array.isArray(userRes.value)) {
        setUsers(userRes.value);
      }
    } catch (err) {
      toast.error('Erro ao carregar logs e relatórios.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleExportCSV = () => {
    if (logs.length === 0) {
      toast.warning('Nenhum log disponível para exportar.');
      return;
    }

    const headers = ['ID', 'Tipo Evento', 'Mensagem', 'Usuario ID', 'Data'];
    const rows = filteredLogs.map((l) => [
      l.id_log || l.id,
      l.tipo_evento,
      `"${(l.mensagem || '').replace(/"/g, '""')}"`,
      l.fk_usuario,
      l.created_at || '',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `autonomoz_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Relatório CSV gerado e baixado!');
  };

  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      const matchSearch =
        !search ||
        (l.mensagem && l.mensagem.toLowerCase().includes(search.toLowerCase())) ||
        (l.tipo_evento && l.tipo_evento.toLowerCase().includes(search.toLowerCase())) ||
        String(l.id_log).includes(search);

      if (!matchSearch) return false;
      if (eventFilter !== 'ALL' && l.tipo_evento !== eventFilter) return false;
      return true;
    });
  }, [logs, search, eventFilter]);

  const paginatedLogs = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredLogs.slice(start, start + pageSize);
  }, [filteredLogs, page, pageSize]);

  const columns = [
    {
      header: 'ID / Log',
      accessor: 'id_log',
      sortable: true,
      render: (val, row) => (
        <span className="font-label-code font-bold text-primary">
          LOG-{String(val || row.id).padStart(5, '0')}
        </span>
      ),
    },
    {
      header: 'Tipo de Evento',
      accessor: 'tipo_evento',
      sortable: true,
      render: (val) => <StatusBadge status={val} label={val || 'SISTEMA'} />,
    },
    {
      header: 'Mensagem do Evento / Auditoria',
      accessor: 'mensagem',
      render: (val) => (
        <span className="text-body-sm font-medium text-on-surface">
          {val || 'Operação registrada pelo núcleo do sistema.'}
        </span>
      ),
    },
    {
      header: 'Operador Responsável',
      accessor: 'fk_usuario',
      render: (val) => {
        if (!val) return <span className="font-label-code text-secondary text-[12px]">Sistema / Automático</span>;
        const u = users.find((usr) => (usr.id_usuario || usr.id) === val);
        return (
          <span className="font-label-code text-on-surface text-[12px] font-semibold">
            {u ? `${u.nome || u.nome_completo} (${u.matricula})` : `User #${val}`}
          </span>
        );
      },
    },
    {
      header: 'Registro Temporal',
      accessor: 'created_at',
      sortable: true,
      render: (val) => (
        <span className="font-label-code text-[12px] text-secondary">
          {val ? new Date(val).toLocaleString('pt-BR') : '—'}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-container-lowest p-5 rounded-lg border border-outline-variant/30 shadow-xs">
        <div>
          <h1 className="text-headline-lg font-bold text-on-surface">
            Logs do Sistema & Relatórios de Auditoria
          </h1>
          <p className="text-body-md text-secondary">
            Rastreabilidade de transações, acessos aos terminais e histórico imutável de eventos.
          </p>
        </div>

        <Button variant="secondary" icon="download" onClick={handleExportCSV}>
          Exportar CSV
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
            placeholder="Buscar por mensagem ou evento..."
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          {['ALL', 'LOGIN', 'CRIACAO', 'EDICAO', 'EXCLUSAO', 'AJUSTE', 'ALERTA'].map((ev) => (
            <button
              key={ev}
              type="button"
              onClick={() => {
                setEventFilter(ev);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded text-body-sm font-semibold transition-all shrink-0 ${
                eventFilter === ev
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-container-low text-secondary hover:text-on-surface'
              }`}
            >
              {ev === 'ALL' ? 'Todos os Logs' : ev}
            </button>
          ))}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={paginatedLogs}
        keyField="id_log"
        loading={loading}
        emptyTitle="Nenhum log registrado"
        emptyDescription="O sistema registrará automaticamente os eventos e auditorias das operações."
      />

      {filteredLogs.length > 0 && (
        <Pagination
          currentPage={page}
          totalItems={filteredLogs.length}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[15, 30, 50]}
        />
      )}
    </div>
  );
}
