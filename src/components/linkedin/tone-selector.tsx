"use client";

const TONES = ["Professional", "Conversational", "Story-driven", "Controversial"] as const;

export function ToneSelector({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (tone: string) => void;
}) {
  return (
    <div className="mb-4">
      <div className="text-azen-text text-[11px] uppercase tracking-wider mb-2">Tone</div>
      <div className="flex gap-2">
        {TONES.map((tone) => (
          <button
            key={tone}
            onClick={() => onSelect(tone)}
            className={`px-3 py-1.5 rounded-md text-[11px] font-semibold transition-colors ${
              selected === tone
                ? "bg-azen-accent text-azen-bg"
                : "bg-azen-border text-azen-text hover:text-white"
            }`}
          >
            {tone}
          </button>
        ))}
      </div>
    </div>
  );
}
