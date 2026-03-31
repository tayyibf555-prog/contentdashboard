import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { scrapeAccount } from "@/lib/apify/client";
import { analyzeResearch } from "@/lib/claude/client";

export const maxDuration = 60;

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabase();
  const { data: accounts } = await supabase.from("tracked_accounts").select("*");
  let scrapedCount = 0;

  if (accounts) {
    for (const account of accounts) {
      const handles = account.handles as Record<string, string>;
      for (const platform of account.platforms as string[]) {
        const handle = handles[platform];
        if (!handle) continue;

        try {
          const results = await scrapeAccount(platform, handle);
          for (const result of results) {
            const { data: existing } = await supabase
              .from("scraped_posts")
              .select("id")
              .eq("url", result.url)
              .single();

            if (existing) continue;

            const { data: post } = await supabase
              .from("scraped_posts")
              .insert({
                tracked_account_id: account.id,
                platform: result.platform,
                title: result.title,
                content_summary: result.content,
                engagement_stats: result.engagement,
                url: result.url,
              })
              .select()
              .single();

            if (post) {
              try {
                const analysisRaw = await analyzeResearch(
                  `Title: ${result.title}\nContent: ${result.content}\nPlatform: ${result.platform}`
                );
                const analysis = JSON.parse(analysisRaw);
                await supabase.from("ai_analysis").insert({
                  scraped_post_id: post.id,
                  key_insight: analysis.key_insight,
                  content_opportunity: analysis.content_opportunity,
                  suggested_pillar: analysis.suggested_pillar,
                  trending_topics: analysis.trending_topics || [],
                });
              } catch {}
            }
            scrapedCount++;
          }
        } catch (err) {
          console.error(`Scraping failed for ${account.name} on ${platform}:`, err);
        }
      }
    }
  }

  return NextResponse.json({ scraped: scrapedCount, accounts: accounts?.length || 0 });
}
