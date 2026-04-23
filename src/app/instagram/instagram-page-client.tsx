"use client";

import { useState } from "react";
import { InstagramEditor } from "./instagram-editor";
import { ReelEditor } from "@/components/instagram/reel-editor";
import { IdeasTab } from "@/components/instagram/ideas-tab";
import { RecreateTab } from "@/components/instagram/recreate-tab";
import { RecreatedTab } from "@/components/instagram/recreated-tab";
import type { GeneratedContent, CarouselSlide, ReelScript, EngagementIdea } from "@/types";

type CarouselPost = GeneratedContent & { carousel_slides: CarouselSlide[] };
type ReelPost = GeneratedContent & { reel_scripts: ReelScript[] };
type RecreatedPost = GeneratedContent & { carousel_slides?: CarouselSlide[]; reel_scripts?: ReelScript[] };

type Tab = "carousels" | "reels" | "ideas" | "recreate" | "recreated";

export function InstagramPageClient({
  carouselPosts,
  reelPosts,
  ideas,
  recreatedPosts,
  account,
}: {
  carouselPosts: CarouselPost[];
  reelPosts: ReelPost[];
  ideas: EngagementIdea[];
  recreatedPosts: RecreatedPost[];
  account: string;
}) {
  const [tab, setTab] = useState<Tab>("carousels");
  const isPersonal = account === "personal";
  const acc = (account === "business" ? "business" : "personal") as "business" | "personal";

  const newIdeaCount = ideas.filter((i) => i.status === "new").length;

  const tabs: { key: Tab; label: string; badge?: number; personalOnly?: boolean }[] = [
    { key: "carousels", label: `Carousels (${carouselPosts.length})` },
    { key: "reels", label: `Reels (${reelPosts.length})`, personalOnly: true },
    { key: "ideas", label: "Ideas", badge: newIdeaCount, personalOnly: true },
    { key: "recreate", label: "Recreate", personalOnly: true },
    { key: "recreated", label: `Recreated (${recreatedPosts.length})`, personalOnly: true },
  ];

  const visibleTabs = tabs.filter((t) => !t.personalOnly || isPersonal);

  return (
    <div>
      <div className="flex gap-2 mb-6 flex-wrap">
        {visibleTabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              tab === t.key
                ? "bg-azen-accent text-azen-bg"
                : "bg-azen-card text-azen-text border border-azen-border hover:text-white"
            }`}
          >
            {t.label}
            {t.badge ? (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${tab === t.key ? "bg-azen-bg/20 text-azen-bg" : "bg-azen-accent text-azen-bg"}`}>
                {t.badge}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {tab === "carousels" && <InstagramEditor posts={carouselPosts} />}
      {tab === "reels" && isPersonal && <ReelEditor posts={reelPosts} />}
      {tab === "ideas" && isPersonal && <IdeasTab ideas={ideas} account={acc} />}
      {tab === "recreate" && isPersonal && <RecreateTab account={acc} />}
      {tab === "recreated" && isPersonal && <RecreatedTab posts={recreatedPosts} />}
    </div>
  );
}
