import { TopBar } from "@/components/layout/top-bar";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { TwitterEditor } from "./twitter-editor";

export default async function TwitterPage() {
  const supabase = await createServerSupabaseClient();

  const { data: posts } = await supabase
    .from("generated_content")
    .select("*")
    .eq("platform", "twitter")
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div>
      <TopBar
        title="Twitter/X Post Editor"
        subtitle="Craft tweets and threads"
        actions={
          <button className="bg-azen-accent text-azen-bg px-3.5 py-2 rounded-md text-xs font-semibold">
            Generate New
          </button>
        }
      />
      <TwitterEditor posts={posts || []} />
    </div>
  );
}
