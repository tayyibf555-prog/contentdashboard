import { TopBar } from "@/components/layout/top-bar";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { LinkedInEditor } from "./linkedin-editor";
import { GenerateButton } from "@/components/content/generate-button";
import { WinnersButton } from "@/components/content/winners-button";
import { QuickGenerateButton } from "@/components/content/quick-generate-button";

export default async function LinkedInPage({ searchParams }: { searchParams: Promise<{ account?: string }> }) {
  const supabase = await createServerSupabaseClient();
  const { account = "business" } = await searchParams;

  const { data: posts } = await supabase
    .from("generated_content")
    .select("*")
    .eq("platform", "linkedin")
    .eq("account", account)
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div>
      <TopBar
        eyebrow={`${account === "business" ? "@azen_ai" : "@tayyib.ai"}`}
        title="LinkedIn."
        subtitle="Long-form posts and short takes — written, edited, and queued."
        actions={
          <div className="flex gap-2">
            {account === "personal" && (
              <>
                <QuickGenerateButton platform="linkedin" contentType="story" label="Story Post" />
                <QuickGenerateButton platform="linkedin" contentType="value_post" label="Value Post" />
              </>
            )}
            <WinnersButton platform="linkedin" account={account} />
            <GenerateButton platform="linkedin" account={account} />
          </div>
        }
      />
      <LinkedInEditor posts={posts || []} />
    </div>
  );
}
