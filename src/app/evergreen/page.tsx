import { TopBar } from "@/components/layout/top-bar";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { EvergreenLibrary } from "./evergreen-library";

export default async function EvergreenPage() {
  const supabase = await createServerSupabaseClient();

  const { data: evergreen } = await supabase
    .from("evergreen_content")
    .select("*, generated_content(*)")
    .order("flagged_at", { ascending: false });

  // Enrich with cooldown info
  const now = Date.now();
  const enriched = (evergreen || []).map((item) => {
    const cooldownEnd = item.last_reshared_at
      ? new Date(item.last_reshared_at).getTime() + item.cooldown_days * 24 * 60 * 60 * 1000
      : 0;
    return {
      ...item,
      eligible_for_reshare: !item.last_reshared_at || now > cooldownEnd,
      days_until_eligible: item.last_reshared_at
        ? Math.max(0, Math.ceil((cooldownEnd - now) / (24 * 60 * 60 * 1000)))
        : 0,
    };
  });

  return (
    <div>
      <TopBar
        eyebrow="Archive"
        title="Evergreen library."
        subtitle={`${enriched.length} flagged posts · ${enriched.filter((e) => e.eligible_for_reshare).length} eligible for reshare after cooldown.`}
      />
      <EvergreenLibrary items={enriched} />
    </div>
  );
}
