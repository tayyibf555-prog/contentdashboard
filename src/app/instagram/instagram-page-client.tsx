"use client";

import { useState } from "react";
import { InstagramEditor } from "./instagram-editor";
import { ReelEditor } from "@/components/instagram/reel-editor";
import type { GeneratedContent, CarouselSlide, ReelScript } from "@/types";

type CarouselPost = GeneratedContent & { carousel_slides: CarouselSlide[] };
type ReelPost = GeneratedContent & { reel_scripts: ReelScript[] };

export function InstagramPageClient({
  carouselPosts,
  reelPosts,
  account,
}: {
  carouselPosts: CarouselPost[];
  reelPosts: ReelPost[];
  account: string;
}) {
  const [contentTab, setContentTab] = useState<"carousels" | "reels">("carousels");
  const isPersonal = account === "personal";

  return (
    <div>
      {isPersonal && (
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setContentTab("carousels")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              contentTab === "carousels"
                ? "bg-azen-accent text-azen-bg"
                : "bg-azen-card text-azen-text border border-azen-border hover:text-white"
            }`}
          >
            Carousels ({carouselPosts.length})
          </button>
          <button
            onClick={() => setContentTab("reels")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              contentTab === "reels"
                ? "bg-azen-accent text-azen-bg"
                : "bg-azen-card text-azen-text border border-azen-border hover:text-white"
            }`}
          >
            Reels ({reelPosts.length})
          </button>
        </div>
      )}

      {contentTab === "carousels" || !isPersonal ? (
        <InstagramEditor posts={carouselPosts} />
      ) : (
        <ReelEditor posts={reelPosts} />
      )}
    </div>
  );
}
