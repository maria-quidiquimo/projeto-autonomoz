export default function Skeleton({
  className = '',
  rows = 1,
  height = 'h-4',
  width = 'w-full',
}) {
  if (rows > 1) {
    return (
      <div className={`flex flex-col gap-2.5 ${className}`}>
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className={`${height} ${
              i === rows - 1 ? 'w-3/4' : width
            } rounded bg-surface-container/60 animate-pulse`}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${height} ${width} rounded bg-surface-container/60 animate-pulse ${className}`}
    />
  );
}
