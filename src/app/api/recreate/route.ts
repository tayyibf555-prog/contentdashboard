import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateRecreationPlan } from "@/lib/claude/ideas";
import { scrapeAccount } from "@/lib/apify/client";

export const maxDuration = 60;

function getSupabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

function extractHandleFromUrl(url: string): string | null {
  // Handles /reel/, /p/, /tv/ URLs by finding the username in the path.
  // For many IG URLs there's no username in the URL itself (shortlink /p/{id}/).
  // In those cases we fall back to caption-only analysis.
  const m = url.match(/instagram\.com\/([^/?#]+)\/(?:reel|p|tv)\//);
  return m ? m[1] : null;
}

// POST /api/recreate — accepts { url?, description?, account, forceFormat? }
export async function POST(request: Request) {
  try {
    const { url, description, account, saveAsDraft, forceFormat } = (await request.json()) as {
      url?: string;
      description?: string;
      account: "business" | "personal";
      saveAsDraft?: boolean;
      forceFormat?: "carousel" | "reel" | "post";
    };

    if (!url && !description) {
      return NextResponse.json({ error: "Provide either a url or a description" }, { status: 400 });
    }

    let caption = "";
    let engagement: Record<string, number | string> = {};
    let detectedFormat: "carousel" | "reel" | "post" | undefined = forceFormat;

    // If URL provided and it's Instagram, try to scrape for caption + engagement.
    if (url && url.includes("instagram.com")) {
      const handle = extractHandleFromUrl(url);
      if (handle) {
        try {
          const results = await scrapeAccount("instagram", handle);
          const match = results.find((r) => r.url === url || url.includes(r.url.split("/").slice(-2).join("/")));
          const pick = match || results[0];
          if (pick) {
            caption = pick.content;
            engagement = pick.engagement;
            // If caller didn't force a format, inherit from the source post
            if (!detectedFormat && typeof pick.engagement.postType === "string") {
              const t = pick.engagement.postType as string;
              if (t === "carousel" || t === "reel") detectedFormat = t;
            }
          }
        } catch (e) {
          console.warn("[recreate] scrape failed, continuing with url-only:", e);
        }
      }
    }

    const plan = await generateRecreationPlan(account, {
      url,
      caption,
      engagement,
      description,
      forceFormat: detectedFormat,
    });

    // Optionally save as a draft immediately
    let draftId: string | null = null;
    if (saveAsDraft) {
      const supabase = getSupabase();
      const contentType = plan.format === "carousel" ? "carousel" : plan.format === "reel" ? "reel" : "short";
      const { data } = await supabase
        .from("generated_content")
        .insert({
          platform: "instagram",
          account,
          content_type: contentType,
          title: plan.topic,
          body: `${plan.hook}\n\n${plan.structure.map((s, i) => `${i + 1}. ${s.slide_or_beat}`).join("\n")}\n\n${plan.cta}`,
          pillar: "curated",
          source_type: url ? "recreate_url" : "recreate_description",
          source_reference: url || description || null,
          status: "draft",
        })
        .select("id")
        .single();
      if (data) draftId = data.id as string;
    }

    return NextResponse.json({ plan, draftId });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
