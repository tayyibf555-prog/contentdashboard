"use client";

type ThumbnailConcept = { label: string; description: string; image_url?: string };

export function ThumbnailConcepts({
  concepts,
  selectedIndex,
  onSelect,
}: {
  concepts: ThumbnailConcept[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}) {
  if (concepts.length === 0) return null;

  return (
    <div className="mb-4">
      <div className="text-azen-text text-[11px] uppercase tracking-wider mb-2">Thumbnail Concepts</div>
      <div className="grid grid-cols-3 gap-2">
        {concepts.map((c, i) => (
          <button
            key={i}
            onClick={() => onSelect(i)}
            className={`rounded-md border overflow-hidden transition-all ${
              i === selectedIndex
                ? "border-azen-accent ring-1 ring-azen-accent"
                : "border-azen-border hover:border-azen-text"
            }`}
          >
            <div className="aspect-video bg-azen-bg flex items-center justify-center">
              {c.image_url ? (
                <img src={c.image_url} alt={c.label} className="w-full h-full object-cover" />
              ) : (
                <span className="text-azen-accent text-2xl font-bold">{c.label}</span>
              )}
            </div>
            <div className="p-2">
              <div className="text-azen-text text-[9px] leading-tight">{c.description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
