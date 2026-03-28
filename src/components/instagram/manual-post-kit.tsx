"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { markAsPosted, type ActionResult } from "@/app/actions";
import type { CarouselSlide } from "@/types";

interface ManualPostKitProps {
  contentId: string;
  caption: string;
  hashtags: string[];
  slides: CarouselSlide[];
  account: string;
}

async function downloadImage(url: string, filename: string) {
  const res = await fetch(url);
  const blob = await res.blob();
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(blobUrl);
}

export function ManualPostKit({ contentId, caption, hashtags, slides, account }: ManualPostKitProps) {
  const router = useRouter();
  const [copied, setCopied] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sortedSlides = [...slides].sort((a, b) => a.slide_number - b.slide_number);
  const hashtagText = hashtags.map((t) => `#${t}`).join(" ");
  const fullCaption = `${caption}\n\n${hashtagText}`;

  const copyToClipboard = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDownloadAll = async () => {
    setDownloading(true);
    for (const slide of sortedSlides) {
      if (slide.image_url) {
        await downloadImage(slide.image_url, `slide-${slide.slide_number}.png`);
        // Small delay between downloads so browser doesn't block them
        await new Promise((r) => setTimeout(r, 300));
      }
    }
    setDownloading(false);
  };

  const handleMarkPosted = async () => {
    setLoading(true);
    setError(null);
    const result: ActionResult = await markAsPosted(contentId);
    if (!result.success) {
      setError(result.error);
    } else {
      router.refresh();
    }
    setLoading(false);
  };

  const slidesWithImages = sortedSlides.filter((s) => s.image_url);

  return (
    <Card className="mt-4">
      <div className="text-white text-sm font-semibold mb-3">Manual Post Kit</div>
      <p className="text-azen-text text-[11px] mb-4">
        Download the slides below, then post them as a carousel on Instagram. Copy the caption and hashtags to paste when posting.
      </p>

      {/* Slide thumbnails grid */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {sortedSlides.map((slide) => (
          <div key={slide.id} className="relative group">
            {slide.image_url ? (
              <img
                src={slide.image_url}
                alt={`Slide ${slide.slide_number}`}
                className="w-full aspect-square object-cover rounded border border-azen-border"
              />
            ) : (
              <div className="w-full aspect-square bg-azen-bg rounded border border-azen-border flex items-center justify-center">
                <span className="text-azen-text text-[10px]">No image</span>
              </div>
            )}
            <div className="absolute top-1 left-1 bg-black/70 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded">
              {slide.slide_number}
            </div>
            {slide.image_url && (
              <button
                onClick={() => downloadImage(slide.image_url!, `slide-${slide.slide_number}.png`)}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Download all button */}
      <Button
        variant="primary"
        onClick={handleDownloadAll}
        disabled={downloading || slidesWithImages.length === 0}
        className="w-full mb-3"
      >
        {downloading ? "Downloading..." : `Download All ${slidesWithImages.length} Slides`}
      </Button>

      {/* Caption section */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-azen-text text-[11px] uppercase tracking-wider">Caption</span>
          <button
            onClick={() => copyToClipboard(fullCaption, "caption")}
            className="text-azen-accent text-[10px] font-semibold hover:underline"
          >
            {copied === "caption" ? "Copied!" : "Copy All"}
          </button>
        </div>
        <div className="bg-azen-bg border border-azen-border rounded-md p-2 text-white text-[11px] leading-relaxed max-h-32 overflow-y-auto whitespace-pre-wrap">
          {fullCaption}
        </div>
      </div>

      {/* Quick copy buttons */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => copyToClipboard(caption, "captionOnly")}
          className="flex-1 bg-azen-bg border border-azen-border rounded-md px-2 py-1.5 text-azen-text text-[10px] font-semibold hover:text-white hover:border-azen-accent transition-colors"
        >
          {copied === "captionOnly" ? "Copied!" : "Copy Caption Only"}
        </button>
        <button
          onClick={() => copyToClipboard(hashtagText, "hashtags")}
          className="flex-1 bg-azen-bg border border-azen-border rounded-md px-2 py-1.5 text-azen-text text-[10px] font-semibold hover:text-white hover:border-azen-accent transition-colors"
        >
          {copied === "hashtags" ? "Copied!" : "Copy Hashtags Only"}
        </button>
      </div>

      {/* Posting order note */}
      <div className="bg-azen-bg border border-azen-border rounded-md p-2 mb-4">
        <div className="text-azen-text text-[10px] font-semibold uppercase tracking-wider mb-1">Posting Order</div>
        <div className="text-white text-[10px] leading-relaxed">
          {sortedSlides.map((s) => (
            <span key={s.id} className="inline-block mr-1">
              <span className="text-azen-accent font-semibold">{s.slide_number}.</span>{" "}
              {s.slide_type === "cover" ? "Cover" : s.slide_type === "cta" ? "CTA" : `Content`}
              {s.slide_number < sortedSlides.length ? " → " : ""}
            </span>
          ))}
        </div>
      </div>

      {/* Mark as posted */}
      <Button
        variant="secondary"
        onClick={handleMarkPosted}
        disabled={loading}
        className="w-full"
      >
        {loading ? "Marking..." : "Mark as Posted"}
      </Button>

      {error && (
        <p className="text-red-400 text-[11px] mt-2">{error}</p>
      )}
    </Card>
  );
}
