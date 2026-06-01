"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { YouTubeEditor } from "./youtube-editor";
import { YouTubeIdeasTab } from "@/components/youtube/youtube-ideas-tab";
import type { GeneratedContent, YoutubeScript, VideoIdea } from "@/types";

type PostWithScript = GeneratedContent & { youtube_scripts: YoutubeScript[] };

type Tab = "scripts" | "ideas";
const VALID_TABS: Tab[] = ["scripts", "ideas"];

export function YouTubePageClient({
  posts,
  ideas,
  account,
}: {
  posts: PostWithScript[];
  ideas: VideoIdea[];
  account: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlTab = searchParams.get("tab") as Tab | null;
  const [tab, setTab] = useState<Tab>(urlTab && VALID_TABS.includes(urlTab) ? urlTab : "scripts");

  useEffect(() => {
    if (urlTab && VALID_TABS.includes(urlTab) && urlTab !== tab) setTab(urlTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlTab]);

  function switchTab(next: Tab) {
    setTab(next);
    const params = new URLSearchParams(searchParams.toString());
    if (next === "scripts") params.delete("tab");
    else params.set("tab", next);
    const query = params.toString();
    router.replace(`${pathname}${query ? `?${query}` : ""}`, { scroll: false });
  }

  const isPersonal = account === "personal";
  const acc = (account === "business" ? "business" : "personal") as "business" | "personal";
  const newIdeaCount = ideas.filter((i) => i.status === "new").length;

  const tabs: { key: Tab; label: string; badge?: number; personalOnly?: boolean }[] = [
    { key: "scripts", label: `Scripts (${posts.length})` },
    { key: "ideas", label: "Ideas", badge: newIdeaCount, personalOnly: true },
  ];
  const visibleTabs = tabs.filter((t) => !t.personalOnly || isPersonal);

  return (
    <div>
      <div className="flex gap-2 mb-6 flex-wrap">
        {visibleTabs.map((t) => (
          <button
            key={t.key}
            onClick={() => switchTab(t.key)}
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

      {tab === "scripts" && <YouTubeEditor posts={posts} />}
      {tab === "ideas" && isPersonal && <YouTubeIdeasTab ideas={ideas} account={acc} />}
    </div>
  );
}
