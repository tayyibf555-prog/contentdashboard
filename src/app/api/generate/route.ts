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
  const { platform, account, pillar, researchContext, contentType, useWinners, strategyId, ctaStyle } = await request.json();

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
    // Personal carousels default to a comment-keyword DM trigger, but the user
    // can opt into a direct CTA via ctaStyle="direct". Business is always direct.
    const personalCtaStyle = ctaStyle === "direct" ? "direct" : "comment_keyword";
    const ctaRule = account === "personal"
      ? personalCtaStyle === "direct"
        ? `- Slide 8: "cta" (drive action). The cta_text must be a short direct sentence, max 8 words, telling the reader exactly what to do next. Personal-brand voice — first person, no agency-speak, no "azen.io". Examples: "DM me 'AI' to get the playbook", "Follow @tayyib.ai for more AI systems", "Save this and try it tomorrow". It must relate to the post topic. No URLs.`
        : `- Slide 8: "cta" — MUST be a comment-keyword engagement CTA. Pick ONE uppercase keyword closely tied to the post topic (e.g. "AI", "PLAYBOOK", "GUIDE", "STACK", "SYSTEM", "SCALE", "FOUNDER"). The cta_text MUST follow this pattern: "Comment '[KEYWORD]' and I'll DM you the [guide / step-by-step plan / playbook / breakdown]". Max 12 words. No URLs.`
      : `- Slide 8: "cta" (drive action). The cta_text must be a short direct sentence, max 8 words, that tells the reader exactly what to do next. Examples: "Book your free AI audit today", "DM us to start saving time", "Visit azen.io for a free strategy call". It must relate to the post topic — not generic. No URLs in the text.`;

    prompt = `Generate an Instagram carousel post for ${accountHandle}.
Content pillar: ${pillarLabel}${audienceContext}
${mergedResearchContext ? `Research context: ${mergedResearchContext}` : ""}

Carousel rules:
- Slide 1: "cover" (hook the reader). The cover has EXACTLY 2 lines of large text. "headline" is line1 (white text, 1-4 words max). "accent_word" is line2 (blue text, 1-4 words max). Together they form the hook. Examples: headline="5 AI Systems" accent_word="you need.", headline="Claude" accent_word="skills.", headline="Stop Guessing" accent_word="start scaling." NEVER put a full sentence in headline — split it across the two lines. CRITICAL: accent_word and headline must NOT overlap — do not repeat any words. The accent_word is the second line; the headline is the first line; together they form ONE sentence.
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
  } else if (contentType === "story") {
    prompt = `Write a LinkedIn storytelling post for @tayyib.ai.
Content pillar: ${pillarLabel}${audienceContext}
${mergedResearchContext ? `Context / topic direction: ${mergedResearchContext}` : ""}

AUTHOR BACKGROUND (use this as the ground truth — never invent a different backstory):
Tayyib studied cybersecurity at university. He did not graduate. He left in his third year to build Azen AI, his AI agency. Any reference to his education, his past, or his decision to start the business must reflect this exactly.

Follow this exact 4-part structure:

PART 1 — HOOK (lines 1-3, ~225 characters max before "see more")
Line 1: Identity statement with a specific number. Who you were + a concrete fact.
Line 2: Credential or context that raises the stakes. Another specific number.
Line 3: The turn — start with "But" or "Then" or "One day". End with "....." to create a physical cliffhanger.
Use "I" or "I've" to open — they signal a real person. Numbers are non-negotiable. Short sentences only.

PART 2 — RISING ACTION (the body)
Sub-beat A — THE BEFORE: Set the world you came from. 2-4 lines. End with one short emotional line (e.g. "And it felt forced.").
Sub-beat B — THE DECISION: The pivot moment. Use "So..." to signal consequence. Can use scare quotes for irony.
Sub-beat C — THE DOUBT: External or internal opposition. Use TRIPLE REPETITION: three lines with the same opening structure (e.g. "Many thought... / Many thought... / Many thought..."). Three beats, no more, no less.
Rhythm rule: alternate long and short sentences throughout. Never three long sentences in a row.

PART 3 — CONCLUSION
Use PARALLEL STRUCTURE with three lines. Template: "It's been [time]. / It's been [effort]. / It's been [result]." OR "Today, I [state]. / Today, I [reality]. / Today, I [truth]."
Include at least one specific number ($, hours, months, clients, etc.).
No sales pitch. No list of services. Understated, not boastful.

PART 4 — PAYOFF (one or two lines max)
One profound, understated line that makes the reader pause. Simple language. Emotional, not informational. No CTA. No "follow me for more." No question to the audience.
Examples of the right tone: "What a ride it's been." / "Glad I bet on myself." / "Turns out, the risk was the safe path." / "Still figuring it out. Still going."

STYLE RULES (all non-negotiable):
- Fifth-grade reading level. Short words. No jargon.
- One idea per line. White space between every beat.
- Specific numbers beat vague claims ("$487k" not "a lot of money").
- No AI-voice corporate language. Write like you talk.
- Do NOT add a CTA, "DM me", or "follow for more" — the story IS the conversion.
- Do NOT add external links.
- No emojis, no dashes, no arrows, no bullet symbols of any kind. Plain text only. Every line is a sentence, not a list item.

Respond in JSON format:
{
  "title": "story topic (internal reference, not shown publicly)",
  "body": "the complete LinkedIn story post — full text with line breaks between every beat, exactly as it should be posted",
  "hashtags": ["tag1", "tag2", "tag3"]
}`;
  } else if (contentType === "value_post") {
    prompt = `Write a LinkedIn value post for @tayyib.ai.
Content pillar: ${pillarLabel}${audienceContext}
${mergedResearchContext ? `Context / topic direction: ${mergedResearchContext}` : ""}

Follow this exact 7-part structure. Every section is required:

PART 1 — CONTRARIAN HOOK (3 lines, ~225 characters max)
Line 1: A bold contrarian command or claim. Start with "NEVER", "STOP", "Most [audience] are wrong about...", or a shocking statement. This must be controversial enough to stop the scroll.
Line 2: Specific current event, credential, or dollar figure that backs the claim. Include a concrete number ($, %, timeframe).
Line 3: "Most [audience] [do this wrong]:" — ends with a colon to promise a list is coming.
Use "I" / "I've" voice where it fits.

PART 2 — PROBLEM CALLOUT
Short setup line ending in a colon.
Then exactly 2 lines showing verbatim wrong behaviors or bad practices. Write each as a plain sentence — no bullet symbols, no dashes, no arrows. Just one line per wrong behavior.
End with one-line memorable reframe using a metaphor: "That's not a [serious thing]. That's a [trivial/negative thing]."

PART 3 — AUTHORITY PROOF
"I just [tested/built/discovered] [specific thing] and [strong reaction]:" — personal, current, first-hand.
Then 3 plain lines, each describing an outcome (not a feature). Format: [Verb] + [specific mechanism] + [desirable outcome]. Include at least one number or named target audience. No bullet symbols of any kind.

PART 4 — INSIGHT FLIP (two lines with white space between)
Line 1: "The [thing] isn't [obvious wrong answer]."
Line 2: "It's [non-obvious answer that names a new concept or paradigm]."
This is the screenshot-worthy line. Own a word or phrase.

PART 5 — VALUE STACK
Setup: "I'm giving away the exact [named asset]:"
Then exactly 3 plain lines, each pairing [Asset name] and what it does. No checkmarks, no dashes, no bullet symbols. Just sentences. At least one must include a specific number. Name the collection like a product ("The [X] System", "The [X] Architecture").

PART 6 — CONTRAST PROMISE (two lines)
Line 1: "Zero [pain #1]. Zero [pain #2]."
Line 2: "Just [desirable outcome that compounds or scales]."

PART 7 — CTA ARCHITECTURE
Line 1: "Want the complete [named asset]?" (yes/no question with obvious answer)
Line 2: "Connect with me."
Line 3: "Comment [KEYWORD] below and repost this."
Line 4: "I'll DM you the full [asset name]."

The KEYWORD must be: one word, all-caps, thematic to the post, 4–6 letters, easy to type on mobile. Examples: VAULT, STACK, OPUS, BLUEPRINT, LADDER, PLAYBOOK, NUDGE, DECK.

FORMATTING RULES (non-negotiable):
- Blank line between every section
- No emojis, no dashes, no arrows, no bullet symbols, no checkmarks, no numbered emoji steps — plain text only
- No external links in the body
- No generic AI voice — write like Tayyib talks, not a press release
- Never put the lead magnet link in the post body

Respond in JSON format:
{
  "title": "value post topic (internal reference)",
  "body": "the complete LinkedIn value post — all 7 parts with correct formatting and line breaks, exactly as it should be posted",
  "hashtags": ["tag1", "tag2", "tag3"]
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

  let raw: string;
  try {
    raw = await generateContent(prompt, voice || undefined, account as "business" | "personal");
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("[/api/generate] Claude call failed:", msg);
    return NextResponse.json({ error: `Claude generation failed: ${msg}` }, { status: 500 });
  }

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
    const { error: reelError } = await supabase.from("reel_scripts").insert({
      generated_content_id: content.id,
      hook: parsed.hook,
      body_script: parsed.body_script,
      cta: parsed.cta,
      on_screen_text: parsed.on_screen_text || [],
      estimated_duration: parsed.estimated_duration || "30s",
      recording_notes: parsed.recording_notes || null,
    });
    if (reelError) {
      console.error("[/api/generate] reel_scripts insert failed:", reelError.message);
      return NextResponse.json({ error: `Failed to store reel script: ${reelError.message}` }, { status: 500 });
    }
  }

  return NextResponse.json({ content, parsed });
}
