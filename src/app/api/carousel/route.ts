import { NextResponse } from "next/server";
import { generateSlideImage } from "@/lib/carousel/generator";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: Request) {
  const supabase = getSupabase();
  const { slideId, slideType, props } = await request.json();

  const imageBuffer = await generateSlideImage(slideType, props);

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
}
