import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const maxDuration = 15;

function getSupabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

type ScrapedRow = {
  id: string;
  platform: string;
  title: string | null;
  content_summary: string | null;
  engagement_stats: Record<string, number | string> | null;
  url: string | null;
  scraped_at: string;
};

function num(v: number | string | undefined): number {
  return typeof v === "number" ? v : 0;
}

function score(e: Record<string, number | string> | null): number {
  if (!e) return 0;
  return num(e.likes) + num(e.comments) * 5 + num(e.shares) * 10 + num(e.saves) * 15 + num(e.views) * 0.1;
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("scraped_posts")
    .select("id, platform, title, content_summary, engagement_stats, url, scraped_at")
    .eq("tracked_account_id", id)
    .order("scraped_at", { ascending: false })
    .limit(200);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const byPlatform: Record<string, ScrapedRow[]> = {};
  for (const row of (data || []) as ScrapedRow[]) {
    if (!byPlatform[row.platform]) byPlatform[row.platform] = [];
    byPlatform[row.platform].push(row);
  }

  // Keep top 3 per platform by engagement score
  const top: Record<string, ScrapedRow[]> = {};
  for (const [platform, rows] of Object.entries(byPlatform)) {
    top[platform] = rows
      .sort((a, b) => score(b.engagement_stats) - score(a.engagement_stats))
      .slice(0, 3);
  }

  return NextResponse.json({ top });
}
