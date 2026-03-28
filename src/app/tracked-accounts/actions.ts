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

const AI_INDUSTRY_ACCOUNTS: {
  name: string;
  category: "leader" | "competitor" | "other";
  instagram?: string;
  twitter?: string;
  youtube?: string;
  linkedin?: string;
}[] = [
  // --- Leaders: AI execs, researchers, thought leaders ---
  { name: "Sam Altman", category: "leader", twitter: "sama" },
  { name: "Dario Amodei", category: "leader", twitter: "DarioAmodei" },
  { name: "Demis Hassabis", category: "leader", twitter: "demishassabis" },
  { name: "Andrej Karpathy", category: "leader", twitter: "karpathy", youtube: "AndrejKarpathy" },
  { name: "Yann LeCun", category: "leader", twitter: "ylecun" },
  { name: "Francois Chollet", category: "leader", twitter: "fchollet" },
  { name: "Ethan Mollick", category: "leader", twitter: "emollick" },
  { name: "Jim Fan", category: "leader", twitter: "DrJimFan" },
  { name: "Gary Marcus", category: "leader", twitter: "GaryMarcus" },
  { name: "Lex Fridman", category: "leader", twitter: "lexfridman", youtube: "lexfridman", instagram: "lexfridman" },
  { name: "Satya Nadella", category: "leader", twitter: "satyanadella", linkedin: "satyanadella" },
  { name: "Sundar Pichai", category: "leader", twitter: "sundarpichai" },
  { name: "Peter Diamandis", category: "leader", twitter: "PeterDiamandis" },

  // --- Competitors: AI agencies, consultants, business creators ---
  { name: "Liam Ottley", category: "competitor", instagram: "liamottley", youtube: "LiamOttley", twitter: "liamottley", linkedin: "liamottley" },
  { name: "Lead Gen Man", category: "competitor", instagram: "leadgenman" },
  { name: "Allie K. Miller", category: "competitor", instagram: "alliekmiller", twitter: "alliekmiller", linkedin: "alliekmiller" },
  { name: "Ruben Hassid", category: "competitor", instagram: "rubenhassid", twitter: "rubenhassid", linkedin: "rubenhassid" },
  { name: "Alex Hormozi", category: "competitor", instagram: "hormozi", youtube: "AlexHormozi", twitter: "AlexHormozi" },
  { name: "Tyler Germain", category: "competitor", instagram: "itstylergermain" },
  { name: "Jordan Wilson", category: "competitor", linkedin: "jordanwilson", twitter: "jordanwilson" },

  // --- Content Creators: YouTubers, newsletters, AI media ---
  { name: "Matt Wolfe", category: "other", youtube: "mreflow", twitter: "mreflow" },
  { name: "Wes Roth", category: "other", youtube: "WesRoth" },
  { name: "David Ondrej", category: "other", youtube: "DavidOndrej" },
  { name: "Matthew Berman", category: "other", youtube: "MatthewBerman" },
  { name: "Fireship", category: "other", youtube: "Fireship" },
  { name: "Two Minute Papers", category: "other", youtube: "TwoMinutePapers" },
  { name: "The AI Advantage", category: "other", youtube: "TheAIAdvantage" },
  { name: "Riley Brown", category: "other", instagram: "rileybrown.ai" },
  { name: "Rowan Cheung", category: "other", twitter: "rowancheung", instagram: "rowancheung" },
  { name: "Zain Kahn", category: "other", twitter: "heyzain" },
  { name: "Ben Tossell", category: "other", twitter: "bentossell" },
  { name: "Dan Shipper", category: "other", twitter: "danshipper" },
];

export async function seedAIIndustryAccounts(): Promise<{ added: number; skipped: number }> {
  const supabase = getSupabase();

  const { data: existing } = await supabase
    .from("tracked_accounts")
    .select("name");

  const existingNames = new Set((existing || []).map((a: { name: string }) => a.name.toLowerCase()));

  const toInsert = AI_INDUSTRY_ACCOUNTS
    .filter((acc) => !existingNames.has(acc.name.toLowerCase()))
    .map((acc) => {
      const platforms: string[] = [];
      const handles: Record<string, string> = {};

      if (acc.instagram) { platforms.push("instagram"); handles.instagram = acc.instagram; }
      if (acc.twitter) { platforms.push("twitter"); handles.twitter = acc.twitter; }
      if (acc.youtube) { platforms.push("youtube"); handles.youtube = acc.youtube; }
      if (acc.linkedin) { platforms.push("linkedin"); handles.linkedin = acc.linkedin; }

      return { name: acc.name, category: acc.category, platforms, handles };
    });

  if (toInsert.length === 0) {
    revalidatePath("/tracked-accounts");
    return { added: 0, skipped: AI_INDUSTRY_ACCOUNTS.length };
  }

  const { error } = await supabase.from("tracked_accounts").insert(toInsert);
  if (error) throw new Error(error.message);

  revalidatePath("/tracked-accounts");
  return { added: toInsert.length, skipped: AI_INDUSTRY_ACCOUNTS.length - toInsert.length };
}
