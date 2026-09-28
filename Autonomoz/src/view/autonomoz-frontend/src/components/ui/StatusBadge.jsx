export default function StatusBadge({ status, label, className = '' }) {
  const normalized = String(status || label || '').toUpperCase().trim();

  let colorClass = 'bg-surface-container text-on-surface border-outline-variant/30';
  let dotColor = 'bg-secondary';
  let displayLabel = label || status;

  switch (normalized) {
    case 'ATIVO':
    case 'CONCLUIDA':
    case 'CONCLUIDO':
    case 'RESOLVIDO':
    case 'OK':
    case 'ENTRADA':
    case 'PAGO':
      colorClass = 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30';
      dotColor = 'bg-emerald-500';
      break;

    case 'EM_ANDAMENTO':
    case 'EM PRODUÇÃO':
    case 'EM PRODUCAO':
    case 'PENDENTE':
    case 'ATENÇÃO':
    case 'ATENCAO':
    case 'VALIDADE_PROXIMA':
      colorClass = 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30';
      dotColor = 'bg-amber-500';
      break;

    case 'CRÍTICO':
    case 'CRITICO':
    case 'ESTOQUE_MINIMO':
    case 'CANCELADA':
    case 'CANCELADO':
    case 'INATIVO':
    case 'ERRO':
    case 'REJEITADO':
      colorClass = 'bg-error/15 text-error border border-error/30';
      dotColor = 'bg-error';
      break;

    case 'SAIDA':
    case 'SAÍDA':
      colorClass = 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30';
      dotColor = 'bg-blue-500';
      break;

    case 'AJUSTE':
    case 'AJUSTE_POSITIVO':
    case 'AJUSTE_NEGATIVO':
      colorClass = 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30';
      dotColor = 'bg-purple-500';
      break;

    default:
      colorClass = 'bg-surface-container text-secondary border border-outline-variant/30';
      dotColor = 'bg-secondary';
  }

  // Format label for readable text
  if (normalized === 'EM_ANDAMENTO') displayLabel = 'Em Andamento';
  if (normalized === 'ESTOQUE_MINIMO') displayLabel = 'Estoque Mínimo';
  if (normalized === 'VALIDADE_PROXIMA') displayLabel = 'Validade Próxima';
  if (normalized === 'AJUSTE_POSITIVO') displayLabel = 'Ajuste (+)';
  if (normalized === 'AJUSTE_NEGATIVO') displayLabel = 'Ajuste (-)';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded font-label-code text-[12px] font-semibold tracking-wide ${colorClass} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
      <span>{displayLabel}</span>
    </span>
  );
}
