import { TopBar } from "@/components/layout/top-bar";
import { PlatformTabs } from "@/components/research/platform-tabs";
import { StrategyClient } from "./strategy-client";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Strategy } from "@/types";

export default async function StrategyPage({
  searchParams,
}: {
  searchParams: Promise<{ platform?: string; account?: string }>;
}) {
  const supabase = await createServerSupabaseClient();
  const { platform, account } = await searchParams;
  const activePlatform = platform && ["instagram", "linkedin", "twitter", "youtube"].includes(platform) ? platform : "instagram";
  const activeAccount = (account === "business" ? "business" : "personal") as "personal" | "business";

  // Per-platform counts for the tab badges (only active rows)
  const { data: allActive } = await supabase
    .from("strategies")
    .select("platform")
    .eq("is_active", true);
  const counts: Record<string, number> = {};
  for (const r of allActive || []) counts[r.platform] = (counts[r.platform] || 0) + 1;

  // Active platform's strategies (both account + the platform-level 'both')
  const { data: strategies } = await supabase
    .from("strategies")
    .select("*")
    .eq("is_active", true)
    .eq("platform", activePlatform)
    .order("created_at", { ascending: false });

  return (
    <div>
      <TopBar
        eyebrow="Library"
        title="Strategy."
        subtitle="Playbooks proven in the AI creator space — filtered by platform and the voice you're posting as."
      />
      <PlatformTabs active={activePlatform} counts={counts} basePath="/strategy" />
      <StrategyClient
        strategies={(strategies || []) as Strategy[]}
        activePlatform={activePlatform as "instagram" | "linkedin" | "twitter" | "youtube"}
        activeAccount={activeAccount}
      />
    </div>
  );
}
