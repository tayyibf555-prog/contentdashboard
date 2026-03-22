"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function addTrackedAccount(formData: {
  name: string;
  category: string;
  instagram: string;
  linkedin: string;
  twitter: string;
  youtube: string;
}) {
  const supabase = getSupabase();

  const platforms: string[] = [];
  const handles: Record<string, string> = {};

  if (formData.instagram) { platforms.push("instagram"); handles.instagram = formData.instagram; }
  if (formData.linkedin) { platforms.push("linkedin"); handles.linkedin = formData.linkedin; }
  if (formData.twitter) { platforms.push("twitter"); handles.twitter = formData.twitter; }
  if (formData.youtube) { platforms.push("youtube"); handles.youtube = formData.youtube; }

  const { error } = await supabase.from("tracked_accounts").insert({
    name: formData.name,
    category: formData.category,
    platforms,
    handles,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/tracked-accounts");
}

export async function deleteTrackedAccount(id: string) {
  const supabase = getSupabase();
  const { error } = await supabase.from("tracked_accounts").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/tracked-accounts");
}

export async function updateTrackedAccount(
  id: string,
  formData: {
    name: string;
    category: string;
    instagram: string;
    linkedin: string;
    twitter: string;
    youtube: string;
  }
) {
  const supabase = getSupabase();

  const platforms: string[] = [];
  const handles: Record<string, string> = {};

  if (formData.instagram) { platforms.push("instagram"); handles.instagram = formData.instagram; }
  if (formData.linkedin) { platforms.push("linkedin"); handles.linkedin = formData.linkedin; }
  if (formData.twitter) { platforms.push("twitter"); handles.twitter = formData.twitter; }
  if (formData.youtube) { platforms.push("youtube"); handles.youtube = formData.youtube; }

  const { error } = await supabase
    .from("tracked_accounts")
    .update({ name: formData.name, category: formData.category, platforms, handles })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/tracked-accounts");
}
