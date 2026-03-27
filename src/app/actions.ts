"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { generateContent } from "@/lib/claude/client";
import { postToSocial } from "@/lib/ayrshare/client";

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

export async function approveContent(id: string) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("generated_content")
    .update({ status: "approved" })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidateAll();
}

export async function postContent(id: string) {
  const supabase = getSupabase();

  const { data: content } = await supabase
    .from("generated_content")
    .select("*, carousel_slides(*)")
    .eq("id", id)
    .single();

  if (!content) throw new Error("Content not found");

  const { data: auth } = await supabase
    .from("social_auth_tokens")
    .select("ayrshare_profile_key")
    .eq("platform", content.platform)
    .eq("account_type", content.account)
    .single();

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

  const result = await postToSocial({
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

  if (error) throw new Error(error.message);
  revalidateAll();
  return result;
}

export async function approveAndPostContent(id: string) {
  await approveContent(id);
  return postContent(id);
}

export async function switchCarouselTemplate(contentId: string, variant: string) {
  const supabase = getSupabase();

  const { data: content } = await supabase
    .from("generated_content")
    .select("*, carousel_slides(*)")
    .eq("id", contentId)
    .single();

  if (!content) throw new Error("Content not found");

  const { resolveTheme } = await import("@/lib/carousel/theme");
  const theme = resolveTheme(
    content.account as "business" | "personal",
    content.pillar || "education",
    variant as "azen" | "tayyib" | "architect" | "gradient" | "minimal" | "bold"
  );

  // Update all slides with new variant + accent color, clear old images
  const { error: updateErr } = await supabase
    .from("carousel_slides")
    .update({ template_variant: theme.variant, accent_color: theme.accentColor, image_url: null })
    .eq("generated_content_id", contentId);

  if (updateErr) throw new Error(updateErr.message);

  // Regenerate images via the /api/carousel route (handles Satori + resvg + upload)
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL
    || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null)
    || "http://localhost:3001";

  const slides = (content.carousel_slides || []).sort(
    (a: { slide_number: number }, b: { slide_number: number }) => a.slide_number - b.slide_number
  );

  const totalSlides = slides.length;
  for (const slide of slides) {
    try {
      const res = await fetch(`${baseUrl}/api/carousel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slideId: slide.id,
          slideType: slide.slide_type,
          props: {
            headline: slide.headline,
            bodyText: slide.body_text,
            accentWord: slide.body_text,
            ctaText: slide.body_text,
            subtitle: slide.slide_type === "cover" ? slide.body_text : undefined,
            account: content.account,
            slideNumber: slide.slide_number,
            totalSlides,
          },
          account: content.account,
          pillar: content.pillar || "education",
          variant: theme.variant,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error(`Slide ${slide.slide_number} image gen failed: ${errText}`);
      }
    } catch (err) {
      console.error(`Image regen failed for slide ${slide.slide_number}:`, err);
    }
  }

  revalidateAll();
}

export async function regenerateContent(id: string) {
  const supabase = getSupabase();
  const { data: original } = await supabase
    .from("generated_content")
    .select("*")
    .eq("id", id)
    .single();

  if (!original) throw new Error("Content not found");

  const { data: voice } = await supabase
    .from("voice_settings")
    .select("*")
    .eq("account_type", original.account)
    .single();

  const accountHandle = original.account === "business" ? "@azen_ai" : "@tayyib.ai";

  const prompt = `Regenerate a ${original.content_type} for ${accountHandle} on ${original.platform}.
Topic: ${original.title}
Content pillar: ${original.pillar}

Generate a completely different take on the same topic. Respond in JSON format:
{
  "title": "post title",
  "body": "post text (no emojis, clean formatting)",
  "hashtags": ["tag1", "tag2", ...]
}`;

  const raw = await generateContent(prompt, voice || undefined);
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

  if (error) throw new Error(error.message);
  revalidateAll();
}
