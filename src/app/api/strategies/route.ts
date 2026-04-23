import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const maxDuration = 10;

function getSupabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const platform = url.searchParams.get("platform");
  const account = url.searchParams.get("account");

  let query = getSupabase()
    .from("strategies")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (platform) query = query.eq("platform", platform);
  if (account) query = query.or(`account.eq.${account},account.eq.both`);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ strategies: data });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { data, error } = await getSupabase()
      .from("strategies")
      .insert({
        platform: body.platform,
        account: body.account,
        category: body.category,
        title: body.title,
        summary: body.summary,
        when_to_use: body.when_to_use,
        how_to_apply: body.how_to_apply || [],
        example: body.example || null,
        why_it_works: body.why_it_works,
        sources: body.sources || [],
      })
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ strategy: data });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed" }, { status: 500 });
  }
}
