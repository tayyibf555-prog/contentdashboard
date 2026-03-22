import { NextResponse } from "next/server";
import { postToSocial } from "@/lib/ayrshare/client";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: Request) {
  const supabase = getSupabase();
  const { contentId } = await request.json();

  const { data: content } = await supabase
    .from("generated_content")
    .select("*, carousel_slides(*)")
    .eq("id", contentId)
    .single();

  if (!content) {
    return NextResponse.json({ error: "Content not found" }, { status: 404 });
  }

  // Get profile key for the account
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

  await supabase
    .from("generated_content")
    .update({ status: "posted", posted_at: new Date().toISOString() })
    .eq("id", contentId);

  return NextResponse.json(result);
}
