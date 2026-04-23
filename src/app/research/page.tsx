import { TopBar } from "@/components/layout/top-bar";
import { TrendingBar } from "@/components/research/trending-bar";
import { FeedItem } from "@/components/research/feed-item";
import { UrlInput } from "@/components/research/url-input";
import { PlatformTabs } from "@/components/research/platform-tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { Radar } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function ResearchPage({ searchParams }: { searchParams: Promise<{ platform?: string }> }) {
  const supabase = await createServerSupabaseClient();
  const { platform } = await searchParams;
  const activePlatform = platform || "all";

  const { data: allPostsForCounts } = await supabase
    .from("scraped_posts")
    .select("platform");
  const counts: Record<string, number> = {};
  for (const p of allPostsForCounts || []) {
    counts[p.platform] = (counts[p.platform] || 0) + 1;
  }

  let query = supabase
    .from("scraped_posts")
    .select("*, tracked_accounts(name, category), ai_analysis(*)")
    .order("scraped_at", { ascending: false })
    .limit(50);
  if (activePlatform !== "all") query = query.eq("platform", activePlatform);
  const { data: posts } = await query;

  const trendingTopics = (posts || [])
    .flatMap((p) => p.ai_analysis?.flatMap((a: { trending_topics: string[] }) => a.trending_topics || []) || [])
    .filter((v: string, i: number, a: string[]) => a.indexOf(v) === i)
    .slice(0, 10);

  return (
    <div>
      <TopBar
        eyebrow="Intel"
        title="Research feed."
        subtitle={
          activePlatform === "all"
            ? `${posts?.length || 0} posts scraped from the accounts you track — sorted by freshness.`
            : `${posts?.length || 0} ${activePlatform} posts from your tracked accounts.`
        }
      />

      <PlatformTabs active={activePlatform} counts={counts} />

      {trendingTopics.length > 0 && (
        <div className="mb-6">
          <TrendingBar topics={trendingTopics} />
        </div>
      )}

      {(!posts || posts.length === 0) ? (
        <EmptyState
          icon={<Radar size={22} />}
          title={activePlatform === "all" ? "No research data yet" : `No ${activePlatform} posts yet`}
          body="Add tracked accounts and hit 'Scrape all' to pull their latest posts."
        />
      ) : (
        <div className="stagger grid grid-cols-1 lg:grid-cols-2 gap-4">
          {posts.map((post) => (
            <FeedItem key={post.id} post={post} />
          ))}
        </div>
      )}
      <UrlInput />
    </div>
  );
}
