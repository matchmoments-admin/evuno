export default function DashboardLoading() {
  return (
    <div className="animate-pulse">
      {/* Metric cards skeleton */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 rounded-dashboard bg-surface border border-border" />
        ))}
      </div>

      {/* Status bar skeleton */}
      <div className="flex gap-3 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-6 w-24 rounded-full bg-surface border border-border" />
        ))}
      </div>

      {/* Table skeleton */}
      <div className="rounded-dashboard border border-border overflow-hidden">
        <div className="h-10 bg-surface border-b border-border" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-14 border-b border-border last:border-0" />
        ))}
      </div>
    </div>
  );
}
