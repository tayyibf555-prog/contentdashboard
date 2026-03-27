"use client";

import { CarouselSlide } from "./carousel-slide";

type SlideData = {
  slide_number: number;
  headline: string | null;
  body_text: string | null;
  slide_type: "cover" | "content" | "cta";
  image_url: string | null;
  template_variant?: string | null;
  accent_color?: string | null;
};

export function PhonePreview({
  slide,
  account,
  totalSlides = 8,
}: {
  slide: SlideData | null;
  account: "business" | "personal";
  totalSlides?: number;
}) {
  const handle = account === "business" ? "azen_ai" : "tayyib.ai";

  return (
    <div className="w-[320px] bg-black rounded-[2rem] p-3 mx-auto">
      <div className="bg-azen-bg rounded-2xl overflow-hidden">
        {/* IG Header */}
        <div className="flex items-center gap-2 px-3 py-2">
          <div className="w-7 h-7 rounded-full bg-azen-accent/20 flex items-center justify-center text-azen-accent text-[10px] font-bold">
            {handle[0].toUpperCase()}
          </div>
          <span className="text-white text-[11px] font-semibold">{handle}</span>
        </div>
        {/* Slide Content */}
        <div className="aspect-square">
          {slide ? (
            <CarouselSlide slide={slide} account={account} totalSlides={totalSlides} />
          ) : (
            <div className="w-full h-full bg-azen-card flex items-center justify-center text-azen-text text-xs">
              No slide selected
            </div>
          )}
        </div>
        {/* IG Action Bar */}
        <div className="flex items-center gap-4 px-3 py-2 text-azen-text text-lg">
          <span>&#9825;</span>
          <span>&#9900;</span>
          <span>&#10148;</span>
        </div>
      </div>
    </div>
  );
}
