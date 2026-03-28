import { NextResponse } from "next/server";
import { generateContent } from "@/lib/claude/client";
import { createClient } from "@supabase/supabase-js";
import { BUSINESS_PILLARS, PERSONAL_PILLARS, POSTING_SCHEDULE } from "@/lib/constants";
import { resolveTheme } from "@/lib/carousel/theme";
import { generateSlideImage, generateBackgrounds } from "@/lib/carousel/generator";

export const maxDuration = 120;

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: Request) {
  const supabase = getSupabase();
  const { platform, account, pillar, researchContext, contentType } = await request.json();

  // Fetch voice settings
  const { data: voice } = await supabase
    .from("voice_settings")
    .select("*")
    .eq("account_type", account)
    .single();

  const schedule = POSTING_SCHEDULE[account as keyof typeof POSTING_SCHEDULE];
  const platformSchedule = schedule[platform as keyof typeof schedule] as { time: string; label: string } | undefined;

  const pillars = account === "business" ? BUSINESS_PILLARS : PERSONAL_PILLARS;
  const pillarLabel = pillars.find((p) => p.key === pillar)?.label || pillar;

  const accountHandle = account === "business" ? "@azen_ai" : "@tayyib.ai";

  const personalContext = account === "personal"
    ? `\nTarget audience: Business owners and founders who are considering AI but haven't implemented it yet.
Strategic angle: Educate with real value so they see the gap between where they are and where AI could take them. Never pitch — just teach. Cover diverse business topics (operations, marketing, sales, hiring, workflows, customer experience, strategy) — not just one tool or product.`
    : "";

  let prompt = "";

  if (contentType === "carousel") {
    prompt = `Generate an Instagram carousel post for ${accountHandle}.
Content pillar: ${pillarLabel}${personalContext}
${researchContext ? `Research context: ${researchContext}` : ""}

Carousel rules:
- Slide 1: "cover" (hook the reader). Headlines max 8 words. accent_word is the single most impactful word.
- Slides 2-7: "content" (educate/inform). Headlines max 8 words. Body text max 40 words each.
- Slide 8: "cta" (drive action). Short punchy CTA.
- Include a subtitle for the cover (short tagline, max 6 words)

Respond in JSON:
{"title":"post title","caption":"full Instagram caption (no emojis)","hashtags":["tag1","tag2"],"slides":[{"slide_type":"cover","headline":"...","accent_word":"...","subtitle":"..."},{"slide_type":"content","headline":"...","body_text":"..."},{"slide_type":"content","headline":"...","body_text":"..."},{"slide_type":"content","headline":"...","body_text":"..."},{"slide_type":"content","headline":"...","body_text":"..."},{"slide_type":"content","headline":"...","body_text":"..."},{"slide_type":"content","headline":"...","body_text":"..."},{"slide_type":"cta","headline":"...","cta_text":"..."}]}`;
  } else if (contentType === "long_form") {
    prompt = `Generate a LinkedIn long-form post for ${accountHandle}.
Content pillar: ${pillarLabel}${personalContext}
${researchContext ? `Research context: ${researchContext}` : ""}

Respond in JSON format:
{
  "title": "post title",
  "body": "full post text (no emojis, use line breaks for formatting, max 3000 chars)",
  "hook_variants": [
    { "text": "hook option 1", "score": 8.5 },
    { "text": "hook option 2", "score": 7.8 },
    { "text": "hook option 3", "score": 9.1 }
  ],
  "hashtags": ["tag1", "tag2", ...]
}`;
  } else if (contentType === "tweet" || contentType === "thread") {
    prompt = `Generate a Twitter/X ${contentType === "thread" ? "thread" : "single tweet"} for ${accountHandle}.
Content pillar: ${pillarLabel}${personalContext}
${researchContext ? `Research context: ${researchContext}` : ""}

Respond in JSON format:
{
  "title": "topic title",
  "body": "${contentType === "thread" ? "first tweet of the thread" : "the tweet text (max 280 chars)"}",
  ${contentType === "thread" ? '"thread_tweets": ["tweet 2", "tweet 3", ...],' : ""}
  "hashtags": ["tag1", "tag2", ...]
}`;
  } else if (contentType === "video_script") {
    prompt = `Generate a YouTube video script for @tayyib.ai.
Content pillar: ${pillarLabel}${personalContext}
${researchContext ? `Research context: ${researchContext}` : ""}
The script should naturally include a CTA to azen.io for lead generation — woven into the content, not a hard sell.

Respond in JSON format:
{
  "title": "video title",
  "title_variants": [
    { "title": "option 1", "ctr_score": 8.7 },
    { "title": "option 2", "ctr_score": 7.9 },
    { "title": "option 3", "ctr_score": 8.2 }
  ],
  "hook": "first 30 seconds script",
  "intro": "30s-1:30 intro script",
  "body_sections": [
    { "title": "Section 1", "content": "...", "start_time": "1:30", "end_time": "4:00" }
  ],
  "cta": "closing CTA script mentioning azen.io",
  "description": "YouTube description with timestamps and azen.io link",
  "tags": ["tag1", "tag2", ...],
  "thumbnail_concepts": [
    { "label": "A", "description": "description of thumbnail concept" }
  ],
  "estimated_duration": "12 min"
}`;
  } else {
    prompt = `Generate a short social media post for ${accountHandle} on ${platform}.
Content pillar: ${pillarLabel}${personalContext}
${researchContext ? `Research context: ${researchContext}` : ""}

Respond in JSON format:
{
  "title": "post title",
  "body": "post text (no emojis, clean formatting)",
  "hashtags": ["tag1", "tag2", ...]
}`;
  }

  const raw = await generateContent(prompt, voice || undefined, account as "business" | "personal");

  let parsed;
  try {
    // Extract JSON from Claude's response (may include markdown code blocks)
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Failed to parse Claude response", raw }, { status: 500 });
  }

  // Store generated content
  const { data: content } = await supabase
    .from("generated_content")
    .insert({
      platform,
      account,
      content_type: contentType,
      title: parsed.title,
      body: parsed.body || parsed.caption || "",
      hashtags: parsed.hashtags || [],
      pillar,
      source_type: researchContext ? "research" : "original",
      source_reference: researchContext || null,
      best_time: platformSchedule?.label || null,
      status: "pending",
    })
    .select()
    .single();

  if (!content) {
    return NextResponse.json({ error: "Failed to store content" }, { status: 500 });
  }

  // Store carousel slides if applicable
  if (contentType === "carousel" && parsed.slides) {
    const theme = resolveTheme(account as "business" | "personal", pillar);
    const totalSlides = parsed.slides.length;

    const slides = parsed.slides.map((slide: Record<string, string>, i: number) => ({
      generated_content_id: content.id,
      slide_number: i + 1,
      headline: slide.headline,
      body_text: slide.body_text || slide.accent_word || slide.cta_text || "",
      slide_type: slide.slide_type,
      template_variant: theme.variant,
      accent_color: theme.accentColor,
    }));
    const { data: insertedSlides } = await supabase.from("carousel_slides").insert(slides).select();

    // Pre-generate all AI backgrounds sequentially (avoids Gemini rate limits)
    if (insertedSlides) {
      const slideTypes = insertedSlides.map((s: Record<string, string | number>) => s.slide_type as "cover" | "content" | "cta");
      const backgrounds = await generateBackgrounds(theme.variant, slideTypes, theme.accentColor);

      // Now render each slide with its pre-generated background
      for (const slide of insertedSlides as Record<string, string | number>[]) {
        try {
          const idx = (slide.slide_number as number) - 1;
          const imageBuffer = await generateSlideImage(
            slide.slide_type as "cover" | "content" | "cta",
            {
              headline: slide.headline,
              bodyText: slide.body_text,
              accentWord: slide.body_text,
              ctaText: slide.body_text,
              subtitle: parsed.slides[idx]?.subtitle,
              account,
              slideNumber: slide.slide_number,
              totalSlides,
            },
            { account: account as "business" | "personal", pillar, variant: theme.variant, backgroundImage: backgrounds.get(idx) }
          );
          const fileName = `carousel/${slide.id}-${Date.now()}.png`;
          await supabase.storage.from("carousel-images").upload(fileName, imageBuffer, { contentType: "image/png" });
          const { data: { publicUrl } } = supabase.storage.from("carousel-images").getPublicUrl(fileName);
          await supabase.from("carousel_slides").update({ image_url: publicUrl }).eq("id", slide.id);
        } catch (imgErr) {
          console.error(`Image generation failed for slide ${slide.slide_number}:`, imgErr);
        }
      }
    }
  }

  // Store YouTube script if applicable
  if (contentType === "video_script") {
    await supabase.from("youtube_scripts").insert({
      generated_content_id: content.id,
      hook: parsed.hook,
      intro: parsed.intro,
      body_sections: parsed.body_sections || [],
      cta: parsed.cta,
      thumbnail_concepts: parsed.thumbnail_concepts || [],
      title_variants: parsed.title_variants || [],
      description: parsed.description,
      tags: parsed.tags || [],
      estimated_duration: parsed.estimated_duration,
    });
  }

  return NextResponse.json({ content, parsed });
}
