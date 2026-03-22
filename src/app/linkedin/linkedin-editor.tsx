"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LinkedInPreview } from "@/components/linkedin/linkedin-preview";
import { HookVariants } from "@/components/linkedin/hook-variants";
import { ToneSelector } from "@/components/linkedin/tone-selector";
import { CaptionEditor } from "@/components/content/caption-editor";
import { HashtagManager } from "@/components/content/hashtag-manager";
import { PostDetails } from "@/components/content/post-details";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { approveContent, regenerateContent } from "@/app/actions";
import type { GeneratedContent } from "@/types";

export function LinkedInEditor({ posts }: { posts: GeneratedContent[] }) {
  const router = useRouter();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [tone, setTone] = useState("Professional");
  const [hookIndex, setHookIndex] = useState(0);
  const [loading, setLoading] = useState<string | null>(null);

  const current = posts[selectedIndex];

  if (!current) {
    return <p className="text-azen-text text-sm">No LinkedIn posts yet. Generate one to get started.</p>;
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
    <div className="grid grid-cols-2 gap-6">
      <div>
        <LinkedInPreview body={current.body || ""} account={current.account} />
        <div className="mt-4 text-center">
          <span className={`text-xs ${charCount > 3000 ? "text-red-400" : "text-azen-text"}`}>
            {charCount} / 3,000 characters
          </span>
        </div>
        {posts.length > 1 && (
          <div className="flex gap-2 mt-4 flex-wrap">
            {posts.map((p, i) => (
              <button
                key={p.id}
                onClick={() => { setSelectedIndex(i); setHookIndex(0); }}
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
          <ToneSelector selected={tone} onSelect={setTone} />
          <HookVariants
            hooks={[{ text: (current.body || "").split("\n")[0] || "Hook from generated post", score: 8.5 }]}
            selectedIndex={hookIndex}
            onSelect={setHookIndex}
          />
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
  );
}
