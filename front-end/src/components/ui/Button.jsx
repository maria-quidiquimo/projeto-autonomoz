export default function Button({
  children,
  type = 'button',
  variant = 'primary', // primary | secondary | danger | outline | ghost
  size = 'md', // sm | md | lg
  disabled = false,
  loading = false,
  icon,
  iconRight,
  className = '',
  onClick,
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center gap-2 font-body-md font-bold rounded transition-all duration-150 cursor-pointer select-none active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 min-h-[44px]';

  const variants = {
    primary:
      'bg-primary hover:bg-primary-container text-on-primary shadow-xs border border-transparent',
    secondary:
      'bg-surface-container-high hover:bg-surface-container-highest text-on-surface shadow-xs border border-outline-variant/30',
    danger:
      'bg-error hover:bg-error/90 text-on-error shadow-xs border border-transparent',
    outline:
      'bg-transparent hover:bg-surface-container text-on-surface border border-outline/30',
    ghost:
      'bg-transparent hover:bg-surface-container text-secondary hover:text-on-surface border border-transparent',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-body-sm min-h-[38px]',
    md: 'px-4 py-2 text-body-md min-h-[44px]',
    lg: 'px-6 py-2.5 text-body-lg min-h-[48px]',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${
        sizes[size] || sizes.md
      } ${className}`}
      {...props}
    >
      {loading ? (
        <span className="material-symbols-outlined animate-spin text-[18px]">
          progress_activity
        </span>
      ) : icon ? (
        <span className="material-symbols-outlined text-[20px] shrink-0">
          {icon}
        </span>
      ) : null}
      <span>{children}</span>
      {!loading && iconRight && (
        <span className="material-symbols-outlined text-[20px] shrink-0">
          {iconRight}
        </span>
      )}
    </button>
  );
}
