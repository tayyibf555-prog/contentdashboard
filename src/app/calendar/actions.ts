"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function rescheduleContent(contentId: string, newDate: string) {
  const supabase = getSupabase();
  await supabase
    .from("generated_content")
    .update({ scheduled_for: new Date(newDate).toISOString() })
    .eq("id", contentId);
  revalidatePath("/calendar");
}
