import { TopBar } from "@/components/layout/top-bar";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { RedditEditor } from "./reddit-editor";
import { QuickGenerateButton } from "@/components/content/quick-generate-button";

export default async function RedditPage() {
  const supabase = await createServerSupabaseClient();

  const { data: posts } = await supabase
    .from("generated_content")
    .select("*")
    .eq("platform", "reddit")
    .eq("account", "personal")
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div>
      <TopBar
        eyebrow="@tayyib.ai"
        title="Reddit."
        subtitle="First-person founder stories — generated, reviewed, copied, and posted manually."
        actions={
          <QuickGenerateButton
            platform="reddit"
            contentType="reddit_post"
            label="Generate Post"
            defaultPillar="journey"
          />
        }
      />
      <RedditEditor posts={posts || []} />
    </div>
  );
}
