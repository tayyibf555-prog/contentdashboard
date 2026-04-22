import { NextResponse } from "next/server";
import { generateSlideImage } from "@/lib/carousel/generator";
import { createClient } from "@supabase/supabase-js";

export const maxDuration = 30;

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: Request) {
  try {
    const supabase = getSupabase();
    const { slideId, slideType, props, account, pillar, variant } = await request.json();

    // If this slide has a user-uploaded custom background, fetch it and pass as base64
    // so the generator skips Gemini and uses the user's image instead.
    let customBg: string | null = null;
    if (slideId) {
      const { data: slideRow } = await supabase
        .from("carousel_slides")
        .select("custom_background_url")
        .eq("id", slideId)
        .single();
      if (slideRow?.custom_background_url) {
        const res = await fetch(slideRow.custom_background_url);
        if (res.ok) {
          const buf = Buffer.from(await res.arrayBuffer());
          customBg = buf.toString("base64");
        }
      }
    }

    const imageBuffer = await generateSlideImage(slideType, props, {
      account,
      pillar,
      variant,
      backgroundImage: customBg,
    });

    // Upload to Supabase Storage
    const fileName = `carousel/${slideId}-${Date.now()}.png`;
    const { error: uploadError } = await supabase.storage
      .from("carousel-images")
      .upload(fileName, imageBuffer, { contentType: "image/png" });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: { publicUrl } } = supabase.storage
      .from("carousel-images")
      .getPublicUrl(fileName);

    // Update slide record with image URL
    if (slideId) {
      await supabase
        .from("carousel_slides")
        .update({ image_url: publicUrl })
        .eq("id", slideId);
    }

    return NextResponse.json({ url: publicUrl });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const stack = err instanceof Error ? err.stack : "";
    console.error("Carousel generation error:", message, stack);
    return NextResponse.json({ error: message, stack }, { status: 500 });
  }
}
