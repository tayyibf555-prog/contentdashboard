import { createClient } from "@supabase/supabase-js";
import { generateReelIdeas } from "@/lib/claude/ideas";

// How many top reels to consider, and how many new ideas to generate per run.
const TOP_CANDIDATES = 15;
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
    .limit(500);

  if (sErr) throw new Error(sErr.message);
  if (!scraped || scraped.length === 0) return { generated: 0, reason: "no scraped posts" };

  // Reels only.
  const reels = scraped.filter((s) => (s.engagement_stats as Engagement)?.postType === "reel");
  if (reels.length === 0) return { generated: 0, reason: "no reels" };

  // Rank by performance and take the top candidates.
  reels.sort((a, b) => score(b.engagement_stats as Engagement) - score(a.engagement_stats as Engagement));
  const top = reels.slice(0, TOP_CANDIDATES);

  // Dedup: never produce a second idea from a reel we've already used.
  const { data: existing } = await supabase
    .from("engagement_ideas")
    .select("source_post_ids")
    .eq("account", account);
  const used = new Set<string>();
  for (const row of existing || []) {
    for (const id of (row.source_post_ids as string[]) || []) used.add(id);
  }

  const fresh = top.filter((r) => !used.has(r.id)).slice(0, MAX_NEW_PER_RUN);
  if (fresh.length === 0) return { generated: 0, reason: "no new top reels" };

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
