"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { PhonePreview } from "@/components/instagram/phone-preview";
import { SlideNavigator } from "@/components/instagram/slide-navigator";
import { CaptionEditor } from "@/components/content/caption-editor";
import { HashtagManager } from "@/components/content/hashtag-manager";
import { PostDetails } from "@/components/content/post-details";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { approveContent, regenerateContent, postContent, approveAndPostContent, switchCarouselTemplate, type ActionResult } from "@/app/actions";
import { TemplatePicker } from "@/components/instagram/template-picker";
import { ManualPostKit } from "@/components/instagram/manual-post-kit";
import type { GeneratedContent, CarouselSlide } from "@/types";

type PostWithSlides = GeneratedContent & { carousel_slides: CarouselSlide[] };

export function InstagramEditor({ posts }: { posts: PostWithSlides[] }) {
  const router = useRouter();
  const [tab, setTab] = useState<"pending" | "approved" | "posted">("pending");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeSlide, setActiveSlide] = useState(0);
  const [loading, setLoading] = useState<string | null>(null);
  const [postError, setPostError] = useState<string | null>(null);
  const [imageProgress, setImageProgress] = useState<{ current: number; total: number } | null>(null);
  const generatingRef = useRef<string | null>(null);

  const filtered = posts.filter((p) => {
    if (tab === "pending") return p.status === "pending" || p.status === "draft";
    if (tab === "approved") return p.status === "approved" || p.status === "scheduled";
    return p.status === "posted";
  });

  const current = filtered[selectedIndex];
  const slides = current?.carousel_slides?.sort((a, b) => a.slide_number - b.slide_number) || [];

  const [imageError, setImageError] = useState<string | null>(null);

  // Generate slide images for slides missing image_url
  const generateMissingImages = useCallback(async (post: PostWithSlides) => {
    const sortedSlides = post.carousel_slides?.sort((a, b) => a.slide_number - b.slide_number) || [];
    const missing = sortedSlides.filter((s) => !s.image_url);
    if (missing.length === 0) return;
    if (generatingRef.current === post.id) return;
    generatingRef.current = post.id;
    setImageError(null);

    const total = missing.length;
    let failCount = 0;
    setImageProgress({ current: 0, total });

    for (let i = 0; i < missing.length; i++) {
      const slide = missing[i];
      setImageProgress({ current: i + 1, total });

      try {
        const res = await fetch("/api/carousel", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slideId: slide.id,
            slideType: slide.slide_type,
            props: {
              headline: slide.headline,
              bodyText: slide.body_text,
              accentWord: slide.body_text,
              ctaText: slide.body_text,
              subtitle: slide.slide_type === "cover" ? slide.body_text : undefined,
              account: post.account,
              slideNumber: slide.slide_number,
              totalSlides: sortedSlides.length,
            },
            account: post.account,
            pillar: post.pillar || "education",
            variant: slide.template_variant || "architect",
          }),
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          console.error(`Slide ${slide.slide_number} failed:`, res.status, errData);
          failCount++;
        }
      } catch (err) {
        console.error(`Slide ${slide.slide_number} network error:`, err);
        failCount++;
      }
    }

    setImageProgress(null);
    generatingRef.current = null;

    if (failCount > 0) {
      setImageError(`${failCount} of ${total} slides failed to generate. Click "Generate Images" to retry.`);
    }

    router.refresh();
  }, [router]);

  // Auto-generate on mount when slides are missing images
  useEffect(() => {
    if (current && current.content_type === "carousel" && current.carousel_slides?.length > 0) {
      const hasMissing = current.carousel_slides.some((s) => !s.image_url);
      if (hasMissing && generatingRef.current !== current.id) {
        generateMissingImages(current);
      }
    }
  }, [current?.id, generateMissingImages]); // eslint-disable-line react-hooks/exhaustive-deps

  // Manual trigger for image generation
  const handleGenerateImages = () => {
    if (!current) return;
    generatingRef.current = null; // Reset guard to allow retry
    generateMissingImages(current);
  };

  const hasMissingImages = current?.content_type === "carousel" &&
    current?.carousel_slides?.some((s) => !s.image_url);

  const handleResult = (result: ActionResult, fallbackMsg: string) => {
    if (!result.success) {
      setPostError(result.error || fallbackMsg);
    } else {
      router.refresh();
    }
  };

  const handleApprove = async () => {
    if (!current) return;
    setLoading("approve");
    setPostError(null);
    const result = await approveContent(current.id);
    handleResult(result, "Failed to approve");
    setLoading(null);
  };

  const handlePost = async () => {
    if (!current) return;
    setLoading("post");
    setPostError(null);
    const result = await postContent(current.id);
    handleResult(result, "Failed to post");
    setLoading(null);
  };

  const handleApproveAndPost = async () => {
    if (!current) return;
    setLoading("approveAndPost");
    setPostError(null);
    const result = await approveAndPostContent(current.id);
    handleResult(result, "Failed to post");
    setLoading(null);
  };

  const handleSwitchTemplate = async (variant: string) => {
    if (!current) return;
    setLoading("template");
    setPostError(null);
    const result = await switchCarouselTemplate(current.id, variant);
    handleResult(result, "Failed to switch template");
    setLoading(null);
  };

  const handleRegenerate = async () => {
    if (!current) return;
    setLoading("regenerate");
    setPostError(null);
    const result = await regenerateContent(current.id);
    handleResult(result, "Failed to regenerate");
    setLoading(null);
  };

  return (
    <div>
      <div className="flex gap-4 mb-6">
        {(["pending", "approved", "posted"] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setSelectedIndex(0); setActiveSlide(0); }}
            className={`text-xs font-semibold pb-1 border-b-2 transition-colors ${
              tab === t ? "text-azen-accent border-azen-accent" : "text-azen-text border-transparent hover:text-white"
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)} ({posts.filter((p) => {
              if (t === "pending") return p.status === "pending" || p.status === "draft";
              if (t === "approved") return p.status === "approved" || p.status === "scheduled";
              return p.status === "posted";
            }).length})
          </button>
        ))}
      </div>

      {!current ? (
        <p className="text-azen-text text-sm">No {tab} carousel posts.</p>
      ) : (
        <div className="grid grid-cols-2 gap-6">
          <div>
            <PhonePreview slide={slides[activeSlide] || null} account={current.account} totalSlides={slides.length} />
            {imageProgress && (
              <div className="mt-2 bg-azen-card rounded-lg p-3 border border-azen-border">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-azen-accent border-t-transparent rounded-full animate-spin" />
                  <span className="text-azen-text text-[11px]">
                    Generating slide images... {imageProgress.current}/{imageProgress.total}
                  </span>
                </div>
                <div className="mt-2 h-1 bg-azen-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-azen-accent rounded-full transition-all duration-500"
                    style={{ width: `${(imageProgress.current / imageProgress.total) * 100}%` }}
                  />
                </div>
              </div>
            )}
            {imageError && (
              <div className="mt-2 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                <p className="text-red-400 text-[11px]">{imageError}</p>
              </div>
            )}
            {hasMissingImages && !imageProgress && (
              <button
                onClick={handleGenerateImages}
                className="mt-2 w-full bg-azen-accent text-azen-bg px-3 py-2 rounded-md text-xs font-semibold hover:opacity-90 transition-opacity"
              >
                Generate Images
              </button>
            )}
            <SlideNavigator slides={slides} activeIndex={activeSlide} onSelect={setActiveSlide} />
            {slides.length > 0 && (current.status === "pending" || current.status === "draft") && (
              <TemplatePicker
                slides={slides}
                currentVariant={slides[0]?.template_variant || "architect"}
                account={current.account}
                onApply={handleSwitchTemplate}
                loading={loading === "template"}
              />
            )}
            {filtered.length > 1 && (
              <div className="flex gap-2 mt-4 flex-wrap">
                {filtered.map((p, i) => (
                  <button
                    key={p.id}
                    onClick={() => { setSelectedIndex(i); setActiveSlide(0); }}
                    className={`px-2 py-1 rounded text-[10px] ${
                      i === selectedIndex ? "bg-azen-accent text-azen-bg" : "bg-azen-border text-azen-text"
                    }`}
                  >
                    {p.title.slice(0, 20)}...
                  </button>
                ))}
              </div>
            )}
          </div>
          <div>
            <Card>
              <CaptionEditor caption={current.body || ""} onSave={() => {}} />
              <HashtagManager hashtags={current.hashtags || []} onUpdate={() => {}} />
              <PostDetails
                platform={current.platform}
                account={current.account}
                pillar={current.pillar}
                status={current.status}
                bestTime={current.best_time}
                contentType={current.content_type}
                sourceReference={current.source_reference}
              />
              <div className="flex gap-2 mt-4 flex-wrap">
                {current.status === "pending" && (
                  <Button variant="primary" onClick={handleApprove} disabled={!!loading}>
                    {loading === "approve" ? "Approving..." : "Approve"}
                  </Button>
                )}
                {current.status === "approved" && current.content_type !== "carousel" && (
                  <Button variant="primary" onClick={handlePost} disabled={!!loading} className="bg-green-600 hover:bg-green-500">
                    {loading === "post" ? "Posting..." : "Post Now"}
                  </Button>
                )}
                <Button variant="secondary" onClick={handleRegenerate} disabled={!!loading}>
                  {loading === "regenerate" ? "Regenerating..." : "Regenerate"}
                </Button>
              </div>
              {postError && (
                <p className="text-red-400 text-[11px] mt-2">{postError}</p>
              )}
            </Card>
            {current.status === "approved" && current.content_type === "carousel" && (
              <ManualPostKit
                contentId={current.id}
                caption={current.body || ""}
                hashtags={current.hashtags || []}
                slides={slides}
                account={current.account}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
