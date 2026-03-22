"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TitleVariants } from "@/components/youtube/title-variants";
import { ThumbnailConcepts } from "@/components/youtube/thumbnail-concepts";
import { ScriptEditor } from "@/components/youtube/script-editor";
import { HashtagManager } from "@/components/content/hashtag-manager";
import { PostDetails } from "@/components/content/post-details";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { approveContent, regenerateContent } from "@/app/actions";
import type { GeneratedContent, YoutubeScript } from "@/types";

type PostWithScript = GeneratedContent & { youtube_scripts: YoutubeScript[] };

export function YouTubeEditor({ posts }: { posts: PostWithScript[] }) {
  const router = useRouter();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [titleIndex, setTitleIndex] = useState(0);
  const [thumbnailIndex, setThumbnailIndex] = useState(0);
  const [loading, setLoading] = useState<string | null>(null);

  const current = posts[selectedIndex];
  const script = current?.youtube_scripts?.[0];

  if (!current || !script) {
    return <p className="text-azen-text text-sm">No YouTube scripts yet. Generate one to get started.</p>;
  }

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
        <ThumbnailConcepts
          concepts={script.thumbnail_concepts || []}
          selectedIndex={thumbnailIndex}
          onSelect={setThumbnailIndex}
        />
        <Card>
          <div className="text-white text-sm font-semibold mb-3">Script</div>
          <ScriptEditor
            script={{
              hook: script.hook,
              intro: script.intro,
              body_sections: script.body_sections || [],
              cta: script.cta,
            }}
            onUpdate={() => {}}
          />
          {script.estimated_duration && (
            <div className="mt-3 text-azen-text text-[10px]">
              Estimated Duration: <span className="text-white">{script.estimated_duration}</span>
            </div>
          )}
        </Card>
      </div>
      <div>
        <Card>
          <TitleVariants
            variants={script.title_variants || []}
            selectedIndex={titleIndex}
            onSelect={setTitleIndex}
          />
          {script.description && (
            <div className="mb-4">
              <div className="text-azen-text text-[11px] uppercase tracking-wider mb-2">Description</div>
              <textarea
                defaultValue={script.description}
                rows={6}
                className="w-full bg-azen-bg border border-azen-border rounded-md px-3 py-2 text-white text-xs leading-relaxed resize-none focus:outline-none focus:border-azen-accent"
              />
            </div>
          )}
          <HashtagManager hashtags={script.tags || []} onUpdate={() => {}} />
          <PostDetails
            platform="youtube"
            account={current.account}
            pillar={current.pillar}
            status={current.status}
            bestTime={current.best_time || "Sunday 2:00 PM"}
            contentType="video_script"
            sourceReference={current.source_reference}
          />
          <div className="flex gap-2 mt-4">
            {current.status === "pending" && (
              <Button variant="primary" onClick={handleApprove} disabled={loading === "approve"}>
                {loading === "approve" ? "Approving..." : "Approve Script"}
              </Button>
            )}
            <Button variant="secondary" onClick={handleRegenerate} disabled={loading === "regenerate"}>
              {loading === "regenerate" ? "Regenerating..." : "Regenerate"}
            </Button>
          </div>
        </Card>
        {posts.length > 1 && (
          <div className="flex gap-2 mt-4 flex-wrap">
            {posts.map((p, i) => (
              <button
                key={p.id}
                onClick={() => { setSelectedIndex(i); setTitleIndex(0); setThumbnailIndex(0); }}
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
    </div>
  );
}
