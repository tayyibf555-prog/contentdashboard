"use client";

import { useState } from "react";
import { WeekView } from "@/components/calendar/week-view";
import { MonthView } from "@/components/calendar/month-view";
import { PillarLegend } from "@/components/calendar/pillar-legend";
import { useAccount } from "@/lib/account-context";
import { rescheduleContent } from "./actions";
import type { GeneratedContent } from "@/types";

export function CalendarView({ posts }: { posts: GeneratedContent[] }) {
  const { account } = useAccount();
  const [view, setView] = useState<"week" | "month">("week");
  const [weekOffset, setWeekOffset] = useState(0);

  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1 + weekOffset * 7);

  const filteredPosts = posts.filter((p) => p.account === account);

  function handleReschedule(contentId: string, newDate: string) {
    rescheduleContent(contentId, newDate);
  }

  return (
    <div>
      <PillarLegend account={account} />

      {/* View Tabs + Navigation */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-4">
          {(["week", "month"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`text-xs font-semibold pb-1 border-b-2 transition-colors ${
                view === v ? "text-azen-accent border-azen-accent" : "text-azen-text border-transparent hover:text-white"
              }`}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
        {view === "week" && (
          <div className="flex items-center gap-3">
            <button onClick={() => setWeekOffset(weekOffset - 1)} className="text-azen-text hover:text-white text-xs">
              Prev
            </button>
            <button onClick={() => setWeekOffset(0)} className="text-azen-accent text-xs font-semibold">
              This Week
            </button>
            <button onClick={() => setWeekOffset(weekOffset + 1)} className="text-azen-text hover:text-white text-xs">
              Next
            </button>
          </div>
        )}
      </div>

      {view === "week" ? (
        <WeekView
          weekStart={weekStart}
          posts={filteredPosts}
          onReschedule={handleReschedule}
        />
      ) : (
        <MonthView
          year={now.getFullYear()}
          month={now.getMonth()}
          posts={filteredPosts}
          onReschedule={handleReschedule}
        />
      )}
    </div>
  );
}
