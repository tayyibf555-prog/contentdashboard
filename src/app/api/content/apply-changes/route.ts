import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { applyChangesToSlides, type SlideEdit } from "@/lib/claude/apply-changes";

export const maxDuration = 30;

function getSupabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export async function POST(request: Request) {
  try {
    const { contentId, instructions } = (await request.json()) as {
      contentId: string;
      instructions: string;
    };
    if (!contentId || !instructions?.trim()) {
      return NextResponse.json({ error: "contentId and instructions required" }, { status: 400 });
    }

    const supabase = getSupabase();
    const { data: slides, error } = await supabase
      .from("carousel_slides")
      .select("id, slide_number, slide_type, headline, body_text")
      .eq("generated_content_id", contentId)
      .order("slide_number", { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!slides || slides.length === 0) {
      return NextResponse.json({ error: "No slides found for this content" }, { status: 404 });
    }

    const result = await applyChangesToSlides(slides as SlideEdit[], instructions);

    if (result.updated.length === 0) {
      return NextResponse.json({ ok: true, changed: 0, note: result.note });
    }

    // Apply each update; null image_url so the slide re-renders on next view
    for (const u of result.updated) {
      await supabase
        .from("carousel_slides")
        .update({
          headline: u.headline,
          body_text: u.body_text,
          image_url: null,
        })
        .eq("id", u.id);
    }

    return NextResponse.json({ ok: true, changed: result.updated.length, note: result.note });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
