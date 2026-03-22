export function TrendingBar({ topics }: { topics: string[] }) {
  if (topics.length === 0) return null;

  return (
    <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
      <span className="text-azen-text text-[11px] uppercase tracking-wider shrink-0">Trending:</span>
      {topics.map((topic) => (
        <span
          key={topic}
          className="bg-azen-accent/10 text-azen-accent px-3 py-1 rounded-full text-[11px] font-medium whitespace-nowrap"
        >
          {topic}
        </span>
      ))}
    </div>
  );
}
