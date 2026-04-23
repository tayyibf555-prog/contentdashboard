import { NextResponse } from "next/server";
import { generateContent } from "@/lib/claude/client";
import { createClient } from "@supabase/supabase-js";
import { BUSINESS_PILLARS, PERSONAL_PILLARS, POSTING_SCHEDULE } from "@/lib/constants";
import { resolveTheme } from "@/lib/carousel/theme";

export const maxDuration = 60;

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: Request) {
  const supabase = getSupabase();
  const { platform, account, pillar, researchContext, contentType, useWinners, strategyId } = await request.json();

  // If a strategyId is provided, fetch and inject it as the primary playbook
  let strategyContext = "";
  if (strategyId) {
    const { data: strat } = await supabase
      .from("strategies")
      .select("title, summary, when_to_use, how_to_apply, example, why_it_works, category")
      .eq("id", strategyId)
      .single();
    if (strat) {
      strategyContext = `\n\nPRIMARY STRATEGY PLAYBOOK — FOLLOW THIS EXACTLY:
Title: ${strat.title}
Category: ${strat.category}
Summary: ${strat.summary}
When to use: ${strat.when_to_use}
How to apply:
${(strat.how_to_apply as string[]).map((s, i) => `  ${i + 1}. ${s}`).join("\n")}
${strat.example ? `Example: ${strat.example}` : ""}
Why it works: ${strat.why_it_works}

IMPORTANT: The generated content MUST follow this strategy's hook pattern, format, and engagement mechanic. Do not deviate.`;
    }
  }

  // If useWinners is set, build a research context from the top-engagement
  // scraped posts for this platform. Weights comments/shares/saves higher than
  // raw likes because those correlate with the engagement mechanics we care about.
  let seedContext = "";
  if (useWinners) {
    const { data: scraped } = await supabase
      .from("scraped_posts")
      .select("title, content_summary, engagement_stats, url")
      .eq("platform", platform)
      .order("scraped_at", { ascending: false })
      .limit(40);
    const scored = (scraped || [])
      .map((s) => {
        const e = (s.engagement_stats as Record<string, number>) || {};
        const score = (e.likes || 0) + (e.comments || 0) * 5 + (e.shares || 0) * 10 + (e.saves || 0) * 15 + (e.views || 0) * 0.1;
        return { ...s, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
    if (scored.length > 0) {
      seedContext = `\n\nTOP-PERFORMING POSTS FROM TRACKED ACCOUNTS (use as inspiration for hook patterns + engagement mechanics, do NOT copy directly):\n${
        scored
          .map((s, i) => `${i + 1}. "${s.title}" — ${JSON.stringify(s.engagement_stats)}\n   ${s.content_summary?.slice(0, 400) || ""}`)
          .join("\n\n")
      }`;
    }
  }

  // Merge user-supplied research context + winners seed + strategy playbook
  const mergedResearchContext = [researchContext, seedContext, strategyContext].filter(Boolean).join("");

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

  let audienceContext = "";
  if (account === "business") {
    audienceContext = `\nTarget audience: Business owners, CEOs, and decision-makers who know AI matters but haven't implemented it yet.
Strategic angle: Every post should position Azen AI as the trusted authority on AI implementation. Show the real business outcomes AI delivers — revenue, efficiency, competitive advantage. Make the reader think "I need this for my business." End with a natural CTA: book a free AI audit at azen.io, DM us, or visit azen.io. The Azen methodology is Audit, Educate, Deploy — reference it when relevant.
Content must NOT be generic AI news or tool reviews. Focus on: how AI solves specific business problems, client transformation stories, ROI frameworks, implementation insights, and why most businesses are falling behind by not acting now.`;
  } else {
    audienceContext = `\nTarget audience: Business owners and founders who are considering AI but haven't implemented it yet.
Strategic angle: Educate with real value so they see the gap between where they are and where AI could take them. Never pitch — just teach. Cover diverse business topics (operations, marketing, sales, hiring, workflows, customer experience, strategy) — not just one tool or product.`;
  }

  let prompt = "";

  if (contentType === "carousel") {
    const ctaRule = account === "personal"
      ? `- Slide 8: "cta" — MUST be a comment-keyword engagement CTA. Pick ONE uppercase keyword closely tied to the post topic (e.g. "AI", "PLAYBOOK", "GUIDE", "STACK", "SYSTEM", "SCALE", "FOUNDER"). The cta_text MUST follow this pattern: "Comment '[KEYWORD]' and I'll DM you the [guide / step-by-step plan / playbook / breakdown]". Max 12 words. No URLs. Every single personal carousel MUST end this way — no exceptions.`
      : `- Slide 8: "cta" (drive action). The cta_text must be a short direct sentence, max 8 words, that tells the reader exactly what to do next. Examples: "Book your free AI audit today", "DM us to start saving time", "Visit azen.io for a free strategy call". It must relate to the post topic — not generic. No URLs in the text.`;

    prompt = `Generate an Instagram carousel post for ${accountHandle}.
Content pillar: ${pillarLabel}${audienceContext}
${mergedResearchContext ? `Research context: ${mergedResearchContext}` : ""}

Carousel rules:
- Slide 1: "cover" (hook the reader). The cover has EXACTLY 2 lines of large text. "headline" is line1 (white text, 1-4 words max). "accent_word" is line2 (blue text, 1-4 words max). Together they form the hook. Examples: headline="5 AI Systems" accent_word="you need.", headline="Claude" accent_word="skills.", headline="Stop Guessing" accent_word="start scaling." NEVER put a full sentence in headline — split it across the two lines.
- Slides 2-7: "content" (educate/inform). Headlines max 8 words. Body text max 40 words each.
${ctaRule}
- Include a subtitle for the cover (short tagline, max 6 words)

Respond in JSON:
{"title":"post title","caption":"full Instagram caption (no emojis)","hashtags":["tag1","tag2"],"slides":[{"slide_type":"cover","headline":"...","accent_word":"...","subtitle":"..."},{"slide_type":"content","headline":"...","body_text":"..."},{"slide_type":"content","headline":"...","body_text":"..."},{"slide_type":"content","headline":"...","body_text":"..."},{"slide_type":"content","headline":"...","body_text":"..."},{"slide_type":"content","headline":"...","body_text":"..."},{"slide_type":"content","headline":"...","body_text":"..."},{"slide_type":"cta","headline":"...","cta_text":"..."}]}`;
  } else if (contentType === "long_form") {
    prompt = `Generate a LinkedIn long-form post for ${accountHandle}.
Content pillar: ${pillarLabel}${audienceContext}
${mergedResearchContext ? `Research context: ${mergedResearchContext}` : ""}

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
Content pillar: ${pillarLabel}${audienceContext}
${mergedResearchContext ? `Research context: ${mergedResearchContext}` : ""}

Respond in JSON format:
{
  "title": "topic title",
  "body": "${contentType === "thread" ? "first tweet of the thread" : "the tweet text (max 280 chars)"}",
  ${contentType === "thread" ? '"thread_tweets": ["tweet 2", "tweet 3", ...],' : ""}
  "hashtags": ["tag1", "tag2", ...]
}`;
  } else if (contentType === "video_script") {
    prompt = `Generate a YouTube video script for @tayyib.ai.
Content pillar: ${pillarLabel}${audienceContext}
${mergedResearchContext ? `Research context: ${mergedResearchContext}` : ""}
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
  } else if (contentType === "reel") {
    prompt = `Generate an Instagram Reel script for @tayyib.ai.
Content pillar: ${pillarLabel}${audienceContext}
${mergedResearchContext ? `Research context: ${mergedResearchContext}` : ""}

Reel rules:
- Total duration: ~30 seconds max
- Hook (0:00-0:05): One punchy sentence that stops the scroll. Pattern-interrupt or bold claim.
- Body (0:05-0:25): 2-3 key points delivered conversationally. Speak to one person. No jargon. Real value.
- CTA (0:25-0:30): MUST be a comment-keyword engagement mechanic. Pick ONE uppercase keyword tied to the reel topic (e.g. "AI", "PLAYBOOK", "GUIDE", "STACK", "SYSTEM"). The spoken CTA must follow: "Comment '[KEYWORD]' and I'll DM you the [guide / step-by-step plan / playbook / breakdown]". No exceptions, no URLs.
- On-screen text: Short text overlays that reinforce key points (max 6 words each)
- Recording notes: Brief filming tips for this specific reel

Respond in JSON format:
{
  "title": "reel topic title",
  "caption": "Instagram caption for the reel (no emojis, max 500 chars)",
  "hashtags": ["tag1", "tag2"],
  "hook": "opening hook script (5-7 seconds when spoken)",
  "body_script": "main content script (15-20 seconds when spoken)",
  "cta": "closing CTA script (5-8 seconds when spoken)",
  "on_screen_text": ["text overlay 1", "text overlay 2", "text overlay 3"],
  "estimated_duration": "30s",
  "recording_notes": "brief filming/delivery tips for this reel"
}`;
  } else {
    prompt = `Generate a short social media post for ${accountHandle} on ${platform}.
Content pillar: ${pillarLabel}${audienceContext}
${mergedResearchContext ? `Research context: ${mergedResearchContext}` : ""}

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
      source_type: strategyId ? "strategy" : useWinners ? "winners" : researchContext ? "research" : "original",
      source_reference: strategyId
        ? `strategy:${strategyId}`
        : researchContext || (useWinners ? "Seeded from top-engagement tracked posts" : null),
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
    await supabase.from("carousel_slides").insert(slides).select();
    // Images are generated client-side via /api/carousel after redirect
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

  // Store reel script if applicable
  if (contentType === "reel") {
    await supabase.from("reel_scripts").insert({
      generated_content_id: content.id,
      hook: parsed.hook,
      body_script: parsed.body_script,
      cta: parsed.cta,
      on_screen_text: parsed.on_screen_text || [],
      estimated_duration: parsed.estimated_duration || "30s",
      recording_notes: parsed.recording_notes || null,
    });
  }

  return NextResponse.json({ content, parsed });
}
