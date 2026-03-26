import { TopBar } from "@/components/layout/top-bar";
import { StatsRow } from "@/components/dashboard/stats-row";
import { EngagementSummary } from "@/components/dashboard/engagement-summary";
import { ContentQueue } from "@/components/dashboard/content-queue";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { approveContent, regenerateContent, approveAndPostContent } from "./actions";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ account?: string }> }) {
  const supabase = await createServerSupabaseClient();
  const { account = "business" } = await searchParams;

  const { data: pendingContent } = await supabase
    .from("generated_content")
    .select("*")
    .eq("status", "pending")
    .eq("account", account)
    .order("created_at", { ascending: false });

  const { count: postedThisWeek } = await supabase
    .from("generated_content")
    .select("*", { count: "exact", head: true })
    .eq("status", "posted")
    .eq("account", account)
    .gte("posted_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

  // Fetch engagement data for "best post" and weekly totals
  const { data: weeklyEngagement } = await supabase
    .from("engagement_metrics")
    .select("*, generated_content(title, platform)")
    .gte("recorded_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

  const engagementTotals = (weeklyEngagement || []).reduce(
    (acc, m) => ({
      likes: acc.likes + m.likes,
      comments: acc.comments + m.comments,
      shares: acc.shares + m.shares,
    }),
    { likes: 0, comments: 0, shares: 0 }
  );

  const bestPost = (weeklyEngagement || []).sort(
    (a, b) => (b.likes + b.comments + b.shares) - (a.likes + a.comments + a.shares)
  )[0];

  const now = new Date();
  const greeting = now.getHours() < 12 ? "Good Morning" : now.getHours() < 18 ? "Good Afternoon" : "Good Evening";
  const dateStr = now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });

  const stats = [
    { label: "Pending Approval", value: pendingContent?.length || 0, sub: "Ready to post", subColor: "#00d4aa" },
    { label: "Posted This Week", value: postedThisWeek || 0, sub: "Across all platforms" },
    { label: "Trending Topics", value: "--", sub: "Loading..." },
    { label: "Content Pillar", value: "AI Education", sub: "Today's focus" },
  ];

  return (
    <div>
      <TopBar
        title={`${greeting}, Tayyib`}
        subtitle={`${dateStr} · ${account === "business" ? "@azen_ai" : "@tayyib.ai"} · ${pendingContent?.length || 0} posts ready for approval`}
        actions={
          <>
            <span className="bg-azen-border text-azen-text px-3.5 py-2 rounded-md text-xs">Last scraped: --</span>
            <button className="bg-azen-accent text-azen-bg px-3.5 py-2 rounded-md text-xs font-semibold">Refresh Research</button>
          </>
        }
      />
      <StatsRow stats={stats} />
      <EngagementSummary
        data={{
          likes: { value: engagementTotals.likes, change: 0 },
          comments: { value: engagementTotals.comments, change: 0 },
          shares: { value: engagementTotals.shares, change: 0 },
          bestPost: {
            title: bestPost?.generated_content?.title || "No data yet",
            platform: bestPost?.generated_content?.platform || "",
          },
        }}
      />
      <ContentQueue
        items={pendingContent || []}
        onApprove={approveContent}
        onRegenerate={regenerateContent}
        onApproveAndPost={approveAndPostContent}
      />
    </div>
  );
}
