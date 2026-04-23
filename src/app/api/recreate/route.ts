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

    // Optionally save as a draft immediately (including child rows so the
    // post opens properly in the Instagram editor)
    let draftId: string | null = null;
    if (saveAsDraft) {
      const supabase = getSupabase();
      const contentType = plan.format === "carousel" ? "carousel" : plan.format === "reel" ? "reel" : "short";
      const { data: content } = await supabase
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
        .select()
        .single();

      if (content) {
        draftId = content.id as string;

        if (contentType === "carousel" && plan.structure.length > 0) {
          // Map Claude's flat structure into cover / content / cta slides.
          // First slot is cover (uses plan.hook split across headline + accent).
          // Last slot is CTA (uses plan.cta + plan.engagement_mechanic).
          const hookWords = plan.hook.trim().split(/\s+/);
          const splitAt = Math.ceil(hookWords.length / 2);
          const coverHeadline = hookWords.slice(0, splitAt).join(" ");
          const coverAccent = hookWords.slice(splitAt).join(" ") || plan.topic;

          const slides: Array<{
            generated_content_id: string;
            slide_number: number;
            slide_type: "cover" | "content" | "cta";
            headline: string;
            body_text: string;
            template_variant: "architect";
            accent_color: string;
          }> = [
            {
              generated_content_id: draftId,
              slide_number: 1,
              slide_type: "cover",
              headline: coverHeadline,
              body_text: coverAccent,
              template_variant: "architect",
              accent_color: "#C5F04A",
            },
          ];

          const contentBeats = plan.structure.slice(0, 6);
          contentBeats.forEach((beat, i) => {
            slides.push({
              generated_content_id: draftId!,
              slide_number: i + 2,
              slide_type: "content",
              headline: beat.slide_or_beat || `Beat ${i + 1}`,
              body_text: beat.notes || "",
              template_variant: "architect",
              accent_color: "#C5F04A",
            });
          });

          slides.push({
            generated_content_id: draftId,
            slide_number: slides.length + 1,
            slide_type: "cta",
            headline: plan.cta || "Next step",
            body_text: plan.engagement_mechanic || plan.cta,
            template_variant: "architect",
            accent_color: "#C5F04A",
          });

          await supabase.from("carousel_slides").insert(slides);
        }

        if (contentType === "reel") {
          await supabase.from("reel_scripts").insert({
            generated_content_id: draftId,
            hook: plan.hook,
            body_script: plan.structure.map((s, i) => `${i + 1}. ${s.slide_or_beat}${s.voiceover ? `\n   ${s.voiceover}` : ""}`).join("\n\n"),
            cta: `${plan.cta}\n\n${plan.engagement_mechanic}`,
            on_screen_text: plan.structure.map((s) => s.on_screen_text).filter(Boolean) as string[],
            recording_notes: [plan.recording_tips, plan.shot_list_or_slide_notes].filter(Boolean).join("\n\n"),
          });
        }
      }
    }

    return NextResponse.json({ plan, draftId });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
