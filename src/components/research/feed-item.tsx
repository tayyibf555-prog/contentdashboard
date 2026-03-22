"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { PlatformBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { AiAnalysisCard } from "./ai-analysis";

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

  return (
    <>
      <Card className="mb-3" border={isCompetitor ? "#ff7675" : undefined}>
        <div className="flex items-start gap-3">
          <PlatformBadge platform={post.platform} />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-white text-[13px] font-medium">
                {post.tracked_accounts?.name || "Unknown"}
              </span>
              {isCompetitor && (
                <span className="bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded text-[9px] font-semibold">
                  COMPETITOR
                </span>
              )}
              <span className="text-azen-text text-[10px]">
                {new Date(post.scraped_at).toLocaleDateString()}
              </span>
            </div>
            {post.title && (
              <div className="text-white text-xs font-medium mb-1">{post.title}</div>
            )}
            {post.content_summary && (
              <div className="text-azen-text text-xs leading-relaxed mb-2 line-clamp-3">
                {post.content_summary}
              </div>
            )}
            <div className="flex gap-4 text-[10px] text-azen-text mb-3">
              {Object.entries(post.engagement_stats || {}).map(([key, val]) => (
                <span key={key}>{key}: {(val as number).toLocaleString()}</span>
              ))}
            </div>
            {analysis && <AiAnalysisCard analysis={analysis} />}
            <div className="flex gap-2 mt-3">
              <Button variant="primary" onClick={() => setShowGenerate(true)}>
                Generate Content From This
              </Button>
              {post.url && (
                <a
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-azen-border text-azen-text px-3 py-1.5 rounded-md text-[11px] font-semibold hover:text-white transition-colors"
                >
                  View Original
                </a>
              )}
            </div>
          </div>
        </div>
      </Card>

      <Modal isOpen={showGenerate} onClose={() => setShowGenerate(false)} title="Generate Content">
        <div className="space-y-3">
          <div>
            <label className="text-azen-text text-[11px] block mb-1">Platform</label>
            <select
              value={genPlatform}
              onChange={(e) => {
                setGenPlatform(e.target.value);
                setGenType(PLATFORM_TYPES[e.target.value]?.[0]?.value || "short");
              }}
              className="w-full bg-azen-bg border border-azen-border rounded-md px-3 py-2 text-white text-xs"
            >
              <option value="instagram">Instagram</option>
              <option value="linkedin">LinkedIn</option>
              <option value="twitter">Twitter/X</option>
              <option value="youtube">YouTube</option>
            </select>
          </div>
          <div>
            <label className="text-azen-text text-[11px] block mb-1">Account</label>
            <select
              value={genAccount}
              onChange={(e) => setGenAccount(e.target.value)}
              className="w-full bg-azen-bg border border-azen-border rounded-md px-3 py-2 text-white text-xs"
            >
              <option value="business">Business (@azen_ai)</option>
              <option value="personal">Personal (@tayyib.ai)</option>
            </select>
          </div>
          <div>
            <label className="text-azen-text text-[11px] block mb-1">Content Type</label>
            <select
              value={genType}
              onChange={(e) => setGenType(e.target.value)}
              className="w-full bg-azen-bg border border-azen-border rounded-md px-3 py-2 text-white text-xs"
            >
              {(PLATFORM_TYPES[genPlatform] || []).map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          {analysis?.suggested_pillar && (
            <div className="text-azen-text text-[10px]">
              Suggested pillar: <span className="text-azen-accent">{analysis.suggested_pillar}</span>
            </div>
          )}
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full bg-azen-accent text-azen-bg px-3 py-2 rounded-md text-xs font-semibold disabled:opacity-50"
          >
            {generating ? "Generating..." : "Generate"}
          </button>
        </div>
      </Modal>
    </>
  );
}
