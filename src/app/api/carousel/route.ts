import { NextResponse } from "next/server";
import { generateSlideImage } from "@/lib/carousel/generator";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

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

    // If this slide has a user-uploaded custom background, fetch it, apply the
    // personal-template image treatment (grayscale + brightness 0.75 + contrast 1.1),
    // and pass as base64. The generator skips Gemini when backgroundImage is set.
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
          const raw = Buffer.from(await res.arrayBuffer());
          const processed = await sharp(raw)
            .resize(1080, 1350, { fit: "cover", position: "center" })
            .grayscale()
            .linear(1.1, -(0.1 * 128)) // contrast ~1.1 around midpoint
            .modulate({ brightness: 0.75 })
            .png()
            .toBuffer();
          customBg = processed.toString("base64");
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
