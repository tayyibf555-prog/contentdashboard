"use client";

type SlideData = {
  slide_number: number;
  headline: string | null;
  slide_type: "cover" | "content" | "cta";
};

export function SlideNavigator({
  slides,
  activeIndex,
  onSelect,
}: {
  slides: SlideData[];
  activeIndex: number;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
      {slides.map((slide, i) => (
        <button
          key={slide.slide_number}
          onClick={() => onSelect(i)}
          className={`shrink-0 w-16 h-16 rounded-md flex items-center justify-center text-[9px] font-medium transition-all ${
            i === activeIndex
              ? "border-2 border-azen-accent bg-azen-accent/10 text-white"
              : "border border-azen-border bg-azen-bg text-azen-text hover:border-azen-text"
          }`}
        >
          <div className="text-center">
            <div className="text-[8px] uppercase">{slide.slide_type}</div>
            <div>{slide.slide_number}</div>
          </div>
        </button>
      ))}
    </div>
  );
}
