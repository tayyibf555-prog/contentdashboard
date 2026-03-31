import { TopBar } from "@/components/layout/top-bar";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { LinkedInEditor } from "./linkedin-editor";
import { GenerateButton } from "@/components/content/generate-button";

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
        title="LinkedIn Post Editor"
        subtitle={`${account === "business" ? "@azen_ai" : "@tayyib.ai"} · Craft and preview LinkedIn posts`}
        actions={<GenerateButton platform="linkedin" account={account} />}
      />
      <LinkedInEditor posts={posts || []} />
    </div>
  );
}
