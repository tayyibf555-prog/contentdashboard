"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TweetPreview } from "@/components/twitter/tweet-preview";
import { ThreadBuilder } from "@/components/twitter/thread-builder";
import { CaptionEditor } from "@/components/content/caption-editor";
import { HashtagManager } from "@/components/content/hashtag-manager";
import { PostDetails } from "@/components/content/post-details";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { approveContent, regenerateContent } from "@/app/actions";
import type { GeneratedContent } from "@/types";

export function TwitterEditor({ posts }: { posts: GeneratedContent[] }) {
  const router = useRouter();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [format, setFormat] = useState<"tweet" | "thread">("tweet");
  const [loading, setLoading] = useState<string | null>(null);

  const current = posts[selectedIndex];

  if (!current) {
    return <p className="text-azen-text text-sm">No Twitter/X posts yet. Generate one to get started.</p>;
  }

  const charCount = (current.body || "").length;

  const handleApprove = async () => {
    setLoading("approve");
    try {
      await approveContent(current.id);
      router.refresh();
    } catch { alert("Failed to approve"); }
    finally { setLoading(null); }
  };

  const handleRegenerate = async () => {
    setLoading("regenerate");
    try {
      await regenerateContent(current.id);
      router.refresh();
    } catch { alert("Failed to regenerate"); }
    finally { setLoading(null); }
  };

  return (
    <div>
      <div className="flex gap-4 mb-6">
        {(["tweet", "thread"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFormat(f)}
            className={`text-xs font-semibold pb-1 border-b-2 transition-colors ${
              format === f ? "text-azen-accent border-azen-accent" : "text-azen-text border-transparent hover:text-white"
            }`}
          >
            {f === "tweet" ? "Single Tweet" : "Thread"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <TweetPreview body={current.body || ""} account={current.account} />
          <div className="mt-4 text-center">
            <span className={`text-xs ${charCount > 280 ? "text-red-400" : "text-azen-text"}`}>
              {charCount} / 280 characters
            </span>
          </div>
          {posts.length > 1 && (
            <div className="flex gap-2 mt-4 flex-wrap">
              {posts.map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedIndex(i)}
                  className={`px-2 py-1 rounded text-[10px] ${
                    i === selectedIndex ? "bg-azen-accent text-azen-bg" : "bg-azen-border text-azen-text"
                  }`}
                >
                  {p.title.slice(0, 25)}...
                </button>
              ))}
            </div>
          )}
        </div>
        <div>
          <Card>
            {format === "thread" ? (
              <ThreadBuilder tweets={[current.body || ""]} onUpdate={() => {}} />
            ) : (
              <CaptionEditor caption={current.body || ""} onSave={() => {}} />
            )}
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
            <div className="flex gap-2 mt-4">
              {current.status === "pending" && (
                <Button variant="primary" onClick={handleApprove} disabled={loading === "approve"}>
                  {loading === "approve" ? "Approving..." : "Approve"}
                </Button>
              )}
              <Button variant="secondary" onClick={handleRegenerate} disabled={loading === "regenerate"}>
                {loading === "regenerate" ? "Regenerating..." : "Regenerate"}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
