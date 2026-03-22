"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { generateContent } from "@/lib/claude/client";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function approveContent(id: string) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("generated_content")
    .update({ status: "approved" })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/instagram");
  revalidatePath("/linkedin");
  revalidatePath("/twitter");
  revalidatePath("/youtube");
}

export async function regenerateContent(id: string) {
  const supabase = getSupabase();
  const { data: original } = await supabase
    .from("generated_content")
    .select("*")
    .eq("id", id)
    .single();

  if (!original) throw new Error("Content not found");

  const { data: voice } = await supabase
    .from("voice_settings")
    .select("*")
    .eq("account_type", original.account)
    .single();

  const accountHandle = original.account === "business" ? "@azen_ai" : "@tayyib.ai";

  const prompt = `Regenerate a ${original.content_type} for ${accountHandle} on ${original.platform}.
Topic: ${original.title}
Content pillar: ${original.pillar}

Generate a completely different take on the same topic. Respond in JSON format:
{
  "title": "post title",
  "body": "post text (no emojis, clean formatting)",
  "hashtags": ["tag1", "tag2", ...]
}`;

  const raw = await generateContent(prompt, voice || undefined);
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(raw);

  const { error } = await supabase
    .from("generated_content")
    .update({
      title: parsed.title,
      body: parsed.body,
      hashtags: parsed.hashtags || [],
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath("/instagram");
  revalidatePath("/linkedin");
  revalidatePath("/twitter");
  revalidatePath("/youtube");
}
