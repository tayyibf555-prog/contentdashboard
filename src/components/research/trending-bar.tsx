import { TrendingUp } from "lucide-react";

export function TrendingBar({ topics }: { topics: string[] }) {
  if (topics.length === 0) return null;

  return (
    <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-2">
      <span className="inline-flex items-center gap-1.5 text-azen-muted text-[10px] uppercase tracking-[0.2em] font-semibold shrink-0">
        <TrendingUp size={12} strokeWidth={2.2} className="text-azen-accent" />
        Trending
      </span>
      {topics.map((topic) => (
        <span
          key={topic}
          className="bg-azen-surface-2 text-azen-text-strong border border-azen-line hover:border-azen-accent/40 hover:text-azen-accent transition-colors px-3 py-1 rounded-full text-[11px] font-medium whitespace-nowrap cursor-default"
        >
          {topic}
        </span>
      ))}
    </div>
  );
}
