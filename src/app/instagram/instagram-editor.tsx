"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PhonePreview } from "@/components/instagram/phone-preview";
import { SlideNavigator } from "@/components/instagram/slide-navigator";
import { CaptionEditor } from "@/components/content/caption-editor";
import { HashtagManager } from "@/components/content/hashtag-manager";
import { PostDetails } from "@/components/content/post-details";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { approveContent, regenerateContent, postContent, approveAndPostContent } from "@/app/actions";
import type { GeneratedContent, CarouselSlide } from "@/types";

type PostWithSlides = GeneratedContent & { carousel_slides: CarouselSlide[] };

export function InstagramEditor({ posts }: { posts: PostWithSlides[] }) {
  const router = useRouter();
  const [tab, setTab] = useState<"pending" | "approved" | "posted">("pending");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeSlide, setActiveSlide] = useState(0);
  const [loading, setLoading] = useState<string | null>(null);
  const [postError, setPostError] = useState<string | null>(null);

  const filtered = posts.filter((p) => {
    if (tab === "pending") return p.status === "pending" || p.status === "draft";
    if (tab === "approved") return p.status === "approved" || p.status === "scheduled";
    return p.status === "posted";
  });

  const current = filtered[selectedIndex];
  const slides = current?.carousel_slides?.sort((a, b) => a.slide_number - b.slide_number) || [];

  const handleApprove = async () => {
    if (!current) return;
    setLoading("approve");
    setPostError(null);
    try {
      await approveContent(current.id);
      router.refresh();
    } catch { alert("Failed to approve"); }
    finally { setLoading(null); }
  };

  const handlePost = async () => {
    if (!current) return;
    setLoading("post");
    setPostError(null);
    try {
      await postContent(current.id);
      router.refresh();
    } catch (e) { setPostError(e instanceof Error ? e.message : "Failed to post"); }
    finally { setLoading(null); }
  };

  const handleApproveAndPost = async () => {
    if (!current) return;
    setLoading("approveAndPost");
    setPostError(null);
    try {
      await approveAndPostContent(current.id);
      router.refresh();
    } catch (e) { setPostError(e instanceof Error ? e.message : "Failed to post"); }
    finally { setLoading(null); }
  };

  const handleRegenerate = async () => {
    if (!current) return;
    setLoading("regenerate");
    setPostError(null);
    try {
      await regenerateContent(current.id);
      router.refresh();
    } catch { alert("Failed to regenerate"); }
    finally { setLoading(null); }
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
            <PhonePreview slide={slides[activeSlide] || null} account={current.account} />
            <SlideNavigator slides={slides} activeIndex={activeSlide} onSelect={setActiveSlide} />
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
                  <>
                    <Button variant="primary" onClick={handleApprove} disabled={!!loading}>
                      {loading === "approve" ? "Approving..." : "Approve"}
                    </Button>
                    <Button variant="primary" onClick={handleApproveAndPost} disabled={!!loading} className="bg-green-600 hover:bg-green-500">
                      {loading === "approveAndPost" ? "Posting..." : "Approve & Post"}
                    </Button>
                  </>
                )}
                {current.status === "approved" && (
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
          </div>
        </div>
      )}
    </div>
  );
}
