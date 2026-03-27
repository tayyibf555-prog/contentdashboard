"use client";

import { useState } from "react";
import { CarouselSlide } from "./carousel-slide";

const VARIANTS = [
  { key: "azen", label: "Azen", desc: "Brand navy, bold typography" },
  { key: "tayyib", label: "Tayyib", desc: "Personal, teal accent" },
  { key: "architect", label: "Architect", desc: "Structured, professional" },
  { key: "gradient", label: "Gradient", desc: "Expressive, warm" },
  { key: "minimal", label: "Minimal", desc: "Clean, modern" },
  { key: "bold", label: "Bold", desc: "Energetic, high contrast" },
] as const;

type SlideData = {
  slide_number: number;
  headline: string | null;
  body_text: string | null;
  slide_type: "cover" | "content" | "cta";
  image_url: string | null;
  template_variant?: string | null;
  accent_color?: string | null;
};

export function TemplatePicker({
  slides,
  currentVariant,
  account,
  onApply,
  loading,
}: {
  slides: SlideData[];
  currentVariant: string;
  account: "business" | "personal";
  onApply: (variant: string) => void;
  loading: boolean;
}) {
  const [selected, setSelected] = useState(currentVariant);
  // Use first cover slide for preview, fall back to first slide
  const previewSlide = slides.find((s) => s.slide_type === "cover") || slides[0];

  if (!previewSlide) return null;

  return (
    <div className="mt-4">
      <div className="text-xs font-semibold text-white mb-2">Template Style</div>
      <div className="grid grid-cols-6 gap-2">
        {VARIANTS.map((v) => (
          <button
            key={v.key}
            onClick={() => setSelected(v.key)}
            className={`rounded-lg overflow-hidden border-2 transition-all ${
              selected === v.key
                ? "border-azen-accent ring-1 ring-azen-accent/30"
                : "border-azen-border hover:border-azen-text/40"
            }`}
          >
            <div className="w-full aspect-square">
              <CarouselSlide
                slide={previewSlide}
                account={account}
                totalSlides={slides.length}
                variantOverride={v.key}
              />
            </div>
            <div className="bg-azen-card px-1.5 py-1">
              <div className="text-[10px] font-semibold text-white truncate">{v.label}</div>
              <div className="text-[8px] text-azen-text truncate">{v.desc}</div>
            </div>
          </button>
        ))}
      </div>
      {selected !== currentVariant && (
        <button
          onClick={() => onApply(selected)}
          disabled={loading}
          className="mt-2 w-full py-1.5 rounded-lg text-xs font-semibold bg-azen-accent text-azen-bg hover:bg-azen-accent/90 disabled:opacity-50 transition-colors"
        >
          {loading ? "Applying template..." : `Apply "${VARIANTS.find((v) => v.key === selected)?.label}" to all slides`}
        </button>
      )}
    </div>
  );
}
