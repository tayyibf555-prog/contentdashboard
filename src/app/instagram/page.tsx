import { TopBar } from "@/components/layout/top-bar";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { InstagramPageClient } from "./instagram-page-client";
import { GenerateButton } from "@/components/content/generate-button";
import { WinnersButton } from "@/components/content/winners-button";

export default async function InstagramPage({ searchParams }: { searchParams: Promise<{ account?: string }> }) {
  const supabase = await createServerSupabaseClient();
  const { account = "business" } = await searchParams;

  // Fire all queries in parallel — was 4 sequential round-trips
  const [
    carouselResult,
    reelResult,
    ideasResult,
    recreatedResult,
  ] = await Promise.all([
    supabase
      .from("generated_content")
      .select("*, carousel_slides(*)")
      .eq("platform", "instagram")
      .eq("account", account)
      .eq("content_type", "carousel")
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("generated_content")
      .select("*, reel_scripts(*)")
      .eq("platform", "instagram")
      .eq("account", account)
      .eq("content_type", "reel")
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("engagement_ideas")
      .select("*")
      .eq("account", account)
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("generated_content")
      .select("*, carousel_slides(*), reel_scripts(*)")
      .eq("platform", "instagram")
      .eq("account", account)
      .like("source_type", "recreate_%")
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const carouselPosts = carouselResult.data;
  const reelPosts = reelResult.data;
  const ideas = ideasResult.data;
  const recreatedPosts = recreatedResult.data;

  return (
    <div>
      <TopBar
        eyebrow={`${account === "business" ? "@azen_ai" : "@tayyib.ai"}`}
        title="Instagram."
        subtitle={`Carousels${account === "personal" ? ", reels, ideas and recreations" : ""} — everything you're shipping to Instagram.`}
        actions={
          <div className="flex gap-2">
            <WinnersButton platform="instagram" account={account} />
            <GenerateButton platform="instagram" account={account} />
          </div>
        }
      />
      <InstagramPageClient
        carouselPosts={carouselPosts || []}
        reelPosts={reelPosts || []}
        ideas={ideas || []}
        recreatedPosts={recreatedPosts || []}
        account={account}
      />
    </div>
  );
}
