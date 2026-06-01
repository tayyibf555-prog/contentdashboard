import { createClient } from "@supabase/supabase-js";
import { generateReelIdeas, generateVideoIdeas } from "@/lib/claude/ideas";

// How many new ideas to generate per run (each refresh surfaces the next best).
const MAX_NEW_PER_RUN = 8;

function getSupabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

type Engagement = Record<string, number | string>;

// Rank signal: raw views, falling back to likes + comments.
function score(e: Engagement): number {
  const views = Number(e?.views) || 0;
  if (views > 0) return views;
  return (Number(e?.likes) || 0) + (Number(e?.comments) || 0);
}

function fmtNum(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}

// Human-readable proof the reel performed, e.g. "1.4M views · 22K likes".
function formatMetric(e: Engagement): string | null {
  const parts: string[] = [];
  const views = Number(e?.views) || 0;
  const likes = Number(e?.likes) || 0;
  const comments = Number(e?.comments) || 0;
  if (views) parts.push(`${fmtNum(views)} views`);
  if (likes) parts.push(`${fmtNum(likes)} likes`);
  if (comments) parts.push(`${fmtNum(comments)} comments`);
  return parts.length ? parts.join(" · ") : null;
}

/**
 * Select the top-performing competitor Instagram reels, skip any that already
 * produced an idea, and generate + persist fresh ideas. Safe to call after a
 * scrape — returns a summary and never throws on "nothing to do".
 */
export async function generateAndStoreIdeas(account: "business" | "personal") {
  const supabase = getSupabase();

  const { data: scraped, error: sErr } = await supabase
    .from("scraped_posts")
    .select("id, title, content_summary, engagement_stats, url")
    .eq("platform", "instagram")
    .order("scraped_at", { ascending: false })
    .limit(2000);

  if (sErr) throw new Error(sErr.message);
  if (!scraped || scraped.length === 0) return { generated: 0, reason: "no scraped posts" };

  // Reels only.
  const reels = scraped.filter((s) => (s.engagement_stats as Engagement)?.postType === "reel");
  if (reels.length === 0) return { generated: 0, reason: "no reels" };

  // Rank all reels by performance (best first).
  reels.sort((a, b) => score(b.engagement_stats as Engagement) - score(a.engagement_stats as Engagement));

  // Dedup: never produce a second idea from a reel we've already used.
  const { data: existing } = await supabase
    .from("engagement_ideas")
    .select("source_post_ids")
    .eq("account", account);
  const used = new Set<string>();
  for (const row of existing || []) {
    for (const id of (row.source_post_ids as string[]) || []) used.add(id);
  }

  // Walk down the ranked list, skipping already-used reels, so each refresh
  // surfaces the NEXT best performers instead of stopping at a fixed top-N.
  const fresh = reels.filter((r) => !used.has(r.id)).slice(0, MAX_NEW_PER_RUN);
  if (fresh.length === 0) return { generated: 0, reason: "no new reels" };

  const ideas = await generateReelIdeas(
    account,
    fresh.map((r) => ({
      id: r.id,
      title: r.title || "",
      content: r.content_summary || "",
      engagement: (r.engagement_stats as Record<string, number>) || {},
      url: r.url || "",
    }))
  );
  if (ideas.length === 0) return { generated: 0, reason: "model returned no ideas" };

  // Attach the source link + performance proof from the scraped row (accurate,
  // rather than trusting the model to echo them).
  const byId = new Map(fresh.map((r) => [r.id, r]));
  const rows = ideas
    .map((i) => {
      const src = byId.get(i.source_post_id);
      if (!src) return null;
      return {
        account,
        source_post_ids: [src.id],
        topic: i.topic,
        idea: i.idea,
        framings: i.framings,
        source_url: src.url || null,
        source_metric: formatMetric((src.engagement_stats as Engagement) || {}),
        status: "new" as const,
      };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);

  if (rows.length === 0) return { generated: 0, reason: "no rows to insert" };

  const { data: inserted, error: iErr } = await supabase.from("engagement_ideas").insert(rows).select();
  if (iErr) throw new Error(iErr.message);

  return { generated: inserted?.length || 0 };
}

/**
 * Select the top-performing competitor YouTube long-form videos, skip any that
 * already produced an idea, and generate + persist fresh video ideas. Safe to
 * call after a scrape — returns a summary and never throws on "nothing to do".
 */
export async function generateAndStoreVideoIdeas(account: "business" | "personal") {
  const supabase = getSupabase();

  const { data: scraped, error: sErr } = await supabase
    .from("scraped_posts")
    .select("id, title, content_summary, engagement_stats, url")
    .eq("platform", "youtube")
    .order("scraped_at", { ascending: false })
    .limit(2000);

  if (sErr) throw new Error(sErr.message);
  if (!scraped || scraped.length === 0) return { generated: 0, reason: "no scraped videos" };

  // Long-form only: keep videos over 60s, or where duration is unknown (0).
  const longForm = scraped.filter((s) => {
    const secs = Number((s.engagement_stats as Engagement)?.durationSeconds) || 0;
    return secs === 0 || secs > 60;
  });
  if (longForm.length === 0) return { generated: 0, reason: "no long-form videos" };

  // Rank all videos by performance (best first).
  longForm.sort((a, b) => score(b.engagement_stats as Engagement) - score(a.engagement_stats as Engagement));

  // Dedup: never produce a second idea from a video we've already used.
  const { data: existing } = await supabase
    .from("video_ideas")
    .select("source_post_ids")
    .eq("account", account);
  const used = new Set<string>();
  for (const row of existing || []) {
    for (const id of (row.source_post_ids as string[]) || []) used.add(id);
  }

  // Walk down the ranked list, skipping already-used videos, so each refresh
  // surfaces the NEXT best performers instead of stopping at a fixed top-N.
  const fresh = longForm.filter((r) => !used.has(r.id)).slice(0, MAX_NEW_PER_RUN);
  if (fresh.length === 0) return { generated: 0, reason: "no new videos" };

  const ideas = await generateVideoIdeas(
    account,
    fresh.map((r) => ({
      id: r.id,
      title: r.title || "",
      content: r.content_summary || "",
      engagement: (r.engagement_stats as Record<string, number>) || {},
      url: r.url || "",
    }))
  );
  if (ideas.length === 0) return { generated: 0, reason: "model returned no ideas" };

  const byId = new Map(fresh.map((r) => [r.id, r]));
  const rows = ideas
    .map((i) => {
      const src = byId.get(i.source_post_id);
      if (!src) return null;
      return {
        account,
        source_post_ids: [src.id],
        video_title: i.video_title,
        overview: i.overview,
        how_to_recreate: i.how_to_recreate,
        niche: i.niche || null,
        source_url: src.url || null,
        source_metric: formatMetric((src.engagement_stats as Engagement) || {}),
        status: "new" as const,
      };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);

  if (rows.length === 0) return { generated: 0, reason: "no rows to insert" };

  const { data: inserted, error: iErr } = await supabase.from("video_ideas").insert(rows).select();
  if (iErr) throw new Error(iErr.message);

  return { generated: inserted?.length || 0 };
}
