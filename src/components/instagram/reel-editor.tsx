"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ReelPreview } from "@/components/instagram/reel-preview";
import { ReelScriptEditor } from "@/components/instagram/reel-script-editor";
import { CaptionEditor } from "@/components/content/caption-editor";
import { HashtagManager } from "@/components/content/hashtag-manager";
import { PostDetails } from "@/components/content/post-details";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { approveContent, regenerateContent, type ActionResult } from "@/app/actions";
import type { GeneratedContent, ReelScript } from "@/types";

type ReelPost = GeneratedContent & { reel_scripts: ReelScript[] };

export function ReelEditor({ posts }: { posts: ReelPost[] }) {
  const router = useRouter();
  const [tab, setTab] = useState<"pending" | "approved" | "posted">("pending");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState<string | null>(null);
  const [postError, setPostError] = useState<string | null>(null);

  const filtered = posts.filter((p) => {
    if (tab === "pending") return p.status === "pending" || p.status === "draft";
    if (tab === "approved") return p.status === "approved" || p.status === "scheduled";
    return p.status === "posted";
  });

  const current = filtered[selectedIndex];
  const script = current?.reel_scripts?.[0];

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
            onClick={() => { setTab(t); setSelectedIndex(0); }}
            className={`text-xs font-semibold pb-1 border-b-2 transition-colors ${
              tab === t ? "text-white border-azen-accent" : "text-azen-text border-transparent hover:text-white"
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

      {!current || !script ? (
        <p className="text-azen-text text-sm">No {tab} reel scripts.</p>
      ) : (
        <div className="grid grid-cols-2 gap-6">
          <div>
            <ReelPreview
              title={current.title}
              hook={script.hook}
              onScreenText={script.on_screen_text || []}
            />
            <Card className="mt-4">
              <div className="text-white text-sm font-semibold mb-3">Script</div>
              <ReelScriptEditor
                script={{
                  hook: script.hook,
                  body_script: script.body_script,
                  cta: script.cta,
                  on_screen_text: script.on_screen_text || [],
                  estimated_duration: script.estimated_duration,
                  recording_notes: script.recording_notes,
                }}
                onUpdate={() => {}}
              />
            </Card>
          </div>
          <div>
            <Card>
              <CaptionEditor caption={current.body || ""} onSave={() => {}} />
              <HashtagManager hashtags={current.hashtags || []} onUpdate={() => {}} />
              <PostDetails
                platform="instagram"
                account={current.account}
                pillar={current.pillar}
                status={current.status}
                bestTime={current.best_time}
                contentType="reel"
                sourceReference={current.source_reference}
              />
              <div className="flex gap-2 mt-4 flex-wrap">
                {current.status === "pending" && (
                  <Button variant="primary" onClick={handleApprove} disabled={!!loading}>
                    {loading === "approve" ? "Approving..." : "Approve"}
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
            {filtered.length > 1 && (
              <div className="flex gap-2 mt-4 flex-wrap">
                {filtered.map((p, i) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedIndex(i)}
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
        </div>
      )}
    </div>
  );
}
