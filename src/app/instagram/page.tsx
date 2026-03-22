import { TopBar } from "@/components/layout/top-bar";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { InstagramEditor } from "./instagram-editor";

export default async function InstagramPage({ searchParams }: { searchParams: Promise<{ account?: string }> }) {
  const supabase = await createServerSupabaseClient();
  const { account = "business" } = await searchParams;

  const { data: posts } = await supabase
    .from("generated_content")
    .select("*, carousel_slides(*)")
    .eq("platform", "instagram")
    .eq("account", account)
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div>
      <TopBar
        title="Instagram Carousel Builder"
        subtitle={`${account === "business" ? "@azen_ai" : "@tayyib.ai"} · Design and preview carousel posts`}
        actions={
          <button className="bg-azen-accent text-azen-bg px-3.5 py-2 rounded-md text-xs font-semibold">
            Generate New
          </button>
        }
      />
      <InstagramEditor posts={posts || []} />
    </div>
  );
}
