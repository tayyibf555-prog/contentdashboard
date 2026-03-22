"use client";

type TitleVariant = { title: string; ctr_score: number };

export function TitleVariants({
  variants,
  selectedIndex,
  onSelect,
}: {
  variants: TitleVariant[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}) {
  if (variants.length === 0) return null;

  return (
    <div className="mb-4">
      <div className="text-azen-text text-[11px] uppercase tracking-wider mb-2">Title Options</div>
      <div className="space-y-2">
        {variants.map((v, i) => (
          <button
            key={i}
            onClick={() => onSelect(i)}
            className={`w-full text-left p-3 rounded-md border transition-colors ${
              i === selectedIndex
                ? "border-azen-accent bg-azen-accent/5"
                : "border-azen-border bg-azen-bg hover:border-azen-text"
            }`}
          >
            <div className="text-white text-xs font-medium">{v.title}</div>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-azen-text text-[10px]">CTR Score:</span>
              <div className="h-1 flex-1 bg-azen-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-azen-accent rounded-full"
                  style={{ width: `${(v.ctr_score / 10) * 100}%` }}
                />
              </div>
              <span className="text-azen-accent text-[10px] font-semibold">{v.ctr_score}/10</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
