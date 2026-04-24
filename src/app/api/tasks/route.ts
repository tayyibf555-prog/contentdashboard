import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const maxDuration = 10;

function getSupabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { data, error } = await getSupabase()
      .from("tasks")
      .insert({
        title: body.title,
        description: body.description || null,
        status: body.status || "backlog",
        priority: body.priority || "medium",
        due_date: body.due_date || null,
        linked_content_id: body.linked_content_id || null,
      })
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ task: data });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed" }, { status: 500 });
  }
}
