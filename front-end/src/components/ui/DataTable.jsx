import { useState, useMemo } from 'react';
import Skeleton from './Skeleton';
import EmptyState from './EmptyState';

export default function DataTable({
  columns = [],
  data = [],
  keyField = 'id',
  loading = false,
  emptyTitle = 'Nenhum registro encontrado',
  emptyDescription = 'Não existem dados para serem exibidos no momento.',
  emptyActionLabel,
  onEmptyAction,
  onRowClick,
}) {
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc'); // asc | desc

  const handleSort = (field) => {
    if (!field) return;
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedData = useMemo(() => {
    if (!sortField || !Array.isArray(data)) return data;
    return [...data].sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;
      
      const comparison = String(valA).localeCompare(String(valB), undefined, {
        numeric: true,
        sensitivity: 'base',
      });
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [data, sortField, sortOrder]);

  return (
    <div className="w-full overflow-hidden rounded-lg border border-outline-variant/30 bg-surface-container-lowest shadow-xs">
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low border-b border-outline-variant/40">
              {columns.map((col, index) => {
                const isSortable = !!col.sortable && !!col.accessor;
                const isCurrentSort = sortField === col.accessor;

                return (
                  <th
                    key={col.accessor || index}
                    onClick={() => isSortable && handleSort(col.accessor)}
                    className={`px-4 py-3 text-body-sm font-semibold text-secondary uppercase tracking-wider select-none ${
                      isSortable ? 'cursor-pointer hover:text-on-surface' : ''
                    } ${col.headerClassName || ''}`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{col.header}</span>
                      {isSortable && (
                        <span className="material-symbols-outlined text-[16px]">
                          {isCurrentSort
                            ? sortOrder === 'asc'
                              ? 'arrow_upward'
                              : 'arrow_downward'
                            : 'unfold_more'}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20">
            {loading ? (
              Array.from({ length: 5 }).map((_, rIdx) => (
                <tr key={rIdx} className="bg-surface-container-lowest">
                  {columns.map((col, cIdx) => (
                    <td key={cIdx} className="px-4 py-3.5">
                      <Skeleton height="h-4" width="w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-8 text-center">
                  <EmptyState
                    title={emptyTitle}
                    description={emptyDescription}
                    actionLabel={emptyActionLabel}
                    onAction={onEmptyAction}
                  />
                </td>
              </tr>
            ) : (
              sortedData.map((row, rIdx) => (
                <tr
                  key={row[keyField] ?? rIdx}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`transition-colors ${
                    rIdx % 2 === 0
                      ? 'bg-surface-container-lowest'
                      : 'bg-surface-container-low/40'
                  } hover:bg-surface-container/60 ${
                    onRowClick ? 'cursor-pointer' : ''
                  }`}
                >
                  {columns.map((col, cIdx) => (
                    <td
                      key={col.accessor || cIdx}
                      className={`px-4 py-3 text-body-md text-on-surface ${
                        col.cellClassName || ''
                      }`}
                    >
                      {col.render
                        ? col.render(row[col.accessor], row, rIdx)
                        : row[col.accessor] ?? '—'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
