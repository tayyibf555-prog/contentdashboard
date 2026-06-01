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

// PATCH /api/ideas — update status (used/dismissed)
export async function PATCH(request: Request) {
  try {
    const { id, status } = (await request.json()) as { id: string; status: "new" | "used" | "dismissed" };
    const supabase = getSupabase();
    const { error } = await supabase.from("engagement_ideas").update({ status }).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
