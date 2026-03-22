import { TopBar } from "@/components/layout/top-bar";
import { TrendingBar } from "@/components/research/trending-bar";
import { FeedItem } from "@/components/research/feed-item";
import { UrlInput } from "@/components/research/url-input";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function ResearchPage() {
  const supabase = await createServerSupabaseClient();

  const { data: posts } = await supabase
    .from("scraped_posts")
    .select("*, tracked_accounts(name, category), ai_analysis(*)")
    .order("scraped_at", { ascending: false })
    .limit(50);

  // Extract trending topics from recent analyses
  const trendingTopics = (posts || [])
    .flatMap((p) => p.ai_analysis?.flatMap((a: { trending_topics: string[] }) => a.trending_topics || []) || [])
    .filter((v: string, i: number, a: string[]) => a.indexOf(v) === i)
    .slice(0, 10);

  return (
    <div>
      <TopBar
        title="Research Feed"
        subtitle={`${posts?.length || 0} scraped posts from tracked accounts`}
        actions={
          <button className="bg-azen-accent text-azen-bg px-3.5 py-2 rounded-md text-xs font-semibold">
            Scrape Now
          </button>
        }
      />
      <TrendingBar topics={trendingTopics} />
      <div className="space-y-3">
        {(posts || []).map((post) => (
          <FeedItem key={post.id} post={post} />
        ))}
        {(!posts || posts.length === 0) && (
          <p className="text-azen-text text-sm">No research data yet. Add tracked accounts and run a scrape.</p>
        )}
      </div>
      <UrlInput />
    </div>
  );
}
