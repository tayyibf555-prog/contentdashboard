"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { EngagementIdea } from "@/types";

export function IdeasTab({ ideas, account }: { ideas: EngagementIdea[]; account: "business" | "personal" }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "new" | "used" | "dismissed">("new");

  const filtered = ideas.filter((i) => (filter === "all" ? true : i.status === filter));

  async function generateIdeas() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/ideas", {
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
      await fetch("/api/ideas", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
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
          {(["new", "used", "dismissed", "all"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                filter === f ? "bg-azen-accent text-azen-bg" : "bg-azen-card text-azen-text border border-azen-border hover:text-white"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)} ({ideas.filter((i) => (f === "all" ? true : i.status === f)).length})
            </button>
          ))}
        </div>
        <button
          onClick={generateIdeas}
          disabled={loading}
          className="px-3 py-1.5 rounded-md text-xs font-semibold bg-azen-accent text-azen-bg hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {loading ? "Analyzing tracked accounts…" : "Generate new ideas"}
        </button>
      </div>

      {error && <div className="mb-4 text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-3">{error}</div>}

      {filtered.length === 0 ? (
        <div className="text-azen-text text-sm">
          No {filter} ideas yet. Click &ldquo;Generate new ideas&rdquo; to analyze your tracked Instagram accounts.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((idea) => (
            <IdeaCard key={idea.id} idea={idea} onUpdate={updateStatus} />
          ))}
        </div>
      )}
    </div>
  );
}

function IdeaCard({ idea, onUpdate }: { idea: EngagementIdea; onUpdate: (id: string, status: "used" | "dismissed") => void }) {
  return (
    <div className="bg-azen-card border border-azen-border rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span
          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
            idea.format === "reel" ? "bg-purple-500/20 text-purple-300" :
            idea.format === "carousel" ? "bg-azen-accent/20 text-white" : "bg-azen-border text-azen-text"
          }`}
        >
          {idea.format}
        </span>
        {idea.status !== "new" && (
          <span className="text-[10px] text-azen-text uppercase">{idea.status}</span>
        )}
      </div>

      <div>
        <div className="text-[10px] text-azen-text uppercase font-semibold mb-1">Topic</div>
        <div className="text-sm font-semibold text-white">{idea.topic}</div>
      </div>

      <div>
        <div className="text-[10px] text-azen-text uppercase font-semibold mb-1">Hook</div>
        <div className="text-sm text-white/90 italic">&ldquo;{idea.hook_template}&rdquo;</div>
      </div>

      <div>
        <div className="text-[10px] text-azen-text uppercase font-semibold mb-1">Engagement mechanic</div>
        <div className="text-sm text-white">{idea.engagement_mechanic}</div>
      </div>

      <div>
        <div className="text-[10px] text-azen-text uppercase font-semibold mb-1">Why it works</div>
        <div className="text-xs text-azen-text leading-relaxed">{idea.rationale}</div>
      </div>

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
