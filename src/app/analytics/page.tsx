import { TopBar } from "@/components/layout/top-bar";
import { Card } from "@/components/ui/card";
import { PlatformBadge } from "@/components/ui/badge";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function AnalyticsPage() {
  const supabase = await createServerSupabaseClient();

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();

  const { data: thisWeek } = await supabase
    .from("engagement_metrics")
    .select("*, generated_content(title, platform, pillar)")
    .gte("recorded_at", weekAgo);

  const { data: lastWeek } = await supabase
    .from("engagement_metrics")
    .select("*")
    .gte("recorded_at", twoWeeksAgo)
    .lt("recorded_at", weekAgo);

  const thisWeekTotals = (thisWeek || []).reduce(
    (acc, m) => ({
      likes: acc.likes + m.likes,
      comments: acc.comments + m.comments,
      shares: acc.shares + m.shares,
      views: acc.views + m.views,
    }),
    { likes: 0, comments: 0, shares: 0, views: 0 }
  );

  const lastWeekTotals = (lastWeek || []).reduce(
    (acc, m) => ({
      likes: acc.likes + m.likes,
      comments: acc.comments + m.comments,
      shares: acc.shares + m.shares,
      views: acc.views + m.views,
    }),
    { likes: 0, comments: 0, shares: 0, views: 0 }
  );

  function change(curr: number, prev: number) {
    if (prev === 0) return 0;
    return Math.round(((curr - prev) / prev) * 100);
  }

  const metrics = [
    { label: "Likes", value: thisWeekTotals.likes, change: change(thisWeekTotals.likes, lastWeekTotals.likes) },
    { label: "Comments", value: thisWeekTotals.comments, change: change(thisWeekTotals.comments, lastWeekTotals.comments) },
    { label: "Shares", value: thisWeekTotals.shares, change: change(thisWeekTotals.shares, lastWeekTotals.shares) },
    { label: "Views", value: thisWeekTotals.views, change: change(thisWeekTotals.views, lastWeekTotals.views) },
  ];

  // Best performing posts
  const bestPosts = (thisWeek || [])
    .sort((a, b) => (b.likes + b.comments + b.shares) - (a.likes + a.comments + a.shares))
    .slice(0, 5);

  return (
    <div>
      <TopBar title="Analytics" subtitle="Engagement metrics across all platforms" />

      {/* Metrics Cards */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {metrics.map((m) => (
          <Card key={m.label}>
            <div className="text-azen-text text-[11px] uppercase tracking-wider">{m.label}</div>
            <div className="text-white text-[28px] font-bold mt-1.5">{m.value.toLocaleString()}</div>
            <div className={`text-xs mt-1 ${m.change >= 0 ? "text-azen-accent" : "text-red-400"}`}>
              {m.change >= 0 ? "+" : ""}{m.change}% vs last week
            </div>
          </Card>
        ))}
      </div>

      {/* Best Posts */}
      <Card>
        <h3 className="text-white text-sm font-semibold mb-3">Top Performing Posts</h3>
        {bestPosts.length === 0 ? (
          <p className="text-azen-text text-xs">No engagement data yet.</p>
        ) : (
          <div className="space-y-2">
            {bestPosts.map((post) => (
              <div key={post.id} className="flex items-center gap-3 bg-azen-bg rounded-md p-2">
                <PlatformBadge platform={post.generated_content?.platform || post.platform} />
                <div className="flex-1">
                  <div className="text-white text-xs font-medium">{post.generated_content?.title || "Untitled"}</div>
                </div>
                <div className="flex gap-3 text-[10px] text-azen-text">
                  <span>{post.likes} likes</span>
                  <span>{post.comments} comments</span>
                  <span>{post.shares} shares</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
