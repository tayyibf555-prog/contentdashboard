import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { generatePlaybook } from "@/lib/claude/companion-pdf";
import { PlaybookDoc } from "@/lib/pdf/playbook";

export const maxDuration = 60;
// react-pdf needs the Node.js runtime (binary primitives don't run on Edge)
export const runtime = "nodejs";

function getSupabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export async function POST(request: Request) {
  try {
    const { contentId } = (await request.json()) as { contentId: string };
    if (!contentId) return NextResponse.json({ error: "contentId required" }, { status: 400 });

    const supabase = getSupabase();
    const { data: content, error: cErr } = await supabase
      .from("generated_content")
      .select("*, carousel_slides(*), reel_scripts(*)")
      .eq("id", contentId)
      .single();
    if (cErr || !content) return NextResponse.json({ error: cErr?.message || "Not found" }, { status: 404 });

    if (content.account !== "personal") {
      return NextResponse.json({ error: "Companion PDFs are personal-only for now" }, { status: 400 });
    }

    // Build the expansion source depending on content type
    let details = "";
    if (content.content_type === "carousel") {
      const slides = (content.carousel_slides || []).sort((a: { slide_number: number }, b: { slide_number: number }) => a.slide_number - b.slide_number);
      details = slides
        .map((s: { slide_number: number; slide_type: string; headline: string | null; body_text: string | null }) =>
          `[Slide ${s.slide_number} · ${s.slide_type}] ${s.headline || ""}\n${s.body_text || ""}`
        )
        .join("\n\n");
    } else if (content.content_type === "reel") {
      const reel = (content.reel_scripts || [])[0];
      if (reel) {
        details = [
          reel.hook ? `Hook: ${reel.hook}` : null,
          reel.body_script ? `Body:\n${reel.body_script}` : null,
          reel.cta ? `CTA: ${reel.cta}` : null,
          reel.on_screen_text?.length ? `On-screen beats: ${reel.on_screen_text.join(" · ")}` : null,
          reel.recording_notes ? `Notes: ${reel.recording_notes}` : null,
        ].filter(Boolean).join("\n\n");
      }
    } else {
      return NextResponse.json({ error: "Only carousel and reel content types are supported" }, { status: 400 });
    }

    if (!details.trim()) {
      return NextResponse.json({ error: "No content to expand from" }, { status: 400 });
    }

    // 1. Claude expansion
    const playbook = await generatePlaybook(
      {
        contentType: content.content_type as "carousel" | "reel",
        title: content.title,
        body: content.body,
        hashtags: content.hashtags || [],
        details,
      },
      "personal"
    );

    // 2. Render PDF
    const handle = "@tayyib.ai";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const element = React.createElement(PlaybookDoc as any, { playbook, handle });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfBuffer = await renderToBuffer(element as any);

    // 3. Upload to Supabase Storage (reuse existing bucket)
    const fileName = `playbooks/${contentId}-${Date.now()}.pdf`;
    const { error: upErr } = await supabase.storage
      .from("carousel-images")
      .upload(fileName, pdfBuffer, {
        contentType: "application/pdf",
        upsert: true,
      });
    if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

    const { data: { publicUrl } } = supabase.storage
      .from("carousel-images")
      .getPublicUrl(fileName);

    // 4. Save URL on the post
    await supabase
      .from("generated_content")
      .update({ companion_pdf_url: publicUrl })
      .eq("id", contentId);

    return NextResponse.json({ url: publicUrl, playbook });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const stack = err instanceof Error ? err.stack : undefined;
    console.error("[companion-pdf]", message, stack);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
