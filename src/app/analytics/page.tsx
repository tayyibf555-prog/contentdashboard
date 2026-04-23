import { TopBar } from "@/components/layout/top-bar";
import { Card } from "@/components/ui/card";
import { Stat } from "@/components/ui/stat";
import { PlatformBadge } from "@/components/ui/badge";
import { PlatformTabs } from "@/components/research/platform-tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { BarChart3, Trophy } from "lucide-react";

export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<{ platform?: string }> }) {
  const supabase = await createServerSupabaseClient();
  const { platform } = await searchParams;
  const activePlatform = platform || "all";

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();

  const { data: weekCountsRaw } = await supabase
    .from("engagement_metrics")
    .select("platform")
    .gte("recorded_at", weekAgo);
  const counts: Record<string, number> = {};
  for (const m of weekCountsRaw || []) counts[m.platform] = (counts[m.platform] || 0) + 1;

  let thisWeekQuery = supabase
    .from("engagement_metrics")
    .select("*, generated_content(title, platform, pillar)")
    .gte("recorded_at", weekAgo);
  if (activePlatform !== "all") thisWeekQuery = thisWeekQuery.eq("platform", activePlatform);
  const { data: thisWeek } = await thisWeekQuery;

  let lastWeekQuery = supabase
    .from("engagement_metrics")
    .select("*")
    .gte("recorded_at", twoWeeksAgo)
    .lt("recorded_at", weekAgo);
  if (activePlatform !== "all") lastWeekQuery = lastWeekQuery.eq("platform", activePlatform);
  const { data: lastWeek } = await lastWeekQuery;

  const totals = (rows: typeof thisWeek) =>
    (rows || []).reduce(
      (a, m) => ({ likes: a.likes + m.likes, comments: a.comments + m.comments, shares: a.shares + m.shares, views: a.views + m.views }),
      { likes: 0, comments: 0, shares: 0, views: 0 }
    );
  const thisTotals = totals(thisWeek);
  const lastTotals = totals(lastWeek);

  const change = (c: number, p: number) => (p === 0 ? 0 : Math.round(((c - p) / p) * 100));

  // Build a simple 7-day sparkline per metric from this week's data
  const byDay: Record<string, { likes: number; comments: number; shares: number; views: number }> = {};
  for (let i = 0; i < 7; i++) {
    const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
    byDay[d] = { likes: 0, comments: 0, shares: 0, views: 0 };
  }
  for (const m of thisWeek || []) {
    const d = (m.recorded_at as string).slice(0, 10);
    if (byDay[d]) {
      byDay[d].likes += m.likes;
      byDay[d].comments += m.comments;
      byDay[d].shares += m.shares;
      byDay[d].views += m.views;
    }
  }
  const days = Object.keys(byDay).sort();

  const metrics = [
    {
      label: "Likes",
      value: thisTotals.likes,
      delta: change(thisTotals.likes, lastTotals.likes),
      spark: days.map((d) => byDay[d].likes),
    },
    {
      label: "Comments",
      value: thisTotals.comments,
      delta: change(thisTotals.comments, lastTotals.comments),
      spark: days.map((d) => byDay[d].comments),
    },
    {
      label: "Shares",
      value: thisTotals.shares,
      delta: change(thisTotals.shares, lastTotals.shares),
      spark: days.map((d) => byDay[d].shares),
    },
    {
      label: "Views",
      value: thisTotals.views,
      delta: change(thisTotals.views, lastTotals.views),
      spark: days.map((d) => byDay[d].views),
    },
  ];

  const bestPosts = (thisWeek || [])
    .sort((a, b) => (b.likes + b.comments + b.shares) - (a.likes + a.comments + a.shares))
    .slice(0, 5);

  return (
    <div>
      <TopBar
        eyebrow="Operations"
        title="Analytics."
        subtitle={
          activePlatform === "all"
            ? "Engagement across every channel you post to — 7 days vs. the 7 before."
            : `${activePlatform} engagement — last 7 days vs. prior 7 days.`
        }
      />

      <PlatformTabs active={activePlatform} counts={counts} basePath="/analytics" />

      <div className="grid grid-cols-4 gap-4 mb-8 stagger">
        {metrics.map((m, i) => (
          <Card key={m.label} variant="surface" accent={i === 0} interactive>
            <Stat label={m.label} value={m.value} delta={m.delta} sparkline={m.spark} size={i === 0 ? "lg" : "md"} />
          </Card>
        ))}
      </div>

      <Card variant="elevated">
        <div className="flex items-center gap-2 mb-5">
          <Trophy size={16} strokeWidth={2.2} className="text-azen-accent" />
          <h3 className="text-white font-display font-semibold text-display-sm tracking-tight leading-none">
            Top performers{activePlatform !== "all" ? ` · ${activePlatform}` : ""}
          </h3>
        </div>
        {bestPosts.length === 0 ? (
          <EmptyState
            icon={<BarChart3 size={20} />}
            title="No engagement data yet"
            body={activePlatform === "all" ? "Once posts start collecting engagement, the winners land here." : `No ${activePlatform} engagement recorded this week.`}
          />
        ) : (
          <div className="divide-y divide-azen-line/60">
            {bestPosts.map((post, i) => (
              <div key={post.id} className="flex items-center gap-4 py-3.5">
                <span className="font-display font-semibold text-azen-accent text-[22px] leading-none w-8">{i + 1}</span>
                <PlatformBadge platform={post.generated_content?.platform || post.platform} />
                <div className="flex-1 min-w-0">
                  <div className="text-white text-[13px] font-medium truncate">{post.generated_content?.title || "Untitled"}</div>
                </div>
                <div className="flex gap-4 text-[11px] font-mono text-azen-text">
                  <span><span className="text-white">{post.likes.toLocaleString()}</span> likes</span>
                  <span><span className="text-white">{post.comments.toLocaleString()}</span> comments</span>
                  <span><span className="text-white">{post.shares.toLocaleString()}</span> shares</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
