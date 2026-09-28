export default function SearchInput({
  value,
  onChange,
  onClear,
  placeholder = 'Buscar...',
  className = '',
}) {
  return (
    <div className={`relative flex items-center ${className}`}>
      <span className="material-symbols-outlined absolute left-3 text-secondary text-[20px] pointer-events-none">
        search
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-11 pl-10 pr-9 rounded bg-surface-container-low border border-outline/30 font-label-code text-body-sm text-on-surface placeholder:text-secondary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            if (onClear) onClear();
            else onChange('');
          }}
          className="absolute right-2.5 p-1 rounded text-secondary hover:text-on-surface transition-colors"
          aria-label="Limpar busca"
        >
          <span className="material-symbols-outlined text-[16px]">close</span>
        </button>
      )}
    </div>
  );
}
