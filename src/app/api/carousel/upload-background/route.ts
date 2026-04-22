import { NextResponse } from "next/server";
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
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const slideIdsRaw = formData.get("slideIds") as string | null;

    if (!file || !slideIdsRaw) {
      return NextResponse.json({ error: "Missing file or slideIds" }, { status: 400 });
    }

    const slideIds = JSON.parse(slideIdsRaw) as string[];
    if (!Array.isArray(slideIds) || slideIds.length === 0) {
      return NextResponse.json({ error: "slideIds must be a non-empty array" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split(".").pop() || "png";
    const fileName = `carousel-bg/${slideIds[0]}-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("carousel-images")
      .upload(fileName, buffer, { contentType: file.type || "image/png" });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: { publicUrl } } = supabase.storage
      .from("carousel-images")
      .getPublicUrl(fileName);

    // Clear any existing final images so they'll regenerate with the new bg,
    // and set the uploaded bg URL on all target slides.
    const { error: updateError } = await supabase
      .from("carousel_slides")
      .update({ custom_background_url: publicUrl, image_url: null })
      .in("id", slideIds);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ url: publicUrl, slideIds });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
