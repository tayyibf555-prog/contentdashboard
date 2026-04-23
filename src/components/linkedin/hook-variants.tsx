"use client";

type HookVariant = { text: string; score: number };

export function HookVariants({
  hooks,
  selectedIndex,
  onSelect,
}: {
  hooks: HookVariant[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}) {
  if (hooks.length === 0) return null;

  return (
    <div className="mb-4">
      <div className="text-azen-text text-[11px] uppercase tracking-wider mb-2">Hook Options</div>
      <div className="space-y-2">
        {hooks.map((hook, i) => (
          <button
            key={i}
            onClick={() => onSelect(i)}
            className={`w-full text-left p-3 rounded-md border transition-colors ${
              i === selectedIndex
                ? "border-azen-accent bg-azen-accent/5"
                : "border-azen-border bg-azen-bg hover:border-azen-text"
            }`}
          >
            <div className="text-white text-xs leading-relaxed">{hook.text}</div>
            <div className="flex items-center gap-2 mt-2">
              <div className="h-1 flex-1 bg-azen-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-azen-accent rounded-full"
                  style={{ width: `${(hook.score / 10) * 100}%` }}
                />
              </div>
              <span className="text-white text-[10px] font-semibold">{hook.score}/10</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
