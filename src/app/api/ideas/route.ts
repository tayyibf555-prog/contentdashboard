import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateAndStoreIdeas } from "@/lib/ideas/generate";

export const maxDuration = 60;

function getSupabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

// POST /api/ideas — manual "Refresh ideas": pull top competitor reels and persist new ideas.
export async function POST(request: Request) {
  try {
    const { account } = (await request.json()) as { account: "business" | "personal" };
    if (account !== "business" && account !== "personal") {
      return NextResponse.json({ error: "account must be 'business' or 'personal'" }, { status: 400 });
    }

    const result = await generateAndStoreIdeas(account);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PATCH /api/ideas — update status (used/dismissed) and/or toggle the saved bookmark
export async function PATCH(request: Request) {
  try {
    const { id, status, saved } = (await request.json()) as {
      id: string;
      status?: "new" | "used" | "dismissed";
      saved?: boolean;
    };
    const update: { status?: string; saved?: boolean } = {};
    if (status !== undefined) update.status = status;
    if (saved !== undefined) update.saved = saved;
    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "nothing to update" }, { status: 400 });
    }
    const supabase = getSupabase();
    const { error } = await supabase.from("engagement_ideas").update(update).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
