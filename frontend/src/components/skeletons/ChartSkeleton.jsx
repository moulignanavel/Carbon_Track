/**
 * ChartSkeleton — animated shimmer for chart areas
 */
export default function ChartSkeleton({ height = 260 }) {
  return (
    <div
      className="skeleton-shimmer rounded-xl w-full"
      style={{ height }}
      aria-busy="true"
      aria-label="Loading chart"
    />
  );
}
