"use client";

import { useState } from "react";
import { PlatformBadge, PillarBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { GeneratedContent } from "@/types";
import { BUSINESS_PILLARS, PERSONAL_PILLARS } from "@/lib/constants";
import { ChevronDown, RotateCcw } from "lucide-react";

export function QueueItem({
  content,
  onApprove,
  onRegenerate,
  onApproveAndPost,
}: {
  content: GeneratedContent;
  onApprove: (id: string) => void;
  onRegenerate: (id: string) => void;
  onApproveAndPost: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pillars = content.account === "business" ? BUSINESS_PILLARS : PERSONAL_PILLARS;
  const pillar = pillars.find((p) => p.key === content.pillar);

  const handleApproveAndPost = async () => {
    setLoading("approveAndPost");
    setError(null);
    try {
      await onApproveAndPost(content.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to post");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="group">
      <div
        className="flex items-center gap-4 py-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <PlatformBadge platform={content.platform} />
        <div className="flex-1 min-w-0">
          <div className="text-white text-[14px] font-medium truncate tracking-tight">{content.title}</div>
          <div className="flex gap-2 items-center mt-1.5 flex-wrap">
            <span className="text-azen-text text-[11px] font-mono uppercase tracking-wider">
              {content.content_type}
            </span>
            <span className="text-azen-muted text-[11px]">·</span>
            <span className="text-azen-text text-[11px]">{content.account === "business" ? "@azen_ai" : "@tayyib.ai"}</span>
            {pillar && <PillarBadge label={pillar.label.split(" — ")[0]} color={pillar.color} />}
          </div>
          {error && <p className="text-red-400 text-[11px] mt-1">{error}</p>}
        </div>
        {content.best_time && (
          <div className="text-right mr-1">
            <div className="text-azen-muted text-[9px] uppercase tracking-wider">Best</div>
            <div className="text-white text-[12px] font-mono font-medium">{content.best_time}</div>
          </div>
        )}
        <div className="flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
          <Button variant="secondary" size="sm" onClick={() => onApprove(content.id)} disabled={!!loading}>Approve</Button>
          <Button variant="primary" size="sm" onClick={handleApproveAndPost} disabled={!!loading}>
            {loading === "approveAndPost" ? "Posting…" : "Approve & post"}
          </Button>
          <Button variant="icon" onClick={() => onRegenerate(content.id)} disabled={!!loading} aria-label="Regenerate">
            <RotateCcw size={14} />
          </Button>
          <ChevronDown
            size={16}
            className={`text-azen-muted transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          />
        </div>
      </div>

      {expanded && (
        <div className="pb-5 pl-14 animate-fade-in">
          <div className="bg-azen-bg/60 border border-azen-line rounded-md p-4 space-y-3">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-azen-muted mb-1.5">Preview</div>
              <div className="text-azen-text-strong text-[12.5px] leading-relaxed whitespace-pre-wrap">
                {content.body}
              </div>
            </div>
            {content.hashtags.length > 0 && (
              <div className="flex gap-1.5 flex-wrap">
                {content.hashtags.map((tag) => (
                  <span key={tag} className="text-white text-[11px] font-mono">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
