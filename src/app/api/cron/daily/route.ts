import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { scrapeAccount } from "@/lib/apify/client";
import { analyzeResearch, generateContent } from "@/lib/claude/client";
import { sendDailyDigest } from "@/lib/resend/client";
import { BUSINESS_PILLARS, PERSONAL_PILLARS } from "@/lib/constants";
import { resolveTheme } from "@/lib/carousel/theme";
import { generateSlideImage, generateBackgrounds } from "@/lib/carousel/generator";

export const maxDuration = 120;

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(request: Request) {
  const supabase = getSupabase();
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Determine today's pillar index (rotate through 7 days)
  const dayIndex = new Date().getDay(); // 0=Sun, 1=Mon, ...
  const businessPillar = BUSINESS_PILLARS[dayIndex % BUSINESS_PILLARS.length];
  const personalPillar = PERSONAL_PILLARS[dayIndex % PERSONAL_PILLARS.length];

  // 1. Scrape all tracked accounts
  const { data: accounts } = await supabase.from("tracked_accounts").select("*");

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
              const analysisRaw = await analyzeResearch(
                `Title: ${result.title}\nContent: ${result.content}\nPlatform: ${result.platform}`
              );
              try {
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
          }
        } catch (err) {
          console.error(`Scraping failed for ${account.name} on ${platform}:`, err);
        }
      }
    }
  }

  // 2. Generate daily content
  const contentRequests = [
    { platform: "instagram", account: "business", pillar: businessPillar.key, contentType: "carousel" },
    { platform: "linkedin", account: "business", pillar: businessPillar.key, contentType: "long_form" },
    { platform: "twitter", account: "business", pillar: businessPillar.key, contentType: "tweet" },
    { platform: "instagram", account: "personal", pillar: personalPillar.key, contentType: "carousel" },
    { platform: "linkedin", account: "personal", pillar: personalPillar.key, contentType: "long_form" },
    { platform: "twitter", account: "personal", pillar: personalPillar.key, contentType: "tweet" },
    { platform: "instagram", account: "personal", pillar: personalPillar.key, contentType: "reel" },
  ];

  // Add YouTube on Sundays
  if (dayIndex === 0) {
    contentRequests.push({
      platform: "youtube",
      account: "personal",
      pillar: personalPillar.key,
      contentType: "video_script",
    });
  }

  // Get recent research for context
  const { data: recentPosts } = await supabase
    .from("scraped_posts")
    .select("*, ai_analysis(*)")
    .order("scraped_at", { ascending: false })
    .limit(10);

  const researchContext = recentPosts
    ?.map((p) => `[${p.platform}] ${p.title}: ${p.ai_analysis?.[0]?.content_opportunity || p.content_summary}`)
    .join("\n") || "";

  let generatedCount = 0;
  for (const req of contentRequests) {
    try {
      // Fetch voice settings for the account
      const { data: voice } = await supabase
        .from("voice_settings")
        .select("*")
        .eq("account_type", req.account)
        .single();

      const accountHandle = req.account === "business" ? "@azen_ai" : "@tayyib.ai";
      const pillars = req.account === "business" ? BUSINESS_PILLARS : PERSONAL_PILLARS;
      const pillarLabel = pillars.find((p) => p.key === req.pillar)?.label || req.pillar;

      let audienceContext = "";
      if (req.account === "business") {
        audienceContext = `\nTarget audience: Business owners, CEOs, and decision-makers who know AI matters but haven't implemented it yet.
Strategic angle: Every post should position Azen AI as the trusted authority on AI implementation. Show the real business outcomes AI delivers — revenue, efficiency, competitive advantage. Make the reader think "I need this for my business." End with a natural CTA: book a free AI audit at azen.io, DM us, or visit azen.io. The Azen methodology is Audit, Educate, Deploy — reference it when relevant.
Content must NOT be generic AI news or tool reviews. Focus on: how AI solves specific business problems, client transformation stories, ROI frameworks, implementation insights, and why most businesses are falling behind by not acting now.`;
      } else {
        audienceContext = `\nTarget audience: Business owners and founders who are considering AI but haven't implemented it yet.
Strategic angle: Educate with real value so they see the gap between where they are and where AI could take them. Never pitch — just teach. Cover diverse business topics (operations, marketing, sales, hiring, workflows, customer experience, strategy) — not just one tool or product.`;
      }

      let prompt = "";
      if (req.contentType === "carousel") {
        prompt = `Generate an Instagram carousel post for ${accountHandle}.
Content pillar: ${pillarLabel}${audienceContext}
Research context: ${researchContext}

Carousel rules:
- Slide 1: "cover" (hook the reader). The cover has EXACTLY 2 lines of large text. "headline" is line1 (white text, 1-4 words max). "accent_word" is line2 (blue text, 1-4 words max). Together they form the hook. Examples: headline="5 AI Systems" accent_word="you need.", headline="Stop Guessing" accent_word="start scaling." NEVER put a full sentence in headline — split it across the two lines.
- Slides 2-7: "content" (educate/inform). Headlines max 8 words. Body text max 40 words each.
- Slide 8: "cta" (drive action). Short punchy CTA.
- Include a subtitle for the cover (short tagline, max 6 words)

Respond in JSON:
{"title":"post title","caption":"full Instagram caption (no emojis)","hashtags":["tag1","tag2"],"slides":[{"slide_type":"cover","headline":"...","accent_word":"...","subtitle":"..."},{"slide_type":"content","headline":"...","body_text":"..."},{"slide_type":"content","headline":"...","body_text":"..."},{"slide_type":"content","headline":"...","body_text":"..."},{"slide_type":"content","headline":"...","body_text":"..."},{"slide_type":"content","headline":"...","body_text":"..."},{"slide_type":"content","headline":"...","body_text":"..."},{"slide_type":"cta","headline":"...","cta_text":"..."}]}`;
      } else if (req.contentType === "long_form") {
        prompt = `Generate a LinkedIn long-form post for ${accountHandle}.\nContent pillar: ${pillarLabel}${audienceContext}\nResearch context: ${researchContext}\n\nRespond in JSON format:\n{ "title": "post title", "body": "full post text (no emojis, max 3000 chars)", "hashtags": ["tag1"] }`;
      } else if (req.contentType === "tweet") {
        prompt = `Generate a Twitter/X tweet for ${accountHandle}.\nContent pillar: ${pillarLabel}${audienceContext}\nResearch context: ${researchContext}\n\nRespond in JSON format:\n{ "title": "topic title", "body": "tweet text (max 280 chars, no emojis)", "hashtags": ["tag1"] }`;
      } else if (req.contentType === "video_script") {
        prompt = `Generate a YouTube video script for @tayyib.ai.\nContent pillar: ${pillarLabel}${audienceContext}\nResearch context: ${researchContext}\n\nRespond in JSON format:\n{ "title": "video title", "hook": "first 30s script", "intro": "intro script", "body_sections": [{ "title": "Section", "content": "...", "start_time": "1:30", "end_time": "4:00" }], "cta": "closing CTA mentioning azen.io", "description": "YouTube description", "tags": ["tag1"], "thumbnail_concepts": [{ "label": "A", "description": "concept" }], "estimated_duration": "12 min", "title_variants": [{ "title": "option", "ctr_score": 8.5 }] }`;
      } else if (req.contentType === "reel") {
        prompt = `Generate an Instagram Reel script for @tayyib.ai.\nContent pillar: ${pillarLabel}${audienceContext}\nResearch context: ${researchContext}\n\nReel rules:\n- Total duration: ~30 seconds max\n- Hook (0:00-0:05): One punchy sentence that stops the scroll.\n- Body (0:05-0:25): 2-3 key points delivered conversationally. Speak to one person. No jargon.\n- CTA (0:25-0:30): Clear next step — follow for more, save this, or DM me.\n- On-screen text: Short text overlays (max 6 words each)\n\nRespond in JSON format:\n{ "title": "reel topic", "caption": "Instagram caption (no emojis, max 500 chars)", "hashtags": ["tag1"], "hook": "opening hook (5-7s)", "body_script": "main content (15-20s)", "cta": "closing CTA (5-8s)", "on_screen_text": ["overlay 1", "overlay 2"], "estimated_duration": "30s", "recording_notes": "filming tips" }`;
      } else {
        prompt = `Generate a short social media post for ${accountHandle} on ${req.platform}.\nContent pillar: ${pillarLabel}${audienceContext}\nResearch context: ${researchContext}\n\nRespond in JSON format:\n{ "title": "post title", "body": "post text (no emojis)", "hashtags": ["tag1"] }`;
      }

      const raw = await generateContent(prompt, voice || undefined, req.account as "business" | "personal");
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(raw);

      const { data: content } = await supabase
        .from("generated_content")
        .insert({
          platform: req.platform,
          account: req.account,
          content_type: req.contentType,
          title: parsed.title,
          body: parsed.body || parsed.caption || "",
          hashtags: parsed.hashtags || [],
          pillar: req.pillar,
          source_type: "research",
          best_time: null,
          status: "pending",
        })
        .select()
        .single();

      if (content && req.contentType === "carousel" && parsed.slides) {
        const theme = resolveTheme(req.account as "business" | "personal", req.pillar);
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

        // Pre-generate AI backgrounds sequentially, then render slides
        if (insertedSlides) {
          const slideTypes = insertedSlides.map((s: Record<string, string | number>) => s.slide_type as "cover" | "content" | "cta");
          const backgrounds = await generateBackgrounds(theme.variant, slideTypes, theme.accentColor);

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
                  account: req.account,
                  slideNumber: slide.slide_number,
                  totalSlides,
                },
                { account: req.account as "business" | "personal", pillar: req.pillar, variant: theme.variant, backgroundImage: backgrounds.get(idx) }
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

      if (content && req.contentType === "video_script") {
        await supabase.from("youtube_scripts").insert({
          generated_content_id: content.id,
          hook: parsed.hook, intro: parsed.intro,
          body_sections: parsed.body_sections || [], cta: parsed.cta,
          thumbnail_concepts: parsed.thumbnail_concepts || [],
          title_variants: parsed.title_variants || [],
          description: parsed.description, tags: parsed.tags || [],
          estimated_duration: parsed.estimated_duration,
        });
      }

      if (content && req.contentType === "reel") {
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

      generatedCount++;
    } catch (err) {
      console.error(`Generation failed for ${req.platform}/${req.account}:`, err);
    }
  }

  // 2b. Check for eligible evergreen content to suggest resharing
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data: evergreenCandidates } = await supabase
    .from("evergreen_content")
    .select("*, generated_content(*)")
    .or(`last_reshared_at.is.null,last_reshared_at.lt.${thirtyDaysAgo}`)
    .limit(3);

  if (evergreenCandidates && evergreenCandidates.length > 0) {
    // Mark evergreen suggestions as pending reshare (creates draft copies)
    for (const eg of evergreenCandidates) {
      const original = eg.generated_content;
      if (!original) continue;
      await supabase.from("generated_content").insert({
        platform: original.platform,
        account: original.account,
        content_type: original.content_type,
        title: `[Reshare] ${original.title}`,
        body: original.body,
        hashtags: original.hashtags,
        pillar: original.pillar,
        source_type: "evergreen_reshare",
        source_reference: `Evergreen reshare of: ${original.title}`,
        status: "draft",
        is_repurposed: true,
        repurposed_from: original.id,
      });
    }
  }

  // 3. Send daily digest email
  const trendingTopics = recentPosts
    ?.flatMap((p) => p.ai_analysis?.[0]?.trending_topics || [])
    .filter((v, i, a) => a.indexOf(v) === i)
    .slice(0, 5) || [];

  try {
    await sendDailyDigest({
      pendingCount: generatedCount,
      topics: trendingTopics,
      pillar: `${businessPillar.label} / ${personalPillar.label}`,
    });
  } catch (err) {
    console.error("Email notification failed:", err);
  }

  return NextResponse.json({
    scraped: accounts?.length || 0,
    generated: generatedCount,
    pillar: { business: businessPillar.label, personal: personalPillar.label },
  });
}
