"use client";

import { useState, useRef } from "react";

type Slide = {
  id: string;
  slide_number: number;
  slide_type: "cover" | "content" | "cta";
  custom_background_url: string | null;
};

type Mode = "same" | "per-slide";

export function BackgroundUploader({
  slides,
  onComplete,
}: {
  slides: Slide[];
  onComplete: () => void;
}) {
  const [mode, setMode] = useState<Mode>("same");
  const [uploading, setUploading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [localUrls, setLocalUrls] = useState<Record<string, string>>({});
  const sharedRef = useRef<HTMLInputElement>(null);
  const perSlideRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const sortedSlides = [...slides].sort((a, b) => a.slide_number - b.slide_number);
  const uploaded = sortedSlides.every((s) => localUrls[s.id] || s.custom_background_url);

  async function uploadFor(file: File, slideIds: string[]) {
    setError(null);
    setUploading(slideIds.join(","));
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("slideIds", JSON.stringify(slideIds));
      const res = await fetch("/api/carousel/upload-background", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      const urls: Record<string, string> = {};
      for (const id of slideIds) urls[id] = data.url;
      setLocalUrls((prev) => ({ ...prev, ...urls }));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(null);
    }
  }

  return (
    <div className="rounded-xl border border-azen-border bg-azen-card p-4">
      <div className="mb-3">
        <div className="text-sm font-semibold text-white mb-1">Upload carousel background</div>
        <div className="text-xs text-azen-text">
          Personal carousels require a background image before slide generation.
        </div>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setMode("same")}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            mode === "same" ? "bg-azen-accent text-azen-bg" : "bg-azen-bg text-white border border-azen-border"
          }`}
        >
          Same for all slides
        </button>
        <button
          onClick={() => setMode("per-slide")}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            mode === "per-slide" ? "bg-azen-accent text-azen-bg" : "bg-azen-bg text-white border border-azen-border"
          }`}
        >
          Different per slide
        </button>
      </div>

      {/* Same-for-all */}
      {mode === "same" && (
        <div>
          <input
            ref={sharedRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadFor(file, sortedSlides.map((s) => s.id));
            }}
          />
          <button
            onClick={() => sharedRef.current?.click()}
            disabled={!!uploading}
            className="w-full py-6 rounded-lg border-2 border-dashed border-azen-border text-azen-text text-xs hover:border-azen-accent hover:text-white transition-colors disabled:opacity-50"
          >
            {uploading ? "Uploading…" : "Click to upload background for all slides"}
          </button>
          {sortedSlides[0] && (localUrls[sortedSlides[0].id] || sortedSlides[0].custom_background_url) && (
            <div className="mt-3 flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={localUrls[sortedSlides[0].id] || sortedSlides[0].custom_background_url!}
                alt=""
                className="w-16 h-16 rounded object-cover"
              />
              <span className="text-xs text-azen-text">Applied to all {sortedSlides.length} slides</span>
            </div>
          )}
        </div>
      )}

      {/* Per-slide */}
      {mode === "per-slide" && (
        <div className="grid grid-cols-2 gap-2">
          {sortedSlides.map((slide) => {
            const url = localUrls[slide.id] || slide.custom_background_url;
            const isUploading = uploading?.includes(slide.id);
            return (
              <div key={slide.id} className="rounded-lg border border-azen-border p-2">
                <div className="text-[10px] text-azen-text mb-1">
                  Slide {slide.slide_number} · {slide.slide_type}
                </div>
                <input
                  ref={(el) => { perSlideRefs.current[slide.id] = el; }}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadFor(file, [slide.id]);
                  }}
                />
                {url ? (
                  <button
                    onClick={() => perSlideRefs.current[slide.id]?.click()}
                    className="w-full aspect-square rounded overflow-hidden relative group"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-[10px] text-white font-semibold">Replace</span>
                    </div>
                  </button>
                ) : (
                  <button
                    onClick={() => perSlideRefs.current[slide.id]?.click()}
                    disabled={isUploading}
                    className="w-full aspect-square rounded border-2 border-dashed border-azen-border text-azen-text text-[10px] hover:border-azen-accent hover:text-white transition-colors disabled:opacity-50"
                  >
                    {isUploading ? "Uploading…" : "Upload"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {error && <div className="mt-3 text-xs text-red-400">{error}</div>}

      {uploaded && (
        <button
          onClick={onComplete}
          className="mt-4 w-full py-2 rounded-lg bg-azen-accent text-azen-bg text-xs font-semibold hover:bg-azen-accent/90 transition-colors"
        >
          Generate carousel slides
        </button>
      )}
    </div>
  );
}
