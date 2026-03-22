import { TopBar } from "@/components/layout/top-bar";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { InstagramEditor } from "./instagram-editor";

export default async function InstagramPage() {
  const supabase = await createServerSupabaseClient();

  const { data: posts } = await supabase
    .from("generated_content")
    .select("*, carousel_slides(*)")
    .eq("platform", "instagram")
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div>
      <TopBar
        title="Instagram Carousel Builder"
        subtitle="Design and preview carousel posts"
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
