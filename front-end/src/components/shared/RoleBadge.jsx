export default function RoleBadge({ role, className = '' }) {
  const isGerente = role === 'GERENTE';

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded font-label-code text-[11px] font-bold tracking-wider uppercase ${
        isGerente
          ? 'bg-primary/20 text-inverse-primary border border-primary/30'
          : 'bg-secondary/20 text-secondary-fixed-dim border border-secondary/30'
      } ${className}`}
    >
      {isGerente ? 'GERENTE' : 'FUNCIONÁRIO'}
    </span>
  );
}
