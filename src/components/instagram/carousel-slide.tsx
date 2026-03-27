type SlideData = {
  slide_number: number;
  headline: string | null;
  body_text: string | null;
  slide_type: "cover" | "content" | "cta";
  image_url: string | null;
  template_variant?: string | null;
  accent_color?: string | null;
};

export function CarouselSlide({
  slide,
  account,
  totalSlides = 8,
  variantOverride,
}: {
  slide: SlideData;
  account: "business" | "personal";
  totalSlides?: number;
  variantOverride?: string | null;
}) {
  // If we have a generated image and no variant override, show the PNG directly
  if (slide.image_url && !variantOverride) {
    return (
      <img
        src={slide.image_url}
        alt={slide.headline || "Carousel slide"}
        className="w-full aspect-square rounded-lg object-cover"
      />
    );
  }

  const accent = slide.accent_color || "#00d4aa";
  const variant = variantOverride || slide.template_variant || "architect";
  const logo = account === "business" ? "azen" : "tayyib.ai";

  // Minimal variant uses light bg
  if (variant === "minimal") {
    return (
      <div className="w-full aspect-square rounded-lg flex flex-col justify-center items-center p-8 relative" style={{ background: "#fafafa" }}>
        {variant === "minimal" && <div className="absolute top-0 left-0 w-full h-1" style={{ background: accent }} />}
        {slide.slide_type === "cover" && (
          <>
            <div className="text-2xl font-bold text-center leading-tight mb-4" style={{ color: "#111" }}>
              {slide.headline}
            </div>
            <div className="text-sm" style={{ color: "#666" }}>Swipe to learn more</div>
          </>
        )}
        {slide.slide_type === "content" && (
          <>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold" style={{ background: accent }}>
                {slide.slide_number}
              </div>
              <div className="text-lg font-bold" style={{ color: "#111" }}>{slide.headline}</div>
            </div>
            <div className="text-sm leading-relaxed pl-8" style={{ color: "#444" }}>{slide.body_text}</div>
          </>
        )}
        {slide.slide_type === "cta" && (
          <div className="w-full aspect-square rounded-lg flex flex-col justify-center items-center p-8" style={{ background: accent }}>
            <div className="text-xl font-bold text-center mb-3 text-white">{slide.headline}</div>
            <div className="text-base text-center text-white/90">{slide.body_text}</div>
          </div>
        )}
        <div className="absolute bottom-3 left-8 flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ background: accent }} />
          <span className="text-xs font-semibold" style={{ color: "#111" }}>{logo}</span>
        </div>
        <div className="absolute top-2 right-3 text-[10px]" style={{ color: "#999" }}>{slide.slide_number}/{totalSlides}</div>
      </div>
    );
  }

  // Gradient variant
  if (variant === "gradient") {
    return (
      <div className="w-full aspect-square rounded-lg flex flex-col justify-center items-center p-8 relative overflow-hidden" style={{ background: `radial-gradient(circle at 30% 40%, ${accent}22 0%, #080810 100%)` }}>
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full" style={{ background: accent, opacity: 0.12 }} />
        {slide.slide_type === "cover" && (
          <>
            <div className="text-white text-2xl font-bold text-center leading-tight mb-4">{slide.headline}</div>
            <div className="text-sm" style={{ color: "#e0e0e0", opacity: 0.7 }}>Swipe to learn more</div>
          </>
        )}
        {slide.slide_type === "content" && (
          <>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold mb-3" style={{ background: accent }}>
              {slide.slide_number}
            </div>
            <div className="text-white text-lg font-bold mb-3 text-center">{slide.headline}</div>
            <div className="text-sm text-center leading-relaxed" style={{ color: "#e0e0e0" }}>{slide.body_text}</div>
          </>
        )}
        {slide.slide_type === "cta" && (
          <div className="w-full aspect-square rounded-lg flex flex-col justify-center items-center p-8" style={{ background: accent }}>
            <div className="text-xl font-bold text-center mb-3" style={{ color: "#0a0e1a" }}>{slide.headline}</div>
            <div className="text-base text-center" style={{ color: "#0a0e1a", opacity: 0.8 }}>{slide.body_text}</div>
          </div>
        )}
        <div className="absolute bottom-3 left-8 text-white text-xs font-semibold">{logo}</div>
        <div className="absolute top-2 right-3 text-[10px]" style={{ color: "#e0e0e0" }}>{slide.slide_number}/{totalSlides}</div>
      </div>
    );
  }

  // Bold variant
  if (variant === "bold") {
    return (
      <div className="w-full aspect-square bg-azen-bg rounded-lg flex flex-col justify-center items-center p-8 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-xl" style={{ background: accent, opacity: 0.15, transform: "rotate(25deg)" }} />
        {slide.slide_type === "cover" && (
          <div className="text-white text-2xl font-bold text-center leading-tight uppercase tracking-tight">{slide.headline}</div>
        )}
        {slide.slide_type === "content" && (
          <>
            <div className="flex items-center gap-2 mb-3 self-start">
              <span className="text-3xl font-bold" style={{ color: accent }}>{String(slide.slide_number).padStart(2, "0")}</span>
              <div className="w-0.5 h-8 rounded" style={{ background: accent }} />
              <div className="text-white text-base font-bold uppercase">{slide.headline}</div>
            </div>
            <div className="text-azen-text text-sm leading-relaxed pl-1">{slide.body_text}</div>
          </>
        )}
        {slide.slide_type === "cta" && (
          <div className="flex w-full h-full">
            <div className="w-1/2 flex items-center justify-end p-4" style={{ background: accent }}>
              <div className="text-right font-bold uppercase" style={{ color: "#0a0e1a" }}>{slide.headline}</div>
            </div>
            <div className="w-1/2 bg-azen-bg flex items-center p-4">
              <div className="text-white text-sm">{slide.body_text}</div>
            </div>
          </div>
        )}
        <div className="absolute bottom-3 left-8 text-white text-xs font-semibold">{logo}</div>
        <div className="absolute top-2 right-3 text-azen-text text-[10px]">{slide.slide_number}/{totalSlides}</div>
      </div>
    );
  }

  // Default: Architect variant
  return (
    <div className="w-full aspect-square bg-azen-bg rounded-lg flex flex-col justify-center items-center p-8 relative">
      <div className="absolute left-0 top-8 bottom-8 w-1 rounded-r" style={{ background: accent }} />
      {slide.slide_type === "cover" && (
        <>
          <div className="text-white text-2xl font-bold text-center leading-tight mb-4">{slide.headline}</div>
          <div className="w-10 h-0.5 mb-4" style={{ background: accent }} />
          <div className="text-azen-text text-sm">Swipe to learn more</div>
        </>
      )}
      {slide.slide_type === "content" && (
        <>
          <div className="text-lg font-bold mb-3 text-center" style={{ color: accent }}>{slide.headline}</div>
          <div className="text-white text-sm text-center leading-relaxed">{slide.body_text}</div>
        </>
      )}
      {slide.slide_type === "cta" && (
        <>
          <div className="text-white text-xl font-bold text-center mb-3">{slide.headline}</div>
          <div className="rounded-lg px-4 py-2 text-sm font-bold" style={{ background: accent, color: "#0a0e1a" }}>{slide.body_text}</div>
        </>
      )}
      <div className="absolute bottom-3 left-8 text-white text-xs font-semibold">{logo}</div>
      <div className="absolute top-2 right-3 text-azen-text text-[10px]">{slide.slide_number}/{totalSlides}</div>
    </div>
  );
}
