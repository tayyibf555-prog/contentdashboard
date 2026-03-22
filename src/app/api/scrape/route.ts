import { NextResponse } from "next/server";
import { scrapeAccount } from "@/lib/apify/client";
import { analyzeResearch } from "@/lib/claude/client";
import { createClient } from "@supabase/supabase-js";

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

    for (const result of results) {
      // Check for duplicates by URL
      const { data: existing } = await supabase
        .from("scraped_posts")
        .select("id")
        .eq("url", result.url)
        .single();

      if (existing) continue;

      // Insert scraped post
      const { data: post } = await supabase
        .from("scraped_posts")
        .insert({
          tracked_account_id: accountId,
          platform: result.platform,
          title: result.title,
          content_summary: result.content,
          engagement_stats: result.engagement,
          url: result.url,
        })
        .select()
        .single();

      if (!post) continue;

      // Analyze with Claude
      const analysisRaw = await analyzeResearch(
        `Title: ${result.title}\nContent: ${result.content}\nPlatform: ${result.platform}\nEngagement: ${JSON.stringify(result.engagement)}`
      );

      try {
        // Strip markdown code block markers if present
        const cleanJson = analysisRaw.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();
        const analysis = JSON.parse(cleanJson);
        await supabase.from("ai_analysis").insert({
          scraped_post_id: post.id,
          key_insight: analysis.key_insight,
          content_opportunity: analysis.content_opportunity,
          suggested_pillar: analysis.suggested_pillar,
          trending_topics: analysis.trending_topics || [],
        });
      } catch {
        // If Claude response isn't valid JSON, store raw text as insight
        await supabase.from("ai_analysis").insert({
          scraped_post_id: post.id,
          key_insight: analysisRaw,
        });
      }
    }

    return NextResponse.json({ scraped: results.length });
  } catch (error) {
    console.error("Scrape error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Scrape failed" },
      { status: 500 }
    );
  }
}
