import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateEngagementIdeas } from "@/lib/claude/ideas";

export const maxDuration = 60;

function getSupabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

// POST /api/ideas — run analysis over recent scraped IG posts, persist ideas
export async function POST(request: Request) {
  try {
    const { account } = (await request.json()) as { account: "business" | "personal" };
    if (account !== "business" && account !== "personal") {
      return NextResponse.json({ error: "account must be 'business' or 'personal'" }, { status: 400 });
    }

    const supabase = getSupabase();

    // Pull the 30 most recent scraped IG posts (both reels and carousels — caption-only works for both)
    const { data: scraped, error: sErr } = await supabase
      .from("scraped_posts")
      .select("id, title, content_summary, engagement_stats, url, platform")
      .eq("platform", "instagram")
      .order("scraped_at", { ascending: false })
      .limit(30);

    if (sErr) return NextResponse.json({ error: sErr.message }, { status: 500 });
    if (!scraped || scraped.length === 0) {
      return NextResponse.json({ error: "No scraped Instagram posts to analyze. Run scrape first." }, { status: 400 });
    }

    const ideas = await generateEngagementIdeas(
      account,
      scraped.map((s) => ({
        id: s.id,
        title: s.title || "",
        content: s.content_summary || "",
        engagement: (s.engagement_stats as Record<string, number>) || {},
        url: s.url || "",
      }))
    );

    if (ideas.length === 0) return NextResponse.json({ ideas: [] });

    const { data: inserted, error: iErr } = await supabase
      .from("engagement_ideas")
      .insert(ideas.map((i) => ({ ...i, account, status: "new" })))
      .select();

    if (iErr) return NextResponse.json({ error: iErr.message }, { status: 500 });

    return NextResponse.json({ ideas: inserted });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PATCH /api/ideas — update status (used/dismissed)
export async function PATCH(request: Request) {
  try {
    const { id, status } = (await request.json()) as { id: string; status: "new" | "used" | "dismissed" };
    const supabase = getSupabase();
    const { error } = await supabase.from("engagement_ideas").update({ status }).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
