import { TopBar } from "@/components/layout/top-bar";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { YouTubeEditor } from "./youtube-editor";
import { GenerateButton } from "@/components/content/generate-button";

export default async function YouTubePage({ searchParams }: { searchParams: Promise<{ account?: string }> }) {
  const supabase = await createServerSupabaseClient();
  const { account = "business" } = await searchParams;

  const { data: posts } = await supabase
    .from("generated_content")
    .select("*, youtube_scripts(*)")
    .eq("platform", "youtube")
    .eq("account", account)
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <div>
      <TopBar
        title="YouTube Script Builder"
        subtitle={`${account === "personal" ? "@tayyib.ai · " : ""}Weekly uploads`}
        actions={<GenerateButton platform="youtube" account={account} label="Generate New Script" />}
      />
      <YouTubeEditor posts={posts || []} />
    </div>
  );
}
