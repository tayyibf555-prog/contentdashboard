"use client";

import { useState } from "react";
import { PlatformBadge, PillarBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { GeneratedContent } from "@/types";
import { BUSINESS_PILLARS, PERSONAL_PILLARS } from "@/lib/constants";

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
    <div className="bg-azen-bg rounded-md mb-2">
      <div
        className="flex items-center p-3 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <PlatformBadge platform={content.platform} />
        <div className="flex-1 ml-3">
          <div className="text-white text-[13px] font-medium">{content.title}</div>
          <div className="flex gap-2 items-center mt-1">
            <span className="text-azen-text text-[11px]">
              {content.content_type} · {content.account === "business" ? "@azen_ai" : "@tayyib.ai"}
            </span>
            {pillar && <PillarBadge label={pillar.label} color={pillar.color} />}
            {content.source_reference && (
              <span className="text-azen-text text-[10px]">
                Inspired by {content.source_reference}
              </span>
            )}
          </div>
          {error && <p className="text-red-400 text-[10px] mt-1">{error}</p>}
        </div>
        {content.best_time && (
          <div className="text-right mr-3">
            <div className="text-azen-text text-[10px]">Best time</div>
            <div className="text-azen-accent text-[10px] font-semibold">{content.best_time}</div>
          </div>
        )}
        <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
          <Button variant="primary" onClick={() => onApprove(content.id)} disabled={!!loading}>Approve</Button>
          <Button variant="primary" onClick={handleApproveAndPost} disabled={!!loading} className="bg-green-600 hover:bg-green-500">
            {loading === "approveAndPost" ? "Posting..." : "Approve & Post"}
          </Button>
          <Button variant="secondary" onClick={() => setExpanded(true)}>Edit</Button>
          <Button variant="icon" onClick={() => onRegenerate(content.id)} disabled={!!loading}>↻</Button>
        </div>
      </div>

      {expanded && (
        <div className="px-3 pb-4 border-t border-azen-border pt-3">
          <div className="text-azen-text text-[11px] uppercase tracking-wider mb-2">Preview</div>
          <div className="text-[#ccc] text-xs leading-relaxed whitespace-pre-wrap mb-3">
            {content.body}
          </div>
          {content.hashtags.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {content.hashtags.map((tag) => (
                <span key={tag} className="bg-azen-border text-azen-accent px-2 py-0.5 rounded text-[10px]">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
