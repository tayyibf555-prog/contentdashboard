import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// GET: List all evergreen content with cooldown status
export async function GET() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("evergreen_content")
    .select("*, generated_content(*)")
    .order("flagged_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const now = Date.now();
  const enriched = (data || []).map((item) => {
    const cooldownEnd = item.last_reshared_at
      ? new Date(item.last_reshared_at).getTime() + item.cooldown_days * 24 * 60 * 60 * 1000
      : 0;
    return {
      ...item,
      eligible_for_reshare: !item.last_reshared_at || now > cooldownEnd,
      days_until_eligible: item.last_reshared_at
        ? Math.max(0, Math.ceil((cooldownEnd - now) / (24 * 60 * 60 * 1000)))
        : 0,
    };
  });

  return NextResponse.json(enriched);
}

// POST: Flag content as evergreen
export async function POST(request: Request) {
  const supabase = getSupabase();
  const { contentId } = await request.json();

  const { data: existing } = await supabase
    .from("evergreen_content")
    .select("id")
    .eq("generated_content_id", contentId)
    .single();

  if (existing) {
    return NextResponse.json({ error: "Already flagged as evergreen" }, { status: 409 });
  }

  const { data, error } = await supabase
    .from("evergreen_content")
    .insert({ generated_content_id: contentId })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// DELETE: Remove evergreen flag
export async function DELETE(request: Request) {
  const supabase = getSupabase();
  const { contentId } = await request.json();
  const { error } = await supabase
    .from("evergreen_content")
    .delete()
    .eq("generated_content_id", contentId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
