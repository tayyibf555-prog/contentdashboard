import { TopBar } from "@/components/layout/top-bar";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { YouTubeEditor } from "./youtube-editor";

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
        actions={
          <button className="bg-azen-accent text-azen-bg px-3.5 py-2 rounded-md text-xs font-semibold">
            Generate New Script
          </button>
        }
      />
      <YouTubeEditor posts={posts || []} />
    </div>
  );
}
