/**
 * CardSkeleton — animated shimmer placeholder
 */
export default function CardSkeleton({ lines = 3 }) {
  return (
    <div className="card p-5" aria-busy="true" aria-label="Loading">
      <div className="skeleton-shimmer h-4 w-1/3 mb-4" />
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton-shimmer h-3 mb-2"
          style={{ width: `${100 - i * 15}%` }}
        />
      ))}
    </div>
  );
}
