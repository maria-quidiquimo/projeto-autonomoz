import Button from './Button';

export default function EmptyState({
  title = 'Nenhum registro encontrado',
  description = 'Não há dados correspondentes para os filtros selecionados.',
  icon = 'inbox',
  actionLabel,
  onAction,
  className = '',
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center bg-surface-container-lowest/50 rounded-lg border border-dashed border-outline-variant/60 my-4 ${className}`}
    >
      <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center text-secondary mb-3">
        <span className="material-symbols-outlined text-[30px]">{icon}</span>
      </div>
      <h3 className="text-headline-sm font-bold text-on-surface mb-1">
        {title}
      </h3>
      <p className="text-body-sm text-secondary max-w-sm mb-4">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
