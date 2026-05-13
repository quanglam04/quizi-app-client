export function SkeletonCard() {
  return (
    <div className="p-6 rounded-2xl bg-slate-800/50 border border-white/10 animate-pulse">
      <div className="h-5 bg-slate-700 rounded-lg w-2/3 mb-3" />
      <div className="h-4 bg-slate-700/60 rounded w-1/2 mb-4" />
      <div className="flex gap-2">
        <div className="h-8 bg-slate-700/40 rounded-lg w-20" />
        <div className="h-8 bg-slate-700/40 rounded-lg w-16" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-2xl overflow-hidden border border-white/10 bg-slate-900">
      <div className="bg-slate-800 px-6 py-4 flex gap-8">
        <div className="h-4 bg-slate-700 rounded w-32 animate-pulse" />
        <div className="h-4 bg-slate-700 rounded w-24 animate-pulse" />
        <div className="h-4 bg-slate-700 rounded w-20 animate-pulse" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="px-6 py-4 border-t border-white/5 flex gap-8 animate-pulse"
          style={{ animationDelay: `${i * 0.05}s` }}
        >
          <div className="h-4 bg-slate-700/50 rounded w-40" />
          <div className="h-4 bg-slate-700/50 rounded w-28" />
          <div className="h-4 bg-slate-700/50 rounded w-16" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-slate-700/50 rounded"
          style={{
            width: `${100 - (i % 3) * 15}%`,
            animationDelay: `${i * 0.05}s`,
          }}
        />
      ))}
    </div>
  );
}
