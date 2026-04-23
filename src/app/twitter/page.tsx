import { TopBar } from "@/components/layout/top-bar";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { TwitterEditor } from "./twitter-editor";
import { GenerateButton } from "@/components/content/generate-button";
import { WinnersButton } from "@/components/content/winners-button";

export default async function TwitterPage({ searchParams }: { searchParams: Promise<{ account?: string }> }) {
  const supabase = await createServerSupabaseClient();
  const { account = "business" } = await searchParams;

  const { data: posts } = await supabase
    .from("generated_content")
    .select("*")
    .eq("platform", "twitter")
    .eq("account", account)
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div>
      <TopBar
        title="Twitter/X Post Editor"
        subtitle={`${account === "business" ? "@azen_ai" : "@tayyib.ai"} · Craft tweets and threads`}
        actions={
          <div className="flex gap-2">
            <WinnersButton platform="twitter" account={account} />
            <GenerateButton platform="twitter" account={account} />
          </div>
        }
      />
      <TwitterEditor posts={posts || []} />
    </div>
  );
}
