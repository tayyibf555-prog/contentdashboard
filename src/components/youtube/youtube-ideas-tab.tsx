"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { VideoIdea } from "@/types";

export function YouTubeIdeasTab({ ideas, account }: { ideas: VideoIdea[]; account: "business" | "personal" }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "new" | "used" | "dismissed" | "saved">("new");

  const matchFilter = (i: VideoIdea, f: typeof filter) =>
    f === "all" ? true : f === "saved" ? i.saved : i.status === f;

  const filtered = ideas.filter((i) => matchFilter(i, filter));

  async function generateIdeas() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/video-ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: string, status: "used" | "dismissed") {
    try {
      await fetch("/api/video-ideas", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  }

  async function toggleSaved(id: string, saved: boolean) {
    try {
      await fetch("/api/video-ideas", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, saved }),
      });
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex gap-2">
          {(["new", "saved", "used", "dismissed", "all"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                filter === f ? "bg-azen-accent text-azen-bg" : "bg-azen-card text-azen-text border border-azen-border hover:text-white"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)} ({ideas.filter((i) => matchFilter(i, f)).length})
            </button>
          ))}
        </div>
        <button
          onClick={generateIdeas}
          disabled={loading}
          className="px-3 py-1.5 rounded-md text-xs font-semibold bg-azen-accent text-azen-bg hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {loading ? "Finding top videos…" : "Refresh ideas"}
        </button>
      </div>

      {error && <div className="mb-4 text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-3">{error}</div>}

      {filtered.length === 0 ? (
        <div className="text-azen-text text-sm">
          No {filter} ideas yet. Ideas appear automatically after the next competitor scrape — or hit &ldquo;Refresh ideas&rdquo; to pull them from your top-performing tracked YouTube videos now.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((idea) => (
            <VideoIdeaCard key={idea.id} idea={idea} onUpdate={updateStatus} onToggleSave={toggleSaved} />
          ))}
        </div>
      )}
    </div>
  );
}

function VideoIdeaCard({
  idea,
  onUpdate,
  onToggleSave,
}: {
  idea: VideoIdea;
  onUpdate: (id: string, status: "used" | "dismissed") => void;
  onToggleSave: (id: string, saved: boolean) => void;
}) {
  return (
    <div className="bg-azen-card border border-azen-border rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {idea.niche && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-azen-accent/20 text-white">
              {idea.niche}
            </span>
          )}
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
            {idea.source_metric || "top video"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {idea.status !== "new" && (
            <span className="text-[10px] text-azen-text uppercase">{idea.status}</span>
          )}
          <button
            onClick={() => onToggleSave(idea.id, !idea.saved)}
            title={idea.saved ? "Remove from saved" : "Save idea"}
            aria-label={idea.saved ? "Remove from saved" : "Save idea"}
            className={`text-base leading-none transition-colors ${
              idea.saved ? "text-azen-accent" : "text-azen-text hover:text-white"
            }`}
          >
            {idea.saved ? "★" : "☆"}
          </button>
        </div>
      </div>

      <div>
        <div className="text-[10px] text-azen-text uppercase font-semibold mb-1">Video title</div>
        <div className="text-sm font-semibold text-white">{idea.video_title}</div>
      </div>

      <div>
        <div className="text-[10px] text-azen-text uppercase font-semibold mb-1">What it covers</div>
        <div className="text-sm text-white/90 leading-relaxed">{idea.overview}</div>
      </div>

      <div>
        <div className="text-[10px] text-azen-text uppercase font-semibold mb-1">How to recreate it</div>
        <div className="text-sm text-white leading-relaxed">{idea.how_to_recreate}</div>
      </div>

      {idea.source_url && (
        <a
          href={idea.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold text-azen-accent hover:underline"
        >
          View original video →
        </a>
      )}

      {idea.status === "new" && (
        <div className="flex gap-2 mt-auto pt-2 border-t border-azen-border">
          <button
            onClick={() => onUpdate(idea.id, "used")}
            className="flex-1 py-1.5 rounded-md text-xs font-semibold bg-azen-accent text-azen-bg hover:opacity-90"
          >
            Mark as used
          </button>
          <button
            onClick={() => onUpdate(idea.id, "dismissed")}
            className="px-3 py-1.5 rounded-md text-xs font-semibold bg-azen-border text-azen-text hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
