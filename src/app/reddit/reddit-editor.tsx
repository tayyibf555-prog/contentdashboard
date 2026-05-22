"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { approveContent, regenerateContent, markAsPosted } from "@/app/actions";
import type { GeneratedContent } from "@/types";

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="text-[10px] font-semibold px-2.5 py-1 rounded border border-azen-line text-azen-text hover:border-azen-accent hover:text-white transition-colors"
    >
      {copied ? "Copied!" : label}
    </button>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
    approved: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    posted: "bg-green-500/10 text-green-400 border-green-500/30",
  };
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${styles[status] || styles.pending}`}>
      {status}
    </span>
  );
}

export function RedditEditor({ posts }: { posts: GeneratedContent[] }) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(posts[0]?.id || null);
  const [loading, setLoading] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const current = posts.find((p) => p.id === selectedId) || posts[0] || null;
  const subreddit = current?.hashtags?.[0] || null;

  if (!current) {
    return (
      <p className="text-azen-text text-sm">
        No Reddit posts yet. Hit &quot;Generate Post&quot; to get started.
      </p>
    );
  }

  const wordCount = (current.body || "").split(/\s+/).filter(Boolean).length;

  const run = async (key: string, fn: () => Promise<{ success: boolean; error?: string }>) => {
    setLoading(key);
    const result = await fn();
    setLoading(null);
    if (result.success) router.refresh();
  };

  return (
    <div className="grid grid-cols-[280px_1fr] gap-6">
      {/* Post list */}
      <div className="space-y-1.5">
        <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-azen-muted mb-3">
          {posts.length} post{posts.length !== 1 ? "s" : ""}
        </div>
        {posts.map((p) => (
          <button
            key={p.id}
            onClick={() => { setSelectedId(p.id); setExpanded(false); }}
            className={`w-full text-left px-3 py-2.5 rounded-md border transition-colors ${
              p.id === current.id
                ? "border-azen-accent bg-azen-accent/5 text-white"
                : "border-azen-line bg-azen-card text-azen-text hover:border-azen-accent/50 hover:text-white"
            }`}
          >
            <div className="text-[11px] font-semibold leading-snug line-clamp-2 mb-1">{p.title}</div>
            <div className="flex items-center gap-2">
              <StatusBadge status={p.status} />
              {p.hashtags?.[0] && (
                <span className="text-[9px] text-azen-muted">{p.hashtags[0]}</span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Post detail */}
      <div className="space-y-4">
        {/* Title card */}
        <div className="bg-azen-card border border-azen-line rounded-lg p-4">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-azen-muted">Title</div>
            <CopyButton text={current.title} label="Copy Title" />
          </div>
          <p className="text-white text-[14px] font-semibold leading-snug">{current.title}</p>
        </div>

        {/* Subreddit */}
        {subreddit && (
          <div className="bg-azen-card border border-azen-line rounded-lg px-4 py-3 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-azen-muted mb-0.5">Suggested Subreddit</div>
              <span className="text-azen-accent text-[13px] font-semibold">{subreddit}</span>
            </div>
            <CopyButton text={subreddit} label="Copy" />
          </div>
        )}

        {/* Body card */}
        <div className="bg-azen-card border border-azen-line rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-azen-muted">Post Body</div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-azen-muted">{wordCount} words</span>
              <CopyButton text={current.body || ""} label="Copy Body" />
            </div>
          </div>
          <div
            className={`text-azen-text text-[12px] leading-relaxed whitespace-pre-wrap font-mono ${
              !expanded ? "max-h-64 overflow-hidden relative" : ""
            }`}
          >
            {current.body}
            {!expanded && (
              <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-azen-card to-transparent" />
            )}
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-2 text-[10px] text-azen-accent hover:text-white transition-colors font-semibold"
          >
            {expanded ? "Show less" : "Show full post"}
          </button>
        </div>

        {/* Copy all button */}
        <CopyButton
          text={`${current.title}\n\n${current.body}`}
          label="Copy Full Post (Title + Body)"
        />

        {/* Actions */}
        <div className="flex items-center gap-2 flex-wrap pt-1">
          {current.status === "pending" && (
            <button
              onClick={() => run("approve", () => approveContent(current.id))}
              disabled={!!loading}
              className="bg-azen-accent text-azen-bg px-3.5 py-2 rounded-md text-xs font-semibold disabled:opacity-50 hover:bg-azen-accent/90 transition-colors"
            >
              {loading === "approve" ? "Approving..." : "Approve"}
            </button>
          )}
          {current.status === "approved" && (
            <button
              onClick={() => run("posted", () => markAsPosted(current.id))}
              disabled={!!loading}
              className="bg-green-600 text-white px-3.5 py-2 rounded-md text-xs font-semibold disabled:opacity-50 hover:bg-green-500 transition-colors"
            >
              {loading === "posted" ? "Marking..." : "Mark as Posted"}
            </button>
          )}
          <button
            onClick={() => run("regen", () => regenerateContent(current.id))}
            disabled={!!loading}
            className="bg-azen-card border border-azen-line text-azen-text px-3.5 py-2 rounded-md text-xs font-semibold disabled:opacity-50 hover:text-white hover:border-azen-accent transition-colors"
          >
            {loading === "regen" ? "Regenerating..." : "Regenerate"}
          </button>
        </div>
      </div>
    </div>
  );
}
