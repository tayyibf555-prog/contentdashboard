import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateAndStoreVideoIdeas } from "@/lib/ideas/generate";

export const maxDuration = 60;

function getSupabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

// POST /api/video-ideas — manual "Refresh ideas": pull top competitor YouTube videos and persist new ideas.
export async function POST(request: Request) {
  try {
    const { account } = (await request.json()) as { account: "business" | "personal" };
    if (account !== "business" && account !== "personal") {
      return NextResponse.json({ error: "account must be 'business' or 'personal'" }, { status: 400 });
    }

    const result = await generateAndStoreVideoIdeas(account);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PATCH /api/video-ideas — update status (used/dismissed) and/or toggle the saved bookmark
export async function PATCH(request: Request) {
  try {
    const { id, status, saved, notes } = (await request.json()) as {
      id: string;
      status?: "new" | "used" | "dismissed";
      saved?: boolean;
      notes?: string;
    };
    const update: { status?: string; saved?: boolean; notes?: string } = {};
    if (status !== undefined) update.status = status;
    if (saved !== undefined) update.saved = saved;
    if (notes !== undefined) update.notes = notes;
    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "nothing to update" }, { status: 400 });
    }
    const supabase = getSupabase();
    const { error } = await supabase.from("video_ideas").update(update).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
