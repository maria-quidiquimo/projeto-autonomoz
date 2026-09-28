export default function KpiCard({
  title,
  value,
  icon,
  subtext,
  badgeText,
  badgeVariant = 'neutral', // neutral | success | warning | danger
  variant = 'default', // default | warning | danger
  loading = false,
}) {
  const badgeStyles = {
    neutral: 'bg-surface-container text-secondary',
    success: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    warning: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    danger: 'bg-error/15 text-error',
    info: 'bg-tertiary-fixed text-on-tertiary-fixed',
  };

  const iconVariants = {
    default: 'bg-surface-container text-primary',
    warning: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    danger: 'bg-error-container text-error',
    info: 'bg-tertiary/15 text-tertiary',
  };

  return (
    <div className="flex flex-col justify-between p-space-md bg-surface-container-lowest rounded-lg border border-outline-variant/30 shadow-xs relative overflow-hidden min-h-[140px]">
      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          <span className="font-label-sm text-[12px] uppercase tracking-wider text-secondary font-semibold">
            {title}
          </span>
          {loading ? (
            <div className="h-8 w-24 bg-surface-container rounded animate-pulse mt-2" />
          ) : (
            <span
              className={`font-label-metric text-[28px] leading-tight tracking-tight mt-1 font-bold ${
                variant === 'danger'
                  ? 'text-error'
                  : variant === 'warning'
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-on-surface'
              }`}
            >
              {value}
            </span>
          )}
        </div>
        <div
          className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${
            iconVariants[variant] || iconVariants.default
          }`}
        >
          <span className="material-symbols-outlined text-[26px]">{icon}</span>
        </div>
      </div>

      <div className="mt-space-md pt-space-xs flex items-center justify-between gap-2 border-t border-outline-variant/15">
        <span className="font-body-sm text-[13px] text-secondary truncate">
          {subtext}
        </span>
        {badgeText && (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded font-label-code text-[11px] font-bold shrink-0 ${
              badgeStyles[badgeVariant] || badgeStyles.neutral
            }`}
          >
            {badgeText}
          </span>
        )}
      </div>
    </div>
  );
}
