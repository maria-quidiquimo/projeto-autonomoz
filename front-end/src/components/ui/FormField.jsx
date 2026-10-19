export default function FormField({
  label,
  id,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  helperText,
  required = false,
  disabled = false,
  icon,
  children,
  className = '',
  inputClassName = '',
  rows = 3,
  ...props
}) {
  const inputId = id || name;

  const baseInputStyles =
    'w-full rounded bg-surface-container-low border border-outline/30 font-body-md text-on-surface placeholder:text-secondary/60 transition-colors focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed';

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-body-sm font-semibold text-on-surface flex items-center justify-between"
        >
          <span>
            {label}
            {required && <span className="text-error ml-1">*</span>}
          </span>
          {helperText && !error && (
            <span className="text-secondary font-normal text-[11px]">
              {helperText}
            </span>
          )}
        </label>
      )}

      <div className="relative flex items-center">
        {icon && (
          <span className="material-symbols-outlined absolute left-3 text-secondary text-[20px] pointer-events-none">
            {icon}
          </span>
        )}

        {type === 'select' ? (
          <select
            id={inputId}
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            required={required}
            className={`${baseInputStyles} h-11 px-3.5 ${
              icon ? 'pl-10' : ''
            } ${error ? 'border-error ring-1 ring-error' : ''} ${inputClassName}`}
            {...props}
          >
            {children}
          </select>
        ) : type === 'textarea' ? (
          <textarea
            id={inputId}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            rows={rows}
            className={`${baseInputStyles} p-3.5 ${
              icon ? 'pl-10' : ''
            } ${error ? 'border-error ring-1 ring-error' : ''} ${inputClassName}`}
            {...props}
          />
        ) : (
          <input
            id={inputId}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            className={`${baseInputStyles} h-11 px-3.5 ${
              icon ? 'pl-10' : ''
            } ${error ? 'border-error ring-1 ring-error' : ''} ${inputClassName}`}
            {...props}
          />
        )}
      </div>

      {error && (
        <span className="text-error text-body-sm font-medium flex items-center gap-1 mt-0.5 animate-in fade-in">
          <span className="material-symbols-outlined text-[16px]">error</span>
          {error}
        </span>
      )}
    </div>
  );
}
