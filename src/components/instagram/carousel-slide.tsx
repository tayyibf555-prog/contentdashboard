type SlideData = {
  slide_number: number;
  headline: string | null;
  body_text: string | null;
  slide_type: "cover" | "content" | "cta";
  image_url: string | null;
};

export function CarouselSlide({ slide, account }: { slide: SlideData; account: "business" | "personal" }) {
  const logo = account === "business" ? "azen" : "tayyib.ai";

  return (
    <div className="w-full aspect-square bg-azen-bg rounded-lg flex flex-col justify-center items-center p-8 relative">
      {slide.slide_type === "cover" && (
        <>
          <div className="text-white text-2xl font-bold text-center leading-tight mb-4">
            {slide.headline}
          </div>
          <div className="text-azen-text text-sm">Swipe to learn more</div>
        </>
      )}
      {slide.slide_type === "content" && (
        <>
          <div className="text-azen-accent text-lg font-bold mb-3 text-center">{slide.headline}</div>
          <div className="text-white text-sm text-center leading-relaxed">{slide.body_text}</div>
        </>
      )}
      {slide.slide_type === "cta" && (
        <>
          <div className="text-white text-xl font-bold text-center mb-3">{slide.headline}</div>
          <div className="text-azen-accent text-base font-semibold text-center">{slide.body_text}</div>
        </>
      )}
      <div className="absolute bottom-3 text-white text-xs font-semibold">{logo}</div>
      <div className="absolute top-2 right-3 text-azen-text text-[10px]">
        {slide.slide_number}/8
      </div>
    </div>
  );
}
