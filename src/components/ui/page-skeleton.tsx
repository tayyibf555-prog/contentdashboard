/**
 * Shared skeleton for loading.tsx files. Displays the TopBar shell + a
 * card-grid skeleton with a shimmer so the page fills in progressively.
 */
export function PageSkeleton({
  eyebrow = "Loading",
  title = " ",
  rows = 2,
  cols = 3,
}: {
  eyebrow?: string;
  title?: string;
  rows?: number;
  cols?: 2 | 3 | 4;
}) {
  const colsClass = cols === 2 ? "md:grid-cols-2" : cols === 3 ? "md:grid-cols-3" : "md:grid-cols-4";

  return (
    <div>
      <div className="mb-8">
        <div className="text-[10px] font-semibold uppercase tracking-[0.25em] text-azen-muted mb-2">{eyebrow}</div>
        <div className="font-display font-semibold text-display leading-none tracking-[-0.02em] text-azen-text-strong opacity-40">
          {title}
        </div>
      </div>

      <div className="h-10 w-80 rounded-md bg-azen-surface/40 border border-white/[0.04] mb-6 animate-pulse" />

      <div className={`grid grid-cols-1 ${colsClass} gap-4`}>
        {Array.from({ length: rows * cols }).map((_, i) => (
          <div
            key={i}
            className="h-44 rounded-lg bg-azen-surface/30 border border-white/[0.05] backdrop-blur-xl animate-pulse"
            style={{ animationDelay: `${i * 60}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
