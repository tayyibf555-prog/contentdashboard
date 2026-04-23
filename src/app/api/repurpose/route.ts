import { NextResponse } from "next/server";
import { generateContent } from "@/lib/claude/client";
import { createClient } from "@supabase/supabase-js";
import { resolveTheme } from "@/lib/carousel/theme";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: Request) {
  const supabase = getSupabase();
  const { sourceContentId, targetPlatform, targetContentType, targetAccount } = await request.json();

  const { data: source } = await supabase
    .from("generated_content")
    .select("*")
    .eq("id", sourceContentId)
    .single();

  if (!source) {
    return NextResponse.json({ error: "Source content not found" }, { status: 404 });
  }

  const { data: voice } = await supabase
    .from("voice_settings")
    .select("*")
    .eq("account_type", targetAccount)
    .single();

  const accountHandle = targetAccount === "business" ? "@azen_ai" : "@tayyib.ai";

  const prompt = `Repurpose this content for ${targetPlatform} (${targetContentType}) for ${accountHandle}.

Original content (${source.platform} ${source.content_type}):
Title: ${source.title}
Body: ${source.body}

Rules:
- Adapt the content to feel native to ${targetPlatform}
- Do not copy it word-for-word — rewrite it
- No emojis
- Match the tone for ${targetAccount === "business" ? "a professional AI agency" : "a personal brand / entrepreneur"}
${targetContentType === "carousel" ? "- Return JSON with slides array" : ""}
${targetContentType === "carousel" && targetAccount === "personal" ? `- The final "cta" slide MUST be a comment-keyword engagement CTA: pick one uppercase topic keyword (e.g. "AI", "PLAYBOOK", "GUIDE", "STACK"), set cta_text to "Comment '[KEYWORD]' and I'll DM you the [guide / step-by-step plan / playbook]". Max 12 words, no URLs, no exceptions.` : ""}
${targetContentType === "thread" ? "- Return JSON with thread_tweets array" : ""}

Respond in JSON format:
{
  "title": "adapted title",
  "body": "adapted content",
  "hashtags": ["tag1", "tag2", ...]
  ${targetContentType === "carousel" ? ', "slides": [{ "slide_type": "cover", "headline": "line1 (1-4 words, white)", "accent_word": "line2 (1-4 words, blue)" }, { "slide_type": "content", "headline": "...", "body_text": "..." }, { "slide_type": "cta", "headline": "...", "cta_text": "..." }]' : ""}
  ${targetContentType === "thread" ? ', "thread_tweets": ["tweet 2", "tweet 3", ...]' : ""}
}`;

  const raw = await generateContent(prompt, voice || undefined);

  let parsed;
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Failed to parse response" }, { status: 500 });
  }

  const { data: content } = await supabase
    .from("generated_content")
    .insert({
      platform: targetPlatform,
      account: targetAccount,
      content_type: targetContentType,
      title: parsed.title,
      body: parsed.body,
      hashtags: parsed.hashtags || [],
      pillar: source.pillar,
      source_type: "repurposed",
      source_reference: `Repurposed from ${source.platform} post: ${source.title}`,
      status: "pending",
      is_repurposed: true,
      repurposed_from: sourceContentId,
    })
    .select()
    .single();

  if (content && targetContentType === "carousel" && parsed.slides) {
    const theme = resolveTheme(targetAccount as "business" | "personal", source.pillar || "education");
    const slides = parsed.slides.map((slide: Record<string, string>, i: number) => ({
      generated_content_id: content.id,
      slide_number: i + 1,
      headline: slide.headline,
      body_text: slide.body_text || slide.accent_word || slide.cta_text || "",
      slide_type: slide.slide_type,
      template_variant: theme.variant,
      accent_color: theme.accentColor,
    }));
    await supabase.from("carousel_slides").insert(slides);
  }

  return NextResponse.json({ content, parsed });
}
