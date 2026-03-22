import { Card } from "@/components/ui/card";
import { PlatformBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

export function FeedItem({ post }: FeedItemProps) {
  const isCompetitor = post.tracked_accounts?.category === "competitor";
  const analysis = post.ai_analysis?.[0];

  return (
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
            <Button variant="primary">Generate Content From This</Button>
            <Button variant="secondary">Save for Later</Button>
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
  );
}
