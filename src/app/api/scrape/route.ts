import { NextResponse } from "next/server";
import { scrapeAccount } from "@/lib/apify/client";
import { analyzeResearch } from "@/lib/claude/client";
import { createClient } from "@supabase/supabase-js";

export const maxDuration = 60;

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: Request) {
  try {
    const supabase = getSupabase();
    const { accountId, platform, handle } = await request.json();

    const results = await scrapeAccount(platform, handle);

    // 1. Dedupe by URL in one query
    const urls = results.map((r) => r.url).filter(Boolean);
    const { data: existingRows } = await supabase
      .from("scraped_posts")
      .select("url")
      .in("url", urls);
    const existingUrls = new Set((existingRows || []).map((r) => r.url));
    const newResults = results.filter((r) => r.url && !existingUrls.has(r.url));

    if (newResults.length === 0) {
      return NextResponse.json({ scraped: 0, skipped: results.length });
    }

    // 2. Bulk-insert all new posts in one round-trip
    const { data: insertedPosts } = await supabase
      .from("scraped_posts")
      .insert(
        newResults.map((result) => ({
          tracked_account_id: accountId,
          platform: result.platform,
          title: result.title,
          content_summary: result.content,
          engagement_stats: result.engagement,
          url: result.url,
        }))
      )
      .select();

    if (!insertedPosts || insertedPosts.length === 0) {
      return NextResponse.json({ scraped: 0 });
    }

    // 3. Claude analysis in parallel (10 at a time vs serial). If analysis
    // fails for a post, the scrape still succeeds — analysis is best-effort.
    const analyses = await Promise.all(
      insertedPosts.map(async (post) => {
        try {
          const result = newResults.find((r) => r.url === post.url);
          if (!result) return null;
          const raw = await analyzeResearch(
            `Title: ${result.title}\nContent: ${result.content}\nPlatform: ${result.platform}\nEngagement: ${JSON.stringify(result.engagement)}`
          );
          const cleanJson = raw.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();
          try {
            const analysis = JSON.parse(cleanJson);
            return {
              scraped_post_id: post.id,
              key_insight: analysis.key_insight || null,
              content_opportunity: analysis.content_opportunity || null,
              suggested_pillar: analysis.suggested_pillar || null,
              trending_topics: analysis.trending_topics || [],
            };
          } catch {
            return { scraped_post_id: post.id, key_insight: raw.slice(0, 2000) };
          }
        } catch (e) {
          console.warn("[scrape] analysis failed for", post.url, e);
          return null;
        }
      })
    );

    const validAnalyses = analyses.filter((a): a is NonNullable<typeof a> => !!a);
    if (validAnalyses.length > 0) {
      await supabase.from("ai_analysis").insert(validAnalyses);
    }

    return NextResponse.json({ scraped: newResults.length, skipped: results.length - newResults.length });
  } catch (error) {
    console.error("Scrape error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Scrape failed" },
      { status: 500 }
    );
  }
}
