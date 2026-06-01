import { TopBar } from "@/components/layout/top-bar";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { YouTubePageClient } from "./youtube-page-client";
import { GenerateButton } from "@/components/content/generate-button";
import { WinnersButton } from "@/components/content/winners-button";

export default async function YouTubePage({ searchParams }: { searchParams: Promise<{ account?: string }> }) {
  const supabase = await createServerSupabaseClient();
  const { account = "business" } = await searchParams;

  const [postsResult, ideasResult] = await Promise.all([
    supabase
      .from("generated_content")
      .select("*, youtube_scripts(*)")
      .eq("platform", "youtube")
      .eq("account", account)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("video_ideas")
      .select("*")
      .eq("account", account)
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  const posts = postsResult.data;
  const ideas = ideasResult.data;

  return (
    <div>
      <TopBar
        eyebrow={`${account === "personal" ? "@tayyib.ai" : "@azen_ai"}`}
        title="YouTube."
        subtitle="Scripts, hooks, thumbnails — one long-form video a week."
        actions={
          <div className="flex gap-2">
            <WinnersButton platform="youtube" account={account} />
            <GenerateButton platform="youtube" account={account} label="Generate new script" />
          </div>
        }
      />
      <YouTubePageClient posts={posts || []} ideas={ideas || []} account={account} />
    </div>
  );
}
