import { TopBar } from "@/components/layout/top-bar";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { InstagramPageClient } from "./instagram-page-client";
import { GenerateButton } from "@/components/content/generate-button";

export default async function InstagramPage({ searchParams }: { searchParams: Promise<{ account?: string }> }) {
  const supabase = await createServerSupabaseClient();
  const { account = "business" } = await searchParams;

  const { data: carouselPosts } = await supabase
    .from("generated_content")
    .select("*, carousel_slides(*)")
    .eq("platform", "instagram")
    .eq("account", account)
    .eq("content_type", "carousel")
    .order("created_at", { ascending: false })
    .limit(20);

  const { data: reelPosts } = await supabase
    .from("generated_content")
    .select("*, reel_scripts(*)")
    .eq("platform", "instagram")
    .eq("account", account)
    .eq("content_type", "reel")
    .order("created_at", { ascending: false })
    .limit(20);

  const { data: ideas } = await supabase
    .from("engagement_ideas")
    .select("*")
    .eq("account", account)
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div>
      <TopBar
        title="Instagram Content"
        subtitle={`${account === "business" ? "@azen_ai" : "@tayyib.ai"} · Carousels${account === "personal" ? " & Reels" : ""}`}
        actions={<GenerateButton platform="instagram" account={account} />}
      />
      <InstagramPageClient
        carouselPosts={carouselPosts || []}
        reelPosts={reelPosts || []}
        ideas={ideas || []}
        account={account}
      />
    </div>
  );
}
