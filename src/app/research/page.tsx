import { TopBar } from "@/components/layout/top-bar";
import { TrendingBar } from "@/components/research/trending-bar";
import { FeedItem } from "@/components/research/feed-item";
import { UrlInput } from "@/components/research/url-input";
import { PlatformTabs } from "@/components/research/platform-tabs";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function ResearchPage({ searchParams }: { searchParams: Promise<{ platform?: string }> }) {
  const supabase = await createServerSupabaseClient();
  const { platform } = await searchParams;
  const activePlatform = platform || "all";

  // Per-platform counts (for the tab badges) — one roundtrip, aggregate client-side
  const { data: allPostsForCounts } = await supabase
    .from("scraped_posts")
    .select("platform");
  const counts: Record<string, number> = {};
  for (const p of allPostsForCounts || []) {
    counts[p.platform] = (counts[p.platform] || 0) + 1;
  }

  // Filtered feed
  let query = supabase
    .from("scraped_posts")
    .select("*, tracked_accounts(name, category), ai_analysis(*)")
    .order("scraped_at", { ascending: false })
    .limit(50);
  if (activePlatform !== "all") {
    query = query.eq("platform", activePlatform);
  }
  const { data: posts } = await query;

  const trendingTopics = (posts || [])
    .flatMap((p) => p.ai_analysis?.flatMap((a: { trending_topics: string[] }) => a.trending_topics || []) || [])
    .filter((v: string, i: number, a: string[]) => a.indexOf(v) === i)
    .slice(0, 10);

  return (
    <div>
      <TopBar
        title="Research Feed"
        subtitle={
          activePlatform === "all"
            ? `${posts?.length || 0} scraped posts from tracked accounts`
            : `${posts?.length || 0} ${activePlatform} posts`
        }
        actions={
          <button className="bg-azen-accent text-azen-bg px-3.5 py-2 rounded-md text-xs font-semibold">
            Scrape Now
          </button>
        }
      />
      <PlatformTabs active={activePlatform} counts={counts} />
      <TrendingBar topics={trendingTopics} />
      <div className="space-y-3">
        {(posts || []).map((post) => (
          <FeedItem key={post.id} post={post} />
        ))}
        {(!posts || posts.length === 0) && (
          <p className="text-azen-text text-sm">
            {activePlatform === "all"
              ? "No research data yet. Add tracked accounts and run a scrape."
              : `No ${activePlatform} posts yet.`}
          </p>
        )}
      </div>
      <UrlInput />
    </div>
  );
}
