import { TopBar } from "@/components/layout/top-bar";
import { StatsRow } from "@/components/dashboard/stats-row";
import { EngagementSummary } from "@/components/dashboard/engagement-summary";
import { ContentQueue } from "@/components/dashboard/content-queue";
import { Button } from "@/components/ui/button";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { approveContent, regenerateContent, approveAndPostContent } from "./actions";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ account?: string }> }) {
  const supabase = await createServerSupabaseClient();
  const { account = "business" } = await searchParams;

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    pendingRes,
    postedCountRes,
    engagementRes,
  ] = await Promise.all([
    supabase
      .from("generated_content")
      .select("*")
      .eq("status", "pending")
      .eq("account", account)
      .order("created_at", { ascending: false }),
    supabase
      .from("generated_content")
      .select("*", { count: "exact", head: true })
      .eq("status", "posted")
      .eq("account", account)
      .gte("posted_at", weekAgo),
    supabase
      .from("engagement_metrics")
      .select("*, generated_content(title, platform)")
      .gte("recorded_at", weekAgo),
  ]);

  const pendingContent = pendingRes.data;
  const postedThisWeek = postedCountRes.count;
  const weeklyEngagement = engagementRes.data;

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
  const greeting = now.getHours() < 12 ? "Morning" : now.getHours() < 18 ? "Afternoon" : "Evening";
  const dateStr = now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });

  const stats = [
    { label: "Pending Approval", value: pendingContent?.length || 0, sub: "Ready to post" },
    { label: "Posted This Week", value: postedThisWeek || 0, sub: "Across all platforms" },
    { label: "Trending Topics", value: "--", sub: "Loading insights" },
    { label: "Content Pillar", value: "AI Edu.", sub: "Today's focus" },
  ];

  return (
    <div className="stagger">
      <TopBar
        eyebrow={`${dateStr} · ${account === "business" ? "@azen_ai" : "@tayyib.ai"}`}
        title={`Good ${greeting}, Tayyib.`}
        subtitle={`${pendingContent?.length || 0} posts sitting in the queue waiting on you. Three clicks and they're live.`}
        actions={
          <>
            <span className="text-[11px] font-mono text-azen-muted border border-azen-line rounded-md px-3 py-2">
              Last scraped · just now
            </span>
            <Button variant="primary" size="md">Refresh research</Button>
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
