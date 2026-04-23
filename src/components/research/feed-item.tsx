"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { PlatformBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { AiAnalysisCard } from "./ai-analysis";
import { ExternalLink, Sparkles } from "lucide-react";

type FeedItemProps = {
  post: {
    id: string;
    platform: string;
    title: string | null;
    content_summary: string | null;
    engagement_stats: Record<string, number>;
    url: string | null;
    scraped_at: string;
    tracked_accounts?: { name: string; category: string } | null;
    ai_analysis?: Array<{
      key_insight: string | null;
      content_opportunity: string | null;
      suggested_pillar: string | null;
      trending_topics: string[];
    }>;
  };
};

const PLATFORM_TYPES: Record<string, { label: string; value: string }[]> = {
  instagram: [{ label: "Carousel", value: "carousel" }, { label: "Short Post", value: "short" }],
  linkedin: [{ label: "Long-form Post", value: "long_form" }, { label: "Short Post", value: "short" }],
  twitter: [{ label: "Tweet", value: "tweet" }, { label: "Thread", value: "thread" }],
  youtube: [{ label: "Video Script", value: "video_script" }],
};

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function FeedItem({ post }: FeedItemProps) {
  const router = useRouter();
  const isCompetitor = post.tracked_accounts?.category === "competitor";
  const analysis = post.ai_analysis?.[0];
  const [showGenerate, setShowGenerate] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [genPlatform, setGenPlatform] = useState("linkedin");
  const [genAccount, setGenAccount] = useState("business");
  const [genType, setGenType] = useState("long_form");

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const context = [
        post.title && `Title: ${post.title}`,
        post.content_summary && `Content: ${post.content_summary}`,
        analysis?.key_insight && `Insight: ${analysis.key_insight}`,
        analysis?.content_opportunity && `Opportunity: ${analysis.content_opportunity}`,
      ].filter(Boolean).join("\n");

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: genPlatform,
          account: genAccount,
          pillar: analysis?.suggested_pillar || "ai_education",
          contentType: genType,
          researchContext: context,
        }),
      });

      if (!res.ok) throw new Error("Generation failed");
      setShowGenerate(false);
      router.push(`/${genPlatform}?account=${genAccount}`);
      router.refresh();
    } catch {
      alert("Failed to generate content. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const topEngagement = Object.entries(post.engagement_stats || {})
    .filter(([, v]) => typeof v === "number" && v > 0)
    .slice(0, 4);

  return (
    <>
      <Card variant="surface" interactive accent={isCompetitor} className="h-full flex flex-col">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <PlatformBadge platform={post.platform} />
            <span className="text-white text-[13px] font-semibold truncate">
              {post.tracked_accounts?.name || "Unknown"}
            </span>
            {isCompetitor && (
              <span className="text-red-300 text-[9px] font-semibold uppercase tracking-wider border border-red-500/40 rounded px-1.5 py-0.5">
                Competitor
              </span>
            )}
          </div>
          <span className="text-azen-muted text-[10px] font-mono whitespace-nowrap">
            {new Date(post.scraped_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
          </span>
        </div>

        {post.title && (
          <div className="text-white font-display font-semibold text-[18px] leading-[1.25] mb-2 line-clamp-2">
            {post.title}
          </div>
        )}
        {post.content_summary && (
          <div className="text-azen-text text-[12.5px] leading-relaxed mb-4 line-clamp-4">
            {post.content_summary}
          </div>
        )}

        {analysis && (
          <div className="mb-4">
            <AiAnalysisCard analysis={analysis} />
          </div>
        )}

        <div className="flex-1" />

        <div className="flex items-center justify-between gap-3 pt-3 border-t border-azen-line">
          <div className="flex gap-3 text-[10px] font-mono text-azen-muted">
            {topEngagement.map(([k, v]) => (
              <span key={k} className="uppercase tracking-wider">
                <span className="text-azen-text-strong">{fmt(v as number)}</span> {k.slice(0, 1)}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            {post.url && (
              <a
                href={post.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-azen-text hover:text-white transition-colors px-2 py-1 rounded-md border border-azen-line hover:border-azen-line-strong"
              >
                <ExternalLink size={12} /> Source
              </a>
            )}
            <Button variant="primary" size="sm" onClick={() => setShowGenerate(true)}>
              <Sparkles size={12} /> Generate
            </Button>
          </div>
        </div>
      </Card>

      <Modal isOpen={showGenerate} onClose={() => setShowGenerate(false)} title="Generate from this post">
        <div className="space-y-4">
          <div>
            <label className="text-azen-text text-[11px] font-semibold uppercase tracking-wider block mb-1.5">Platform</label>
            <select
              value={genPlatform}
              onChange={(e) => {
                setGenPlatform(e.target.value);
                setGenType(PLATFORM_TYPES[e.target.value]?.[0]?.value || "short");
              }}
              className="w-full bg-azen-bg border border-azen-line rounded-md px-3 py-2 text-white text-xs"
            >
              <option value="instagram">Instagram</option>
              <option value="linkedin">LinkedIn</option>
              <option value="twitter">Twitter/X</option>
              <option value="youtube">YouTube</option>
            </select>
          </div>
          <div>
            <label className="text-azen-text text-[11px] font-semibold uppercase tracking-wider block mb-1.5">Account</label>
            <select
              value={genAccount}
              onChange={(e) => setGenAccount(e.target.value)}
              className="w-full bg-azen-bg border border-azen-line rounded-md px-3 py-2 text-white text-xs"
            >
              <option value="business">Business (@azen_ai)</option>
              <option value="personal">Personal (@tayyib.ai)</option>
            </select>
          </div>
          <div>
            <label className="text-azen-text text-[11px] font-semibold uppercase tracking-wider block mb-1.5">Content Type</label>
            <select
              value={genType}
              onChange={(e) => setGenType(e.target.value)}
              className="w-full bg-azen-bg border border-azen-line rounded-md px-3 py-2 text-white text-xs"
            >
              {(PLATFORM_TYPES[genPlatform] || []).map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          {analysis?.suggested_pillar && (
            <div className="text-azen-text text-[11px]">
              Suggested pillar: <span className="text-azen-accent font-semibold">{analysis.suggested_pillar}</span>
            </div>
          )}
          <Button variant="primary" size="lg" onClick={handleGenerate} disabled={generating} className="w-full">
            {generating ? "Generating…" : "Generate"}
          </Button>
        </div>
      </Modal>
    </>
  );
}
