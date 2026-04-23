"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { generateContent } from "@/lib/claude/client";
import { postToSocial } from "@/lib/ayrshare/client";

export type ActionResult = { success: true } | { success: false; error: string };

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/instagram");
  revalidatePath("/linkedin");
  revalidatePath("/twitter");
  revalidatePath("/youtube");
}

export async function approveContent(id: string): Promise<ActionResult> {
  try {
    const supabase = getSupabase();
    // Fetch so we can decide if a companion PDF should be kicked off
    const { data: content } = await supabase
      .from("generated_content")
      .select("account, content_type, companion_pdf_url")
      .eq("id", id)
      .single();

    const { error } = await supabase
      .from("generated_content")
      .update({ status: "approved" })
      .eq("id", id);
    if (error) return { success: false, error: error.message };

    // Fire-and-forget: personal carousels + reels get a playbook PDF on approval
    // (only if one doesn't already exist). Does not block the approve response.
    if (
      content &&
      content.account === "personal" &&
      (content.content_type === "carousel" || content.content_type === "reel") &&
      !content.companion_pdf_url
    ) {
      // Fire without awaiting — the PDF API has its own 60s timeout
      const base = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL || ""}`
        : "";
      if (base) {
        fetch(`${base}/api/companion-pdf`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contentId: id }),
        }).catch((e) => console.warn("[approve] PDF trigger failed:", e));
      }
    }

    revalidateAll();
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to approve content" };
  }
}

export async function postContent(id: string): Promise<ActionResult> {
  try {
    const supabase = getSupabase();

    const { data: content } = await supabase
      .from("generated_content")
      .select("*, carousel_slides(*)")
      .eq("id", id)
      .single();

    if (!content) return { success: false, error: "Content not found" };

    // For Instagram carousels, require at least one image
    if (content.platform === "instagram" && content.content_type === "carousel") {
      const validImages = (content.carousel_slides || []).filter(
        (s: { image_url: string | null }) => s.image_url
      );
      if (validImages.length === 0) {
        return { success: false, error: "Cannot post carousel — no slide images generated. Try switching the template first." };
      }
    }

    const { data: auth } = await supabase
      .from("social_auth_tokens")
      .select("ayrshare_profile_key")
      .eq("platform", content.platform)
      .eq("account_type", content.account)
      .maybeSingle();

    const mediaUrls = content.carousel_slides
      ?.sort((a: { slide_number: number }, b: { slide_number: number }) => a.slide_number - b.slide_number)
      .map((s: { image_url: string }) => s.image_url)
      .filter(Boolean) || [];

    const platformMap: Record<string, string> = {
      instagram: "instagram",
      linkedin: "linkedin",
      twitter: "twitter",
      youtube: "youtube",
    };

    await postToSocial({
      platforms: [platformMap[content.platform]],
      post: `${content.body}\n\n${(content.hashtags || []).map((t: string) => `#${t}`).join(" ")}`,
      mediaUrls: mediaUrls.length > 0 ? mediaUrls : undefined,
      scheduleDate: content.scheduled_for || undefined,
      profileKey: auth?.ayrshare_profile_key || undefined,
    });

    const { error } = await supabase
      .from("generated_content")
      .update({ status: "posted", posted_at: new Date().toISOString() })
      .eq("id", id);

    if (error) return { success: false, error: error.message };
    revalidateAll();
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to post content" };
  }
}

export async function approveAndPostContent(id: string): Promise<ActionResult> {
  const approveResult = await approveContent(id);
  if (!approveResult.success) return approveResult;
  return postContent(id);
}

export async function switchCarouselTemplate(contentId: string, variant: string): Promise<ActionResult> {
  try {
    const supabase = getSupabase();

    const { data: content } = await supabase
      .from("generated_content")
      .select("*, carousel_slides(*)")
      .eq("id", contentId)
      .single();

    if (!content) return { success: false, error: "Content not found" };

    const { resolveTheme } = await import("@/lib/carousel/theme");
    const theme = resolveTheme(
      content.account as "business" | "personal",
      content.pillar || "education",
      variant as "azen" | "tayyib" | "architect" | "gradient" | "minimal" | "bold"
    );

    // Update all slides with new variant + accent color, clear old images
    // Images will be regenerated client-side via /api/carousel
    const { error: updateErr } = await supabase
      .from("carousel_slides")
      .update({ template_variant: theme.variant, accent_color: theme.accentColor, image_url: null })
      .eq("generated_content_id", contentId);

    if (updateErr) return { success: false, error: updateErr.message };

    revalidateAll();
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to switch template" };
  }
}

export async function markAsPosted(id: string): Promise<ActionResult> {
  try {
    const supabase = getSupabase();
    const { error } = await supabase
      .from("generated_content")
      .update({ status: "posted", posted_at: new Date().toISOString() })
      .eq("id", id);
    if (error) return { success: false, error: error.message };
    revalidateAll();
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to mark as posted" };
  }
}

export async function regenerateContent(id: string): Promise<ActionResult> {
  try {
    const supabase = getSupabase();
    const { data: original } = await supabase
      .from("generated_content")
      .select("*")
      .eq("id", id)
      .single();

    if (!original) return { success: false, error: "Content not found" };

    const { data: voice } = await supabase
      .from("voice_settings")
      .select("*")
      .eq("account_type", original.account)
      .maybeSingle();

    const accountHandle = original.account === "business" ? "@azen_ai" : "@tayyib.ai";

    let prompt: string;

    if (original.content_type === "reel") {
      prompt = `Regenerate an Instagram Reel script for ${accountHandle}.
Topic: ${original.title}
Content pillar: ${original.pillar}

Generate a completely different take on the same topic. ~30 seconds max.

Respond in JSON format:
{
  "title": "reel topic title",
  "body": "Instagram caption (no emojis, max 500 chars)",
  "hashtags": ["tag1", "tag2"],
  "hook": "opening hook script (5-7 seconds)",
  "body_script": "main content script (15-20 seconds)",
  "cta": "closing CTA script (5-8 seconds)",
  "on_screen_text": ["text 1", "text 2"],
  "estimated_duration": "30s",
  "recording_notes": "filming tips"
}`;
    } else {
      prompt = `Regenerate a ${original.content_type} for ${accountHandle} on ${original.platform}.
Topic: ${original.title}
Content pillar: ${original.pillar}

Generate a completely different take on the same topic. Respond in JSON format:
{
  "title": "post title",
  "body": "post text (no emojis, clean formatting)",
  "hashtags": ["tag1", "tag2", ...]
}`;
    }

    const raw = await generateContent(prompt, voice || undefined, original.account as "business" | "personal");
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(raw);

    const { error } = await supabase
      .from("generated_content")
      .update({
        title: parsed.title,
        body: parsed.body,
        hashtags: parsed.hashtags || [],
      })
      .eq("id", id);

    if (error) return { success: false, error: error.message };

    if (original.content_type === "reel") {
      await supabase
        .from("reel_scripts")
        .update({
          hook: parsed.hook,
          body_script: parsed.body_script,
          cta: parsed.cta,
          on_screen_text: parsed.on_screen_text || [],
          estimated_duration: parsed.estimated_duration || "30s",
          recording_notes: parsed.recording_notes || null,
        })
        .eq("generated_content_id", id);
    }

    revalidateAll();
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to regenerate content" };
  }
}
